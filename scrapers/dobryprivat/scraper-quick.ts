// Rychlý testovací scraper pro dobryprivat.cz (POUZE 10 profilů)
// Pro úplný scraping použij scraper.ts

import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mapCategory } from '../types/scraped-profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import typu z hlavního scraperu
interface ScrapedProfile {
  name: string;
  slug: string;
  age?: number;
  description?: string;
  phone: string;
  email?: string;
  city: string;
  address?: string;
  location: string;
  profileType: 'SOLO' | 'PRIVAT' | 'MASSAGE_SALON' | 'ESCORT_AGENCY';
  category: 'HOLKY_NA_SEX' | 'EROTICKE_MASERKY' | 'DOMINA' | 'DIGITALNI_SLUZBY' | 'EROTICKE_PODNIKY';
  height?: number;
  weight?: number;
  bust?: string;
  hairColor?: string;
  breastType?: string;
  nationality?: string;
  languages?: string[];
  orientation?: string;
  tattoos?: string;
  piercing?: string;
  offersEscort: boolean;
  travels: boolean;
  services?: string[];
  photos: Array<{ url: string; alt?: string; order: number; isMain: boolean; }>;
  reviews?: Array<{ rating: number; comment: string; createdAt: string; }>;
  sourceUrl: string;
  sourceSite: 'dobryprivat.cz';
  scrapedAt: string;
}

const BASE_URL = 'https://dobryprivat.cz';
const OUTPUT_DIR = join(__dirname, '../output');
const MAX_PROFILES = 10; // Limit pro test

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

function createSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function getProfileListings(): Promise<string[]> {
  console.log(`📋 Získávám ${MAX_PROFILES} profilů z dobryprivat.cz/divky/praha...\n`);

  const response = await axios.get(`${BASE_URL}/divky/praha/`, { headers });
  const $ = cheerio.load(response.data);
  const profileUrls: string[] = [];

  $('a[href*="/divka/"]').each((_, element) => {
    const href = $(element).attr('href');
    if (href && profileUrls.length < MAX_PROFILES) {
      const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
      if (!profileUrls.includes(fullUrl)) profileUrls.push(fullUrl);
    }
  });

  return profileUrls.slice(0, MAX_PROFILES);
}

async function scrapeProfile(url: string): Promise<ScrapedProfile | null> {
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const name = $('h1').first().text().trim() || 'Neznámé jméno';
    const bodyText = $('body').text();

    const ageMatch = bodyText.match(/(\d{2})\s*let/i);
    const phoneMatch = bodyText.match(/(\+?\d{3}\s?\d{3}\s?\d{3}\s?\d{3})/);

    return {
      name,
      slug: createSlug(name),
      age: ageMatch ? parseInt(ageMatch[1]) : undefined,
      phone: phoneMatch ? phoneMatch[1].replace(/\s/g, '') : '',
      city: 'Praha',
      location: 'Praha',
      profileType: 'PRIVAT',
      category: 'HOLKY_NA_SEX',
      description: $('.entry-content p').first().text().trim() || '',
      offersEscort: false,
      travels: false,
      photos: [],
      sourceUrl: url,
      sourceSite: 'dobryprivat.cz',
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ ${url}`);
    return null;
  }
}

async function main() {
  console.log(`🚀 TESTOVACÍ scraper (max ${MAX_PROFILES} profilů)\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const profileUrls = await getProfileListings();
  const profiles: ScrapedProfile[] = [];

  for (let i = 0; i < profileUrls.length; i++) {
    const url = profileUrls[i];
    console.log(`[${i + 1}/${profileUrls.length}] ${url}`);

    const profile = await scrapeProfile(url);
    if (profile) profiles.push(profile);

    if (i < profileUrls.length - 1) await new Promise(r => setTimeout(r, 1000));
  }

  const outputFile = join(OUTPUT_DIR, 'dobryprivat-sample.json');
  writeFileSync(outputFile, JSON.stringify(profiles, null, 2), 'utf-8');

  console.log(`\n✅ Úspěšně staženo ${profiles.length}/${MAX_PROFILES} profilů`);
  console.log(`💾 ${outputFile}`);
}

main().catch(console.error);
