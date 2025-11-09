// Scraper pro dobryprivat.cz
// Extrahuje profily a data podle erosko.cz Prisma schema struktury

import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ScrapedProfile {
  // Basic info
  name: string;
  slug: string;
  age?: number;
  description?: string;
  phone: string;
  email?: string;

  // Location
  city: string;
  address?: string;
  location: string;

  // Profile type
  profileType: 'SOLO' | 'PRIVAT' | 'MASSAGE_SALON' | 'ESCORT_AGENCY';
  category: 'HOLKY_NA_SEX' | 'EROTICKE_MASERKY' | 'DOMINA' | 'DIGITALNI_SLUZBY' | 'EROTICKE_PODNIKY';

  // Physical attributes
  height?: number;
  weight?: number;
  bust?: string;
  hairColor?: string;
  breastType?: string;

  // Additional attributes
  nationality?: string;
  languages?: string[];
  orientation?: string;
  tattoos?: string;
  piercing?: string;

  // Services
  offersEscort: boolean;
  travels: boolean;
  services?: string[];

  // Photos
  photos: Array<{
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
  }>;

  // Reviews
  reviews?: Array<{
    rating: number;
    comment: string;
    createdAt: string;
  }>;

  // Source attribution
  sourceUrl: string;
  sourceSite: 'dobryprivat.cz';

  // Metadata
  scrapedAt: string;
}

const BASE_URL = 'https://www.dobryprivat.cz';
const OUTPUT_DIR = join(__dirname, '../output');

// User agent pro requests
const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

// Vytvoření slug z názvu
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Extrakce věku z textu
function extractAge(text: string): number | undefined {
  const ageMatch = text.match(/(\d{2})\s*let/i) || text.match(/\((\d{2})\)/);
  return ageMatch ? parseInt(ageMatch[1]) : undefined;
}

// Extrakce telefonního čísla
function extractPhone(text: string): string {
  const phoneMatch = text.match(/(\+?\d{3}\s?\d{3}\s?\d{3}\s?\d{3})/);
  return phoneMatch ? phoneMatch[1].replace(/\s/g, '') : '';
}

// Získání seznamu profilů z kategorie
async function getProfileListings(city: string = 'praha'): Promise<string[]> {
  console.log(`📋 Získávám seznam profilů z dobryprivat.cz/divky/${city}...`);

  try {
    const url = `${BASE_URL}/divky/${city}/`;
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const profileUrls: string[] = [];

    // Najdi všechny profily - používá /divka/ v URL
    $('a[href*="/divka/"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
        if (!profileUrls.includes(fullUrl)) {
          profileUrls.push(fullUrl);
        }
      }
    });

    console.log(`✅ Nalezeno ${profileUrls.length} profilů v ${city}`);
    return profileUrls;

  } catch (error) {
    console.error(`❌ Chyba při získávání seznamu profilů z ${city}:`, error);
    return [];
  }
}

