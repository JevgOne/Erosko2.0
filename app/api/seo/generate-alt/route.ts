import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { profileId, photos, profileData } = await req.json();
    // photos: [{ id, url, index }]
    // profileData: { name, age, city, category }

    const categoryKeywords: Record<string, string[]> = {
      HOLKY_NA_SEX: ['holky na sex', 'společnice', 'call girls'],
      EROTICKE_MASERKY: ['erotické masáže', 'tantra masáž', 'masérka'],
      DOMINA: ['domina', 'BDSM', 'femdom'],
      DIGITALNI_SLUZBY: ['webcam', 'online služby', 'videochat'],
    };

    const keywords = categoryKeywords[profileData.category as keyof typeof categoryKeywords] || [];

    const prompt = `
You are an SEO expert analyzing images for adult service profiles on erosko.cz.

Profile info:
- Name: ${profileData.name}
- Age: ${profileData.age || 'N/A'}
- Category: ${profileData.category} (keywords: ${keywords.join(', ')})
- City: ${profileData.city}

Generate SEO-optimized ALT text for ${photos.length} photos.

Requirements for ALT text:
1. Format variations (use different for each photo):
   - Photo 1: "{name}, {age} let - {category} {city} - Ověřený profil"
   - Photo 2: "Fotka {name} - {category} {city}"
   - Photo 3: "{name} - {category} {city} - reálné fotky"
   - Photo 4: "Profil {name} - {category} {city} - profesionální fotografie"
   (repeat pattern if more photos)
2. Each photo MUST have unique ALT (not duplicate)
3. Include keywords naturally
4. Max 125 characters per ALT
5. Must be in Czech language
6. Quality score (0-100): rate each ALT based on:
   - Keyword inclusion (40 points)
   - Length optimization (30 points)
   - Uniqueness (30 points)

Output as JSON:
{
  "photos": [
    {
      "id": "photo-id-1",
      "alt": "Lucie, 25 let - holky na sex Praha - Ověřený profil",
      "quality_score": 92
    },
    {
      "id": "photo-id-2",
      "alt": "Fotka Lucie - společnice Praha",
      "quality_score": 88
    }
  ]
}
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
      },
    });

    const fullPrompt = `You are an SEO expert. Always respond with valid JSON only.\n\n${prompt}`;
    const geminiResult = await model.generateContent(fullPrompt);
    const response = await geminiResult.response;
    let text = response.text();

    // Remove markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      text = jsonMatch[1];
    }

    const result = JSON.parse(text);

    // Validate result
    if (!result.photos || !Array.isArray(result.photos)) {
      throw new Error('Invalid AI response format');
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('SEO ALT Generation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate ALT texts'
      },
      { status: 500 }
    );
  }
}
