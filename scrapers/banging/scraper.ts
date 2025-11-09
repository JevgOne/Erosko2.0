// Scraper pro banging.cz
// PHP aplikace s multi-language podporou

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
  sourceSite: 'banging.cz';
  scrapedAt: string;
}

const BASE_URL = 'https://www.banging.cz';
const OUTPUT_DIR = join(__dirname, '../output');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

// Získání profilů podle kategorie
async function getProfileListings(categoryPath: string, categoryName: string): Promise<string[]> {
  console.log(`📋 Získávám profily z kategorie: ${categoryName}...`);

  try {
    const url = `${BASE_URL}${categoryPath}`;
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const profileUrls: string[] = [];

    // Najdi všechny odkazy na profily
    const selectors = [
      'a[href*="/profil/"]',
      'a[href*="/privat/"]',
      'a[href*="/escort/"]',
      'a[href*="/masaz/"]',
      'a[href*="/podnik/"]',
      '.listing a',
      '.profile-link',
      '.item a',
    ];

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const href = $(element).attr('href');
        if (href && (href.includes('/profil/') || href.includes('/privat/') ||
                     href.includes('/escort/') || href.includes('/masaz/') ||
                     href.includes('/podnik/'))) {
          const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
          if (!profileUrls.includes(fullUrl)) {
            profileUrls.push(fullUrl);
          }
        }
      });
    }

    console.log(`✅ Nalezeno ${profileUrls.length} profilů v ${categoryName}`);
    return profileUrls;

  } catch (error) {
    console.error(`❌ Chyba při získávání ${categoryName}:`, error);
    return [];
  }
}

