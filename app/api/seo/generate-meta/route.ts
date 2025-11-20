import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getProfileSEOPrompt, type ProfileData } from '@/lib/seo-agent-prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json();
    // type: "profile" | "business"
    // data: { name, age?, city, category, services?, description?, verified? }

    const profileData: ProfileData = {
      name: data.name,
      age: data.age,
      city: data.city,
      category: data.category,
      type: type === 'profile' ? 'Profile' : 'Business',
      services: data.services,
      description: data.description,
      verified: data.verified,
    };

    const prompt = getProfileSEOPrompt(profileData);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8, // Increased for more creative, natural Czech language
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
