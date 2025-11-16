import { createClient } from '@libsql/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const categoryKeywords: Record<string, string[]> = {
  HOLKY_NA_SEX: ['holky na sex', 'společnice', 'call girls'],
  EROTICKE_MASERKY: ['erotické masáže', 'tantra masáž', 'masérka'],
  DOMINA: ['domina', 'BDSM', 'femdom'],
  DIGITALNI_SLUZBY: ['webcam', 'online služby', 'videochat'],
};

async function generateSEOForProfile(profile: any) {
  console.log(`\n🔄 Generating SEO for: ${profile.name} (${profile.city})`);

  const keywords = categoryKeywords[profile.category as keyof typeof categoryKeywords] || [];

  // Step 1: Generate META tags with Claude
  const metaPrompt = `
You are an expert SEO copywriter for adult services in Czech Republic (erosko.cz).

Generate SEO-optimized metadata for this profile:
- Name: ${profile.name}
- Age: ${profile.age}
- City: ${profile.city}
- Category: ${profile.category} (keywords: ${keywords.join(', ')})

Requirements:
1. META title: Max 60 chars, include name + main keyword + city + " | EROSKO.CZ"
2. META descriptions: Generate 3 variants (150-160 chars each):
   - Variant A (emotional): Use emoji, emotional language, "Ověřený profil"
   - Variant B (factual): Professional, factual description with services
   - Variant C (benefits): Focus on "Bez zprostředkovatele", "Přímý kontakt"
3. Keywords: 12-15 keywords
4. MUST be in Czech language
5. Quality score: Rate 0-100

Output as JSON:
{
  "title": "...",
  "descriptions": ["Variant A", "Variant B", "Variant C"],
  "keywords": "keyword1, keyword2, keyword3, ...",
  "quality_score": 85
}
`;

  let seoTitle = null;
  let seoDescriptionA = null;
  let seoDescriptionB = null;
  let seoDescriptionC = null;
  let seoKeywords = null;
  let seoQualityScore = null;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
      },
    });

    const fullPrompt = `You are an expert SEO copywriter. Always respond with valid JSON only.\n\n${metaPrompt}`;
    const geminiResult = await model.generateContent(fullPrompt);
    const response = await geminiResult.response;
    let resultText = response.text();

    // Remove markdown code blocks if present
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      resultText = jsonMatch[1];
    }

    const result = JSON.parse(resultText);

    if (result) {

      seoTitle = result.title;
      seoDescriptionA = result.descriptions?.[0];
      seoDescriptionB = result.descriptions?.[1];
      seoDescriptionC = result.descriptions?.[2];
      seoKeywords = result.keywords;
      seoQualityScore = result.quality_score;

      console.log(`  ✅ META: ${seoTitle?.substring(0, 50)}...`);
      console.log(`  📊 Quality Score: ${seoQualityScore}/100`);
    }
  } catch (error) {
    console.error('  ❌ Gemini failed:', error);
  }

  // Step 2: Generate OG Image URL
  const ogImageUrl = `https://erosko.cz/api/seo/generate-og-image?name=${encodeURIComponent(profile.name)}&city=${encodeURIComponent(profile.city)}&category=${profile.category}&age=${profile.age}&verified=false`;

  // Step 3: Update database
  try {
    await client.execute({
      sql: `UPDATE Profile SET
        seoTitle = ?,
        seoDescriptionA = ?,
        seoDescriptionB = ?,
        seoDescriptionC = ?,
        seoKeywords = ?,
        seoQualityScore = ?,
        ogImageUrl = ?,
        seoLastGenerated = ?,
        seoActiveVariant = 'A'
      WHERE id = ?`,
      args: [
        seoTitle,
        seoDescriptionA,
        seoDescriptionB,
        seoDescriptionC,
        seoKeywords,
        seoQualityScore,
        ogImageUrl,
        new Date().toISOString(),
        profile.id
      ]
    });

    console.log(`  💾 Saved to database`);
    return true;
  } catch (error) {
    console.error('  ❌ Database update failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting SEO generation for existing profiles...\n');

  // Get all profiles without SEO
  const result = await client.execute('SELECT * FROM Profile WHERE seoTitle IS NULL');
  const profiles = result.rows;

  console.log(`Found ${profiles.length} profiles without SEO\n`);

  let success = 0;
  let failed = 0;

  for (const profile of profiles) {
    const ok = await generateSEOForProfile(profile);
    if (ok) {
      success++;
    } else {
      failed++;
    }

    // Wait 2 seconds between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);
}

main().catch(console.error);
