// TEST VERZE - Scraper pro eroguide.cz (pouze 10 profilů)
// Next.js aplikace s SSR, extrahuje profily a data

import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  photos: Array<{
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
  }>;
  reviews?: Array<{
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  sourceUrl: string;
  sourceSite: 'eroguide.cz';
  scrapedAt: string;
}

const BASE_URL = 'https://www.eroguide.cz';
const OUTPUT_DIR = join(__dirname, '../output');
const MAX_PROFILES = 10; // TEST LIMIT

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'cs,en;q=0.9',
};

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractAge(text: string): number | undefined {
  const ageMatch = text.match(/(\d{2})\s*let/i) || text.match(/\((\d{2})\)/) || text.match(/věk[:\s]*(\d{2})/i);
  return ageMatch ? parseInt(ageMatch[1]) : undefined;
}

function extractPhone(text: string): string {
  const phoneMatch = text.match(/(\+?\d{3}\s?\d{3}\s?\d{3}\s?\d{3})/);
  return phoneMatch ? phoneMatch[1].replace(/\s/g, '') : '';
}

// Získání seznamu profilů z kategorie
async function getProfileListings(category: string = ''): Promise<string[]> {
  console.log(`📋 Získávám seznam profilů z eroguide.cz/${category}...`);

  try {
    const url = category ? `${BASE_URL}/${category}` : BASE_URL;
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const profileUrls: string[] = [];

    // Eroguide používá přímé slug odkazy (např. /sara-ariana-lomonn)
    // Filtrujeme odkazy které jsou slug (ne kategorie)
    $('a').each((_, element) => {
      const href = $(element).attr('href');

      if (href && href.startsWith('/') && !href.includes('?')) {
        // Vyřadíme kategorie a systémové stránky
        const isCategory = href === '/' || href === '/oblibene' || href.includes('/auth') ||
                          href === '/holky-na-sex' || href === '/eroticke-maserky' ||
                          href.includes('/escort') || href.includes('/privat');

        if (!isCategory && href.length > 1) {
          // Toto je pravděpodobně profil
          const fullUrl = BASE_URL + href;
          if (!profileUrls.includes(fullUrl)) {
            profileUrls.push(fullUrl);
          }
        }
      }
    });

    console.log(`✅ Nalezeno ${profileUrls.length} profilů v ${category || 'homepage'}`);
    return profileUrls;

  } catch (error) {
    console.error('❌ Chyba při získávání seznamu profilů:', error);
    return [];
  }
}

