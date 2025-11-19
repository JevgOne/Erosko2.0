import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAUKemEjooWExY-em3ygdg8JWq-BN82XQ4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface BusinessData {
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  description?: string;
  openingHours?: string;
  profileType: 'MASSAGE' | 'PRIVATE';
  profiles: ProfileData[];
}

interface ProfileData {
  name: string;
  age?: number;
  phone?: string;
  city?: string;
  description?: string;
  services?: string[];
  photos?: string[];
  category?: string;
}

export class ContentImporter {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * Fetch HTML content from URL
   */
  private async fetchHTML(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    return await response.text();
  }

  /**
   * Extract business data from HTML using Gemini AI
   */
  async extractBusinessData(url: string): Promise<BusinessData> {
    const html = await this.fetchHTML(url);

    const prompt = `
You are a data extraction AI. Analyze this HTML and extract business information.

Extract the following data in JSON format:
{
  "name": "Business name",
  "phone": "Phone number (format: +420XXXXXXXXX)",
  "email": "Email address",
  "website": "Website URL",
  "address": "Full address",
  "city": "City name",
  "description": "Business description in Czech",
  "openingHours": "Opening hours text",
  "profileType": "MASSAGE or PRIVATE",
  "profiles": [
    {
      "name": "Profile name",
      "age": 25,
      "profileUrl": "Full URL to profile detail page"
    }
  ]
}

IMPORTANT:
- Extract ALL profiles/people listed on this page
- For each profile, include the FULL URL to their detail page
- Profile type: Use "MASSAGE" if this is a massage business, "PRIVATE" for private/escort
- Return ONLY valid JSON, no explanations

HTML:
${html.substring(0, 50000)}
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const data = JSON.parse(jsonMatch[0]);
    return data;
  }

  /**
   * Extract profile data from HTML using Gemini AI
   */
  async extractProfileData(url: string): Promise<ProfileData> {
    const html = await this.fetchHTML(url);

    const prompt = `
You are a data extraction AI. Analyze this HTML and extract profile information.

Extract the following data in JSON format:
{
  "name": "Profile name",
  "age": 25,
  "phone": "Phone number (format: +420XXXXXXXXX)",
  "city": "City name",
  "description": "Profile description in Czech",
  "services": ["Service 1", "Service 2", ...],
  "photos": ["photo_url_1", "photo_url_2", ...],
  "category": "Category name"
}

IMPORTANT:
- Extract ALL photo URLs (full URLs, not relative paths)
- Extract ALL services/offerings listed
- Keep description in Czech
- Return ONLY valid JSON, no explanations

HTML:
${html.substring(0, 50000)}
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const data = JSON.parse(jsonMatch[0]);
    return data;
  }

  /**
   * Map external services to Erosko service IDs
   */
  async mapServices(externalServices: string[]): Promise<string[]> {
    // Get all available services from database
    const availableServices = [
      'Classic massage', 'Thai massage', 'Erotic massage', 'Tantric massage',
      'Sport massage', 'Relaxation massage', 'Oil massage', 'Nuru massage',
      'Prostate massage', 'Duo massage', 'Body to body', 'Happy ending',
      'Escort', 'GFE', 'PSE', 'Dinner date', 'Travel companion',
      'Striptease', 'Role play', 'Domination', 'BDSM', 'Fetish'
    ];

    const prompt = `
You are a service mapping AI. Map the following external services to our available services.

External services: ${JSON.stringify(externalServices)}
Available services: ${JSON.stringify(availableServices)}

Return a JSON array of matched services (exact names from Available services).
If a service has no match, omit it.
Return ONLY the JSON array, no explanations.

Example output: ["Classic massage", "Happy ending", "Escort"]
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    const mappedServices = JSON.parse(jsonMatch[0]);
    return mappedServices;
  }
}
