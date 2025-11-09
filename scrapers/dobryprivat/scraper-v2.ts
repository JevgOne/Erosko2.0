// Vylepšený scraper pro dobryprivat.cz
// ✅ Fotky
// ✅ Původní kategorie + mapping
// ✅ Confidence scoring
// ✅ Správné HTML selektory

import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://dobryprivat.cz';
const OUTPUT_DIR = join(__dirname, '../output');
const MAX_PROFILES = 10; // Test limit

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

interface ScrapedProfile {
  name: string;
  slug: string;
  age?: number;
  description?: string;
  phone: string;
  email?: string;
  city: string;
  location: string;

  // Naše kategorie
  profileType: string;
  category: string;

  // Původní data
  source_original_category?: string;
  source_original_tags?: string[];
  category_confidence?: 'high' | 'medium' | 'low';
  needs_manual_review?: boolean;

  photos: Array<{ url: string; alt?: string; order: number; isMain: boolean; }>;
  services?: string[];
  offersEscort: boolean;
  travels: boolean;

  sourceUrl: string;
  sourceSite: 'dobryprivat.cz';
  scrapedAt: string;
}

function createSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractAge(text: string): number | undefined {
  const matches = text.match(/(\d{2})\s*let/i);
  return matches ? parseInt(matches[1]) : undefined;
}

function extractPhone(text: string): string {
  const matches = text.match(/(\+?\d{3}\s?\d{3}\s?\d{3}\s?\d{3})/);
  return matches ? matches[1].replace(/\s/g, '') : '';
}

// Mapování kategorií
function mapCategory(originalCategory: string, tags: string[] = []) {
  const categoryLower = originalCategory.toLowerCase();

  // Masáže
  if (categoryLower.includes('masáž') || categoryLower.includes('masaz')) {
    return {
      profileType: 'MASSAGE_SALON',
      category: 'EROTICKE_MASERKY',
      confidence: 'high' as const,
      needsReview: false,
    };
  }

  // BDSM / Domina
  if (categoryLower.includes('bdsm') || categoryLower.includes('domina')) {
    return {
      profileType: 'PRIVAT',
      category: 'DOMINA',
      confidence: 'high' as const,
      needsReview: false,
    };
  }

  // Podniky
  if (categoryLower.includes('podnik') || categoryLower.includes('club') || categoryLower.includes('salon')) {
    return {
      profileType: 'NIGHT_CLUB',
      category: 'EROTICKE_PODNIKY',
      confidence: 'medium' as const,
      needsReview: true, // Potřebuje manuální review - může být různé typy podniků
    };
  }

  // Default: Dívky / Priváty
  return {
    profileType: 'PRIVAT',
    category: 'HOLKY_NA_SEX',
    confidence: 'high' as const,
    needsReview: false,
  };
}

async function getProfileListings(): Promise<Array<{url: string, category: string}>> {
  console.log(`📋 Získávám ${MAX_PROFILES} profilů z dobryprivat.cz...\n`);

  const categories = [
    { path: '/divky/praha/', name: 'Dívky' },
    { path: '/eroticke-masaze/', name: 'Erotické masáže' },
    { path: '/bdsm/', name: 'BDSM' },
  ];

  const results: Array<{url: string, category: string}> = [];

  for (const cat of categories) {
    if (results.length >= MAX_PROFILES) break;

    try {
      const response = await axios.get(BASE_URL + cat.path, { headers });
      const $ = cheerio.load(response.data);

      $('a[href*="/divka/"]').each((_, element) => {
        if (results.length >= MAX_PROFILES) return false;

        const href = $(element).attr('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
          if (!results.find(r => r.url === fullUrl)) {
            results.push({
              url: fullUrl,
              category: cat.name,
            });
          }
        }
      });

      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`❌ Chyba v kategorii ${cat.name}:`, error);
    }
  }

  return results.slice(0, MAX_PROFILES);
}

