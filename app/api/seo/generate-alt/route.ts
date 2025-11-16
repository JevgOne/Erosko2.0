import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getPhotoAltPrompt, type ProfileData } from '@/lib/seo-agent-prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { profileId, photos, profileData } = await req.json();
    // photos: [{ id, url, index }]
    // profileData: { name, age, city, category }

    const data: ProfileData = {
      name: profileData.name,
      age: profileData.age,
      city: profileData.city,
      category: profileData.category,
      type: 'Profile',
    };

    const prompt = getPhotoAltPrompt(data, photos.length);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
      },
    });

    const geminiResult = await model.generateContent(prompt);
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
