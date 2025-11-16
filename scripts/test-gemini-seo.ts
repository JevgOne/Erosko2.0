import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function testGeminiSEO() {
  console.log('🧪 Testing Gemini SEO Generation...\n');

  const testProfile = {
    name: 'Lucie',
    age: 25,
    city: 'Praha',
    category: 'HOLKY_NA_SEX',
  };

  const prompt = `
You are an expert SEO copywriter for adult services in Czech Republic (erosko.cz).

Generate SEO-optimized metadata for this profile:
${JSON.stringify(testProfile, null, 2)}

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

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
      },
    });

    console.log('📡 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Raw response:', text);

    // Remove markdown code blocks if present
    let cleanText = text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      cleanText = jsonMatch[1];
    }

    const parsed = JSON.parse(cleanText);

    console.log('\n📊 Parsed SEO Data:');
    console.log('Title:', parsed.title);
    console.log('Description A:', parsed.descriptions[0]);
    console.log('Description B:', parsed.descriptions[1]);
    console.log('Description C:', parsed.descriptions[2]);
    console.log('Keywords:', parsed.keywords);
    console.log('Quality Score:', parsed.quality_score);

    console.log('\n✅ Gemini test SUCCESSFUL!');
  } catch (error) {
    console.error('❌ Gemini test FAILED:', error);
  }
}

testGeminiSEO().catch(console.error);
