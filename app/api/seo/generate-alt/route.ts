import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    // Extract JSON from Claude's response
    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    let result;
    try {
      result = JSON.parse(textContent.text);
    } catch (e) {
      // If Claude wrapped JSON in markdown, extract it
      const jsonMatch = textContent.text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not parse Claude response as JSON');
      }
    }

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