async function scrapeProfile(url: string, originalCategory: string): Promise<ScrapedProfile | null> {
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    // NÁZEV - různé možné selektory
    const name =
      $('h1.entry-title').text().trim() ||
      $('.profil-nazev h1').text().trim() ||
      $('h1').first().text().trim() ||
      $('.profile-name').text().trim() ||
      'Neznámé jméno';

    // FOTKY - všechny možné selektory
    const photos: Array<{ url: string; alt?: string; order: number; isMain: boolean; }> = [];

    // Různé možné selektory pro gallery
    const photoSelectors = [
      '.gallery img',
      '.profil-galerie img',
      '.wp-block-gallery img',
      '.fotorama img',
      'img[src*="upload"]',
      '.entry-content img',
    ];

    let photoIndex = 0;
    for (const selector of photoSelectors) {
      $(selector).each((_, element) => {
        const src = $(element).attr('src') || $(element).attr('data-src');
        if (src && !src.includes('logo') && !src.includes('banner')) {
          const fullUrl = src.startsWith('http') ? src : BASE_URL + src;
          if (!photos.find(p => p.url === fullUrl)) {
            photos.push({
              url: fullUrl,
              alt: $(element).attr('alt') || name,
              order: photoIndex++,
              isMain: photoIndex === 1,
            });
          }
        }
      });

      if (photos.length > 0) break; // Máme fotky, stop
    }

    // TAGY
    const tags: string[] = [];
    $('.tag, .badge, .label, .pill').each((_, element) => {
      const tag = $(element).text().trim();
      if (tag) tags.push(tag);
    });

    // SLUŽBY
    const services: string[] = [];
    $('.services li, .sluzby li, .nabidka li').each((_, element) => {
      const service = $(element).text().trim();
      if (service) services.push(service);
    });

    const bodyText = $('body').text();
    const age = extractAge(bodyText);
    const phone = extractPhone(bodyText);

    // Mapování kategorie
    const mapping = mapCategory(originalCategory, tags);

    // Popis
    const description =
      $('.entry-content p').first().text().trim() ||
      $('.profil-popis').text().trim() ||
      $('.description').text().trim() ||
      '';

    return {
      name,
      slug: createSlug(name),
      age,
      phone,
      city: 'Praha', // TODO: extrahovat z obsahu
      location: 'Praha',

      // Naše mapování
      profileType: mapping.profileType,
      category: mapping.category,

      // Původní data
      source_original_category: originalCategory,
      source_original_tags: tags.length > 0 ? tags : undefined,
      category_confidence: mapping.confidence,
      needs_manual_review: mapping.needsReview,

      description,
      photos,
      services: services.length > 0 ? services : undefined,
      offersEscort: bodyText.toLowerCase().includes('escort'),
      travels: bodyText.toLowerCase().includes('výjezd') || bodyText.toLowerCase().includes('vyjíždím'),

      sourceUrl: url,
      sourceSite: 'dobryprivat.cz',
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ ${url}:`, error);
    return null;
  }
}

async function main() {
  console.log(`🚀 VYLEPŠENÝ scraper (max ${MAX_PROFILES} profilů)\n`);
  console.log(`✅ Fotky: ANO`);
  console.log(`✅ Původní kategorie: ANO`);
  console.log(`✅ Confidence scoring: ANO\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const profileListings = await getProfileListings();
  const profiles: ScrapedProfile[] = [];

  for (let i = 0; i < profileListings.length; i++) {
    const { url, category } = profileListings[i];
    console.log(`[${i + 1}/${profileListings.length}] ${category}: ${url}`);

    const profile = await scrapeProfile(url, category);
    if (profile) {
      profiles.push(profile);
      console.log(`  ✅ ${profile.name} | ${profile.photos.length} fotek | ${profile.profileType} / ${profile.category} (${profile.category_confidence})`);
    }

    if (i < profileListings.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const outputFile = join(OUTPUT_DIR, 'dobryprivat-v2.json');
  writeFileSync(outputFile, JSON.stringify(profiles, null, 2), 'utf-8');

  console.log(`\n✅ Úspěšně staženo ${profiles.length}/${MAX_PROFILES} profilů`);
  console.log(`📊 Statistiky:`);
  console.log(`  - S fotkami: ${profiles.filter(p => p.photos.length > 0).length}`);
  console.log(`  - S telefonem: ${profiles.filter(p => p.phone).length}`);
  console.log(`  - Needs review: ${profiles.filter(p => p.needs_manual_review).length}`);
  console.log(`  - High confidence: ${profiles.filter(p => p.category_confidence === 'high').length}`);
  console.log(`💾 ${outputFile}`);
}

main().catch(console.error);
