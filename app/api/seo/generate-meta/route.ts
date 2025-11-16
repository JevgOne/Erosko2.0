import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json();
    // type: "profile" | "business"
    // data: { name, age?, city, category, services?, description? }

    const prompt = `
You are an expert SEO copywriter for adult services in Czech Republic (erosko.cz).

Generate SEO-optimized metadata for this ${type}:
${JSON.stringify(data, null, 2)}

Requirements:
1. META title: Max 60 chars, include name + main keyword + city + " | EROSKO.CZ"
2. META descriptions: Generate 3 variants (150-160 chars each):
   - Variant A (emotional): Use emoji, emotional language, "Ověřený profil" if applicable
   - Variant B (factual): Professional, factual description with services
   - Variant C (benefits): Focus on advantages, "Bez zprostředkovatele", "Přímý kontakt"
3. Keywords: 12-15 keywords mixing:
   - Name + city combinations
   - Main service + city
   - Long-tail keywords (e.g., "diskrétní holky na sex praha")
   - Category-specific terms
4. MUST be in Czech language
5. Use location-based keywords for local SEO
6. Quality score: Rate 0-100 based on keyword density, length optimization, uniqueness

Category keywords mapping:
- HOLKY_NA_SEX: "holky na sex", "společnice", "call girls", "sex holky"
- EROTICKE_MASERKY: "erotické masáže", "tantra masáž", "body to body", "erotická masérka"
- DOMINA: "domina", "BDSM", "femdom", "mistress", "SM privát"
- DIGITALNI_SLUZBY: "webcam", "videochat", "phone sex", "online"

Output as JSON:
{
  "title": "...",
  "descriptions": ["Variant A", "Variant B", "Variant C"],
  "keywords": "keyword1, keyword2, keyword3, ...",
  "quality_score": 85
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert SEO copywriter. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Validate result
    if (!result.title || !result.descriptions || !Array.isArray(result.descriptions) || result.descriptions.length !== 3) {
      throw new Error('Invalid AI response format');
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('SEO Meta Generation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate SEO metadata'
      },
      { status: 500 }
    );
  }
}
