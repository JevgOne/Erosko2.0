/**
 * SEO Automation Helper
 *
 * Automatically generates SEO metadata for profiles and businesses
 * using OpenAI (META tags) and Claude (ALT texts)
 *
 * Domain is detected automatically from HTTP request headers
 */

import { getCurrentDomain, type Domain } from './domain-utils';

interface ProfileData {
  id: string;
  name: string;
  age: number;
  city: string;
  category: string;
  description?: string | null;
  services?: Array<{ service: { name: string } }>;
}

interface PhotoData {
  id: string;
  url: string;
  order: number;
}

interface SEOResult {
  success: boolean;
  seoTitle?: string;
  seoDescriptionA?: string;
  seoDescriptionB?: string;
  seoDescriptionC?: string;
  seoKeywords?: string;
  seoQualityScore?: number;
  ogImageUrl?: string;
  photoAlts?: Array<{ id: string; alt: string; altQualityScore: number }>;
  error?: string;
}

/**
 * Generate complete SEO for a profile
 * Calls OpenAI for META, generates OG image URL, and calls Claude for ALT texts
 * Domain is detected automatically from HTTP request headers
 */
export async function generateProfileSEO(
  profile: ProfileData,
  photos: PhotoData[] = []
): Promise<SEOResult> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Detect current domain from request headers
    const domain = getCurrentDomain();

    // Step 1: Generate META tags using OpenAI
    let metaData: any = {};
    try {
      const metaResponse = await fetch(`${baseUrl}/api/seo/generate-meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          domain, // Add domain to request
          data: {
            name: profile.name,
            age: profile.age,
            city: profile.city,
            category: profile.category,
            description: profile.description,
            services: profile.services?.map(s => s.service.name) || [],
          },
        }),
      });

      if (metaResponse.ok) {
        const result = await metaResponse.json();
        if (result.success && result.data) {
          metaData = result.data;
        }
      }
    } catch (error) {
      console.error('META generation failed:', error);
      // Continue even if META fails
    }

    // Step 2: Generate OG Image URL (dynamic URL, not actual generation)
    const ogImageUrl = `${baseUrl}/api/seo/generate-og-image?name=${encodeURIComponent(profile.name)}&city=${encodeURIComponent(profile.city)}&category=${profile.category}&age=${profile.age}&verified=false&domain=${domain}`;

    // Step 3: Generate ALT texts using Claude (only if photos exist)
    let photoAlts: Array<{ id: string; alt: string; altQualityScore: number }> = [];
    if (photos.length > 0) {
      try {
        const altResponse = await fetch(`${baseUrl}/api/seo/generate-alt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: profile.id,
            photos: photos.map(p => ({ id: p.id, url: p.url, index: p.order })),
            profileData: {
              name: profile.name,
              age: profile.age,
              city: profile.city,
              category: profile.category,
            },
          }),
        });

        if (altResponse.ok) {
          const result = await altResponse.json();
          if (result.success && result.data?.photos) {
            photoAlts = result.data.photos.map((p: any) => ({
              id: p.id,
              alt: p.alt,
              altQualityScore: p.quality_score || 0,
            }));
          }
        }
      } catch (error) {
        console.error('ALT generation failed:', error);
        // Continue even if ALT fails
      }
    }

    return {
      success: true,
      seoTitle: metaData.title || null,
      seoDescriptionA: metaData.descriptions?.[0] || null,
      seoDescriptionB: metaData.descriptions?.[1] || null,
      seoDescriptionC: metaData.descriptions?.[2] || null,
      seoKeywords: metaData.keywords || null,
      seoQualityScore: metaData.quality_score || null,
      ogImageUrl,
      photoAlts,
    };
  } catch (error: any) {
    console.error('SEO automation error:', error);
    return {
      success: false,
      error: error.message || 'SEO generation failed',
    };
  }
}

/**
 * Generate complete SEO for a business
 * Calls OpenAI for META and generates OG image URL
 * Domain is detected automatically from HTTP request headers
 */
export async function generateBusinessSEO(business: {
  id: string;
  name: string;
  city: string;
  profileType: string;
  description?: string | null;
}): Promise<SEOResult> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Detect current domain from request headers
    const domain = getCurrentDomain();

    // Step 1: Generate META tags using OpenAI
    let metaData: any = {};
    try {
      const metaResponse = await fetch(`${baseUrl}/api/seo/generate-meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'business',
          domain, // Add domain to request
          data: {
            name: business.name,
            city: business.city,
            type: business.profileType,
            description: business.description,
          },
        }),
      });

      if (metaResponse.ok) {
        const result = await metaResponse.json();
        if (result.success && result.data) {
          metaData = result.data;
        }
      }
    } catch (error) {
      console.error('META generation failed:', error);
    }

    // Step 2: Generate OG Image URL
    const ogImageUrl = `${baseUrl}/api/seo/generate-og-image?name=${encodeURIComponent(business.name)}&city=${encodeURIComponent(business.city)}&category=${business.profileType}&verified=false&domain=${domain}`;

    return {
      success: true,
      seoTitle: metaData.title || null,
      seoDescriptionA: metaData.descriptions?.[0] || null, // Use first variant for businesses
      seoKeywords: metaData.keywords || null,
      seoQualityScore: metaData.quality_score || null,
      ogImageUrl,
    };
  } catch (error: any) {
    console.error('Business SEO automation error:', error);
    return {
      success: false,
      error: error.message || 'SEO generation failed',
    };
  }
}