// Scraping detailu profilu
async function scrapeProfile(url: string): Promise<ScrapedProfile | null> {
  console.log(`📄 Scraping: ${url}`);

  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    // Základní info
    const name = $('.profil-nazev h1').text().trim() || 'Neznámé jméno';
    const slug = createSlug(name);

    // Věk a další info z textu
    const infoText = $('.profil-info').text();
    const age = extractAge(infoText);

    // Město
    const cityText = $('.profil-mesto').text().trim();
    const city = cityText || 'Praha'; // Default Praha pokud není uvedeno

    // Telefon
    const phoneText = $('.profil-telefon').text();
    const phone = extractPhone(phoneText);

    // Popis
    const description = $('.profil-popis').text().trim() || '';

    // Fotky
    const photos: Array<{ url: string; alt?: string; order: number; isMain: boolean }> = [];
    $('.profil-galerie img').each((index, element) => {
      const src = $(element).attr('src');
      if (src) {
        photos.push({
          url: src.startsWith('http') ? src : BASE_URL + src,
          alt: $(element).attr('alt') || name,
          order: index,
          isMain: index === 0,
        });
      }
    });

    // Parametry (výška, váha, atd.)
    const params: { [key: string]: string } = {};
    $('.profil-parametry tr').each((_, element) => {
      const label = $(element).find('td:first-child').text().trim();
      const value = $(element).find('td:last-child').text().trim();
      params[label] = value;
    });

    // Služby
    const services: string[] = [];
    $('.profil-sluzby li').each((_, element) => {
      const service = $(element).text().trim();
      if (service) services.push(service);
    });

    // Reviews
    const reviews: Array<{ rating: number; comment: string; createdAt: string }> = [];
    $('.profil-recenze .recenze-item').each((_, element) => {
      const ratingStars = $(element).find('.hvezdicky').text().match(/★/g)?.length || 0;
      const comment = $(element).find('.recenze-text').text().trim();
      const dateText = $(element).find('.recenze-datum').text().trim();

      if (comment) {
        reviews.push({
          rating: ratingStars,
          comment,
          createdAt: dateText || new Date().toISOString(),
        });
      }
    });

    // Sestavení profilu
    const profile: ScrapedProfile = {
      name,
      slug,
      age,
      description,
      phone,
      city,
      location: city,
      profileType: 'PRIVAT', // dobryprivat.cz = mainly privates
      category: 'HOLKY_NA_SEX',
      height: params['Výška'] ? parseInt(params['Výška']) : undefined,
      weight: params['Váha'] ? parseInt(params['Váha']) : undefined,
      bust: params['Prsa'],
      hairColor: params['Vlasy'],
      breastType: params['Prsa']?.includes('silikonová') ? 'silicone' : 'natural',
      nationality: params['Národnost'],
      languages: params['Jazyky']?.split(',').map(l => l.trim()),
      orientation: params['Orientace'],
      offersEscort: services.some(s => s.toLowerCase().includes('escort')),
      travels: services.some(s => s.toLowerCase().includes('vyjíždím') || s.toLowerCase().includes('výjezd')),
      services,
      photos,
      reviews,
      sourceUrl: url,
      sourceSite: 'dobryprivat.cz',
      scrapedAt: new Date().toISOString(),
    };

    return profile;

  } catch (error) {
    console.error(`❌ Chyba při scraping ${url}:`, error);
    return null;
  }
}

// Hlavní funkce
async function main() {
  console.log('🚀 Spouštím scraper pro dobryprivat.cz\n');

  // Vytvoř output složku
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Získej profily z různých měst
  const cities = ['praha', 'brno', 'ostrava', 'plzen', 'liberec'];
  let allProfileUrls: string[] = [];

  for (const city of cities) {
    const urls = await getProfileListings(city);
    allProfileUrls = [...allProfileUrls, ...urls];
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Odstranění duplicit
  allProfileUrls = [...new Set(allProfileUrls)];

  console.log(`\n📊 Celkem unikátních profilů: ${allProfileUrls.length}\n`);

  if (allProfileUrls.length === 0) {
    console.log('⚠️  Žádné profily nenalezeny. Ukončuji.');
    return;
  }

  // Scrape všechny profily (s delay aby se nepřetížil server)
  const profiles: ScrapedProfile[] = [];

  for (let i = 0; i < allProfileUrls.length; i++) {
    const url = allProfileUrls[i];
    console.log(`\n[${i + 1}/${allProfileUrls.length}] Processing: ${url}`);

    const profile = await scrapeProfile(url);
    if (profile) {
      profiles.push(profile);
    }

    // Delay 2 sekundy mezi požadavky
    if (i < allProfileUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Ulož výsledky
  const outputFile = join(OUTPUT_DIR, 'dobryprivat-data.json');
  writeFileSync(outputFile, JSON.stringify(profiles, null, 2), 'utf-8');

  console.log(`\n✅ HOTOVO!`);
  console.log(`📊 Celkem staženo: ${profiles.length} profilů`);
  console.log(`💾 Uloženo do: ${outputFile}`);
  console.log(`\nStatistiky:`);
  console.log(`  - S fotkami: ${profiles.filter(p => p.photos.length > 0).length}`);
  console.log(`  - S recenzemi: ${profiles.filter(p => p.reviews && p.reviews.length > 0).length}`);
  console.log(`  - S telefonem: ${profiles.filter(p => p.phone).length}`);
}

// Spuštění
main().catch(console.error);
