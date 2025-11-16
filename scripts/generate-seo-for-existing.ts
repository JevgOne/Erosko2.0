import { createClient } from '@libsql/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Import professional SEO prompt
const getProfileSEOPrompt = (data: any): string => {
  const profileType = data.type || 'Profile';

  return `
You are an ELITE SEO SPECIALIST with 15+ years of experience in Czech online marketing.

**CRITICAL RULES:**
- NEVER use generic "erotické služby" for businesses
- For EROTICKE_PODNIKY businesses → use "erotický podnik", "salon", "klub", "privát"
- For HOLKY_NA_SEX profiles → use "společnice", "escort", "holky na sex"
- ALWAYS include city in title AND description
- Perfect Czech grammar (no machine translation)

**Profile Data:**
Type: ${profileType}
Name: ${data.name}
Age: ${data.age}
City: ${data.city}
Category: ${data.category}

**Task:** Generate professional SEO metadata.

**Output JSON:**
{
  "title": "...",
  "descriptions": ["Variant A", "Variant B", "Variant C"],
  "keywords": "keyword1, keyword2, ...",
  "quality_score": 85
}

Requirements:
- Title max 60 chars: "${data.name} ${data.age} let | [SPECIFIC SERVICE] ${data.city} | EROSKO.CZ"
- Descriptions 150-160 chars each (A=emotional, B=factual, C=benefits)
- 12-15 keywords
- Perfect Czech language
- Quality score 0-100

Generate now:
`;
};

async function generateSEOForProfile(profile: any) {
  console.log(`\n🔄 Generating SEO for: ${profile.name} (${profile.city})`);

  const metaPrompt = getProfileSEOPrompt({
    name: profile.name,
    age: profile.age,
    city: profile.city,
    category: profile.category,
    type: profile.type || 'Profile',
  });

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
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
      },
    });

    const geminiResult = await model.generateContent(metaPrompt);
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