// Scraping detailu profilu
async function scrapeProfile(url: string): Promise<ScrapedProfile | null> {
  console.log(`📄 Scraping: ${url}`);

  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    // Název - různé možné selektory
    const name =
      $('h1.profile-name').text().trim() ||
      $('h1').first().text().trim() ||
      $('.profile-title').text().trim() ||
      'Neznámé jméno';

    const slug = createSlug(name);

    // Info text pro parsování
    const infoText = $('.profile-info, .escort-info, .details').text();
    const age = extractAge(infoText + ' ' + $('body').text());

    // Město
    const cityText = $('.profile-location, .location, [class*="city"]').text().trim();
    const city = cityText || 'Praha';

    // Telefon
    const phoneText = $('.profile-phone, .phone, .contact-phone, [href^="tel:"]').text();
    const phone = extractPhone(phoneText + ' ' + $('body').text());

    // Popis
    const description =
      $('.profile-description').text().trim() ||
      $('.description').text().trim() ||
      $('.about').text().trim() ||
      '';

    // Fotky - eroguide používá CDN
    const photos: Array<{ url: string; alt?: string; order: number; isMain: boolean }> = [];
    $('img[src*="cdn.eroguide"], .profile-gallery img, .gallery img, img[src*="/uploads/"]').each((index, element) => {
      const src = $(element).attr('src');
      if (src && !src.includes('placeholder') && !src.includes('avatar')) {
        photos.push({
          url: src.startsWith('http') ? src : BASE_URL + src,
          alt: $(element).attr('alt') || name,
          order: index,
          isMain: index === 0,
        });
      }
    });

    // Parametry
    const params: { [key: string]: string } = {};
    $('.profile-params tr, .params tr, .details-table tr').each((_, element) => {
      const label = $(element).find('td:first-child, th').text().trim();
      const value = $(element).find('td:last-child').text().trim();
      if (label && value) params[label] = value;
    });

    // Služby
    const services: string[] = [];
    $('.profile-services li, .services li, .service-item').each((_, element) => {
      const service = $(element).text().trim();
      if (service) services.push(service);
    });

    // Badges/Tags
    const badges: string[] = [];
    $('.badge, .tag, [class*="badge"]').each((_, element) => {
      const badge = $(element).text().trim();
      if (badge) badges.push(badge);
    });

    // Reviews
    const reviews: Array<{ rating: number; comment: string; createdAt: string }> = [];
    $('.review, .review-item, [class*="review"]').each((_, element) => {
      const ratingText = $(element).find('.rating, [class*="rating"]').text();
      const ratingStars = $(element).find('.star, [class*="star"]').length;
      const rating = ratingStars || (ratingText.match(/\d+/) ? parseInt(ratingText.match(/\d+/)![0]) : 0);

      const comment = $(element).find('.review-text, .comment, p').text().trim();
      const dateText = $(element).find('.date, .review-date, time').text().trim();

      if (comment) {
        reviews.push({
          rating: rating || 5,
          comment,
          createdAt: dateText || new Date().toISOString(),
        });
      }
    });

    // Detekce typu profilu
    let profileType: 'SOLO' | 'PRIVAT' | 'MASSAGE_SALON' | 'ESCORT_AGENCY' = 'SOLO';
    if (url.includes('/privat/') || badges.some(b => b.includes('Privát'))) {
      profileType = 'PRIVAT';
    } else if (badges.some(b => b.includes('Masáž') || b.includes('Masážní'))) {
      profileType = 'MASSAGE_SALON';
    } else if (badges.some(b => b.includes('Agentura'))) {
      profileType = 'ESCORT_AGENCY';
    }

    const profile: ScrapedProfile = {
      name,
      slug,
      age,
      description,
      phone,
      city,
      location: city,
      profileType,
      category: profileType === 'MASSAGE_SALON' ? 'EROTICKE_MASERKY' : 'HOLKY_NA_SEX',
      height: params['Výška'] ? parseInt(params['Výška']) : undefined,
      weight: params['Váha'] ? parseInt(params['Váha']) : undefined,
      bust: params['Prsa'] || params['Poprsí'],
      hairColor: params['Vlasy'] || params['Barva vlasů'],
      breastType: params['Prsa']?.toLowerCase().includes('silikon') ? 'silicone' : 'natural',
      nationality: params['Národnost'],
      languages: params['Jazyky']?.split(',').map(l => l.trim()),
      orientation: params['Orientace'],
      offersEscort: services.some(s => s.toLowerCase().includes('escort')) || badges.includes('Escort'),
      travels: services.some(s => s.toLowerCase().includes('výjezd') || s.toLowerCase().includes('vyjíždím')),
      services,
      photos,
      reviews,
      sourceUrl: url,
      sourceSite: 'eroguide.cz',
      scrapedAt: new Date().toISOString(),
    };

    return profile;

  } catch (error) {
    console.error(`❌ Chyba při scraping ${url}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 TEST SCRAPER pro eroguide.cz (max 10 profilů)\n');

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Získej profily z homepage
  const allProfileUrls = await getProfileListings('');

  // LIMIT na 10 profilů
  const testUrls = allProfileUrls.slice(0, MAX_PROFILES);

  console.log(`\n📊 Test mode: Zpracuji pouze ${testUrls.length} profilů\n`);

  if (testUrls.length === 0) {
    console.log('⚠️  Žádné profily nenalezeny. Ukončuji.');
    return;
  }

  // Scrape testovací profily
  const profiles: ScrapedProfile[] = [];

  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\n[${i + 1}/${testUrls.length}] Processing: ${url}`);

    const profile = await scrapeProfile(url);
    if (profile) {
      profiles.push(profile);
    }

    // Delay 2 sekundy mezi požadavky
    if (i < testUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Ulož výsledky
  const outputFile = join(OUTPUT_DIR, 'eroguide-test.json');
  writeFileSync(outputFile, JSON.stringify(profiles, null, 2), 'utf-8');

  console.log(`\n✅ HOTOVO!`);
  console.log(`📊 Celkem staženo: ${profiles.length} profilů`);
  console.log(`💾 Uloženo do: ${outputFile}`);
  console.log(`\nStatistiky:`);
  console.log(`  - S fotkami: ${profiles.filter(p => p.photos.length > 0).length}`);
  console.log(`  - S recenzemi: ${profiles.filter(p => p.reviews && p.reviews.length > 0).length}`);
  console.log(`  - S telefonem: ${profiles.filter(p => p.phone).length}`);
  console.log(`\nTypy profilů:`);
  console.log(`  - SOLO: ${profiles.filter(p => p.profileType === 'SOLO').length}`);
  console.log(`  - PRIVAT: ${profiles.filter(p => p.profileType === 'PRIVAT').length}`);
  console.log(`  - MASÁŽE: ${profiles.filter(p => p.profileType === 'MASSAGE_SALON').length}`);
  console.log(`  - AGENTURA: ${profiles.filter(p => p.profileType === 'ESCORT_AGENCY').length}`);
}

main().catch(console.error);