// Scraping detailu profilu
async function scrapeProfile(url: string): Promise<ScrapedProfile | null> {
  console.log(`📄 Scraping: ${url}`);

  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    // Název
    const name =
      $('h1').first().text().trim() ||
      $('.profile-name, .profil-nazev').text().trim() ||
      $('title').text().split('|')[0].trim() ||
      'Neznámé jméno';

    const slug = createSlug(name);

    // Celý text stránky pro parsing
    const bodyText = $('body').text();
    const age = extractAge(bodyText);

    // Město
    const citySelectors = ['.city', '.mesto', '.location', '.lokace', '[class*="city"]', '[class*="mesto"]'];
    let city = 'Praha';
    for (const selector of citySelectors) {
      const cityText = $(selector).text().trim();
      if (cityText && cityText.length < 50) {
        city = cityText;
        break;
      }
    }

    // Telefon
    const phone = extractPhone(bodyText);

    // Email
    const emailMatch = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : undefined;

    // Popis
    const description =
      $('.description, .popis, .about, .o-me, [class*="description"]').text().trim() ||
      $('p').first().text().trim() ||
      '';

    // Fotky
    const photos: Array<{ url: string; alt?: string; order: number; isMain: boolean }> = [];
    $('img[src*="/upload"], img[src*="/foto"], img[src*="/photo"], .gallery img, .galerie img').each((index, element) => {
      const src = $(element).attr('src');
      if (src && !src.includes('logo') && !src.includes('banner') && !src.includes('placeholder')) {
        photos.push({
          url: src.startsWith('http') ? src : BASE_URL + src,
          alt: $(element).attr('alt') || name,
          order: index,
          isMain: index === 0,
        });
      }
    });

    // Parametry z tabulky
    const params: { [key: string]: string } = {};
    $('table tr, .params tr, .parametry tr, dl').each((_, element) => {
      const label = $(element).find('td:first-child, th, dt').text().trim();
      const value = $(element).find('td:last-child, dd').text().trim();
      if (label && value && label !== value) {
        params[label] = value;
      }
    });

    // Služby
    const services: string[] = [];
    $('.services li, .sluzby li, ul li, [class*="service"]').each((_, element) => {
      const service = $(element).text().trim();
      if (service && service.length < 100 && service.length > 3) {
        services.push(service);
      }
    });

    // Detekce typu profilu z URL a obsahu
    let profileType: 'SOLO' | 'PRIVAT' | 'MASSAGE_SALON' | 'ESCORT_AGENCY' = 'SOLO';
    let category: 'HOLKY_NA_SEX' | 'EROTICKE_MASERKY' | 'DOMINA' | 'DIGITALNI_SLUZBY' | 'EROTICKE_PODNIKY' = 'HOLKY_NA_SEX';

    if (url.includes('/privat/')) {
      profileType = 'PRIVAT';
    } else if (url.includes('/masaz/') || bodyText.toLowerCase().includes('masáž')) {
      profileType = 'MASSAGE_SALON';
      category = 'EROTICKE_MASERKY';
    } else if (url.includes('/podnik/')) {
      profileType = 'NIGHT_CLUB' as any; // Will map to appropriate type
      category = 'EROTICKE_PODNIKY';
    } else if (url.includes('/escort/') || bodyText.toLowerCase().includes('agentura')) {
      profileType = 'ESCORT_AGENCY';
    }

    // Reviews
    const reviews: Array<{ rating: number; comment: string; createdAt: string }> = [];
    $('.review, .recenze, .hodnoceni, [class*="review"]').each((_, element) => {
      const ratingText = $(element).find('[class*="rating"], [class*="hodnoceni"]').text();
      const rating = ratingText.match(/\d+/) ? parseInt(ratingText.match(/\d+/)![0]) : 5;

      const comment = $(element).find('.text, .komentar, p').text().trim();
      const dateText = $(element).find('.date, .datum, time').text().trim();

      if (comment && comment.length > 10) {
        reviews.push({
          rating: rating > 5 ? 5 : rating,
          comment,
          createdAt: dateText || new Date().toISOString(),
        });
      }
    });

    const profile: ScrapedProfile = {
      name,
      slug,
      age,
      description,
      phone,
      email,
      city,
      location: city,
      profileType,
      category,
      height: params['Výška'] ? parseInt(params['Výška'].replace(/\D/g, '')) : undefined,
      weight: params['Váha'] ? parseInt(params['Váha'].replace(/\D/g, '')) : undefined,
      bust: params['Prsa'] || params['Poprsí'] || params['Hrudník'],
      hairColor: params['Vlasy'] || params['Barva vlasů'],
      breastType: params['Prsa']?.toLowerCase().includes('silikon') ? 'silicone' : 'natural',
      nationality: params['Národnost'] || params['Národnost:'],
      languages: params['Jazyky']?.split(',').map(l => l.trim()) || ['česky'],
      orientation: params['Orientace'],
      tattoos: params['Tetování'],
      piercing: params['Piercing'],
      offersEscort: bodyText.toLowerCase().includes('escort') || services.some(s => s.toLowerCase().includes('escort')),
      travels: bodyText.toLowerCase().includes('výjezd') || services.some(s => s.toLowerCase().includes('výjezd')),
      services: services.length > 0 ? services : undefined,
      photos,
      reviews: reviews.length > 0 ? reviews : undefined,
      sourceUrl: url,
      sourceSite: 'banging.cz',
      scrapedAt: new Date().toISOString(),
    };

    return profile;

  } catch (error) {
    console.error(`❌ Chyba při scraping ${url}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Spouštím scraper pro banging.cz\n');

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Kategorie z banging.cz
  const categories = [
    { path: '/privaty', name: 'Priváty' },
    { path: '/eskorty', name: 'Eskorty' },
    { path: '/masaze', name: 'Masáže' },
    { path: '/podniky', name: 'Podniky' },
  ];

  let allProfileUrls: string[] = [];

  for (const category of categories) {
    const urls = await getProfileListings(category.path, category.name);
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

  // Scrape všechny profily
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
  const outputFile = join(OUTPUT_DIR, 'banging-data.json');
  writeFileSync(outputFile, JSON.stringify(profiles, null, 2), 'utf-8');

  console.log(`\n✅ HOTOVO!`);
  console.log(`📊 Celkem staženo: ${profiles.length} profilů`);
  console.log(`💾 Uloženo do: ${outputFile}`);
  console.log(`\nStatistiky:`);
  console.log(`  - S fotkami: ${profiles.filter(p => p.photos.length > 0).length}`);
  console.log(`  - S recenzemi: ${profiles.filter(p => p.reviews && p.reviews.length > 0).length}`);
  console.log(`  - S telefonem: ${profiles.filter(p => p.phone).length}`);
  console.log(`  - S emailem: ${profiles.filter(p => p.email).length}`);
  console.log(`\nTypy profilů:`);
  console.log(`  - SOLO: ${profiles.filter(p => p.profileType === 'SOLO').length}`);
  console.log(`  - PRIVAT: ${profiles.filter(p => p.profileType === 'PRIVAT').length}`);
  console.log(`  - MASÁŽE: ${profiles.filter(p => p.profileType === 'MASSAGE_SALON').length}`);
  console.log(`  - AGENTURA: ${profiles.filter(p => p.profileType === 'ESCORT_AGENCY').length}`);
  console.log(`\nKategorie:`);
  console.log(`  - HOLKY_NA_SEX: ${profiles.filter(p => p.category === 'HOLKY_NA_SEX').length}`);
  console.log(`  - MASERKY: ${profiles.filter(p => p.category === 'EROTICKE_MASERKY').length}`);
  console.log(`  - PODNIKY: ${profiles.filter(p => p.category === 'EROTICKE_PODNIKY').length}`);
}

main().catch(console.error);
