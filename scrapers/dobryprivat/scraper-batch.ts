// Batch scraper pro dobryprivat.cz - zpracování po 100 profilech
// ✅ Fotky ✅ Původní kategorie ✅ Batch processing ✅ Auto-save

import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://dobryprivat.cz';
const OUTPUT_DIR = join(__dirname, '../output');
const BATCH_SIZE = 100;  // Zpracovat po 100 profilech
const DELAY_MS = 3000;   // 3 sekundy mezi požadavky (conservative)

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
  profileType: string;
  category: string;
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

function mapCategory(originalCategory: string, tags: string[] = []) {
  const categoryLower = originalCategory.toLowerCase();

  if (categoryLower.includes('masáž') || categoryLower.includes('masaz')) {
    return {
      profileType: 'MASSAGE_SALON',
      category: 'EROTICKE_MASERKY',
      confidence: 'high' as const,
      needsReview: false,
    };
  }

  if (categoryLower.includes('bdsm') || categoryLower.includes('domina')) {
    return {
      profileType: 'PRIVAT',
      category: 'DOMINA',
      confidence: 'high' as const,
      needsReview: false,
    };
  }

  if (categoryLower.includes('podnik') || categoryLower.includes('club') || categoryLower.includes('salon')) {
    return {
      profileType: 'NIGHT_CLUB',
      category: 'EROTICKE_PODNIKY',
      confidence: 'medium' as const,
      needsReview: true,
    };
  }

  return {
    profileType: 'PRIVAT',
    category: 'HOLKY_NA_SEX',
    confidence: 'high' as const,
    needsReview: false,
  };
}

async function getProfileListings(category: { path: string, name: string }, maxProfiles: number): Promise<Array<{url: string, category: string}>> {
  console.log(`\n📋 Kategorie: ${category.name}`);
  const results: Array<{url: string, category: string}> = [];

  // Zjisti počet stránek
  const firstPageResponse = await axios.get(BASE_URL + category.path, { headers });
  const $ = cheerio.load(firstPageResponse.data);

  const lastPage = Math.max(...Array.from($('.page-numbers'))
    .map(el => parseInt($(el).text()))
    .filter(n => !isNaN(n)));

  console.log(`  Celkem stránek: ${lastPage || 1}`);

  // Projdi stránky
  for (let page = 1; page <= (lastPage || 1); page++) {
    if (results.length >= maxProfiles) break;

    const pageUrl = page === 1 ? BASE_URL + category.path : `${BASE_URL}${category.path}page/${page}/`;

    try {
      const response = await axios.get(pageUrl, { headers });
      const $page = cheerio.load(response.data);

      $page('a[href*="/divka/"]').each((_, element) => {
        if (results.length >= maxProfiles) return false;

        const href = $page(element).attr('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
          if (!results.find(r => r.url === fullUrl)) {
            results.push({ url: fullUrl, category: category.name });
          }
        }
      });

      console.log(`  Stránka ${page}/${lastPage}: ${results.length} profilů`);
      await new Promise(r => setTimeout(r, 1000)); // 1s mezi stránkami

    } catch (error) {
      console.error(`  ❌ Chyba na stránce ${page}:`, error);
    }
  }

  return results.slice(0, maxProfiles);
}

async function scrapeProfile(url: string, originalCategory: string): Promise<ScrapedProfile | null> {
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const name =
      $('h1.entry-title').text().trim() ||
      $('.profil-nazev h1').text().trim() ||
      $('h1').first().text().trim() ||
      $('.profile-name').text().trim() ||
      'Neznámé jméno';

    const photos: Array<{ url: string; alt?: string; order: number; isMain: boolean; }> = [];
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
        if (src && !src.includes('logo') && !src.includes('banner') && !src.includes('data:image')) {
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
      if (photos.length > 0) break;
    }

    const tags: string[] = [];
    $('.tag, .badge, .label, .pill').each((_, element) => {
      const tag = $(element).text().trim();
      if (tag) tags.push(tag);
    });

    const services: string[] = [];
    $('.services li, .sluzby li, .nabidka li').each((_, element) => {
      const service = $(element).text().trim();
      if (service) services.push(service);
    });

    const bodyText = $('body').text();
    const age = extractAge(bodyText);
    const phone = extractPhone(bodyText);
    const mapping = mapCategory(originalCategory, tags);

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
      city: 'Praha',
      location: 'Praha',
      profileType: mapping.profileType,
      category: mapping.category,
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

// Load existing progress
function loadProgress(outputFile: string): ScrapedProfile[] {
  if (existsSync(outputFile)) {
    try {
      const data = readFileSync(outputFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

// Save batch
function saveBatch(outputFile: string, profiles: ScrapedProfile[]) {
  writeFileSync(outputFile, JSON.stringify(profiles, null, 2), 'utf-8');
  console.log(`\n💾 Uloženo: ${profiles.length} profilů do ${outputFile}`);
}

async function main() {
  console.log(`🚀 BATCH SCRAPER - dobryprivat.cz`);
  console.log(`📦 Batch size: ${BATCH_SIZE} profilů`);
  console.log(`⏱️  Delay: ${DELAY_MS}ms (${DELAY_MS / 1000}s) mezi profily\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const categories = [
    { path: '/divky/', name: 'Dívky' },
    { path: '/eroticke-masaze/', name: 'Erotické masáže' },
    { path: '/bdsm/', name: 'BDSM' },
    { path: '/podniky/', name: 'Podniky' },
  ];

  for (const category of categories) {
    const outputFile = join(OUTPUT_DIR, `dobryprivat-${category.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    let allProfiles = loadProgress(outputFile);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 KATEGORIE: ${category.name}`);
    console.log(`📄 Output: ${outputFile}`);
    console.log(`✅ Již staženo: ${allProfiles.length} profilů`);
    console.log(`${'='.repeat(60)}`);

    // Získej seznam profilů (bez limitu - stáhni všechny)
    const profileListings = await getProfileListings(category, 10000);

    // Filtruj již stažené
    const alreadyScrapedUrls = new Set(allProfiles.map(p => p.sourceUrl));
    const toScrape = profileListings.filter(p => !alreadyScrapedUrls.has(p.url));

    console.log(`\n📊 K stažení: ${toScrape.length} nových profilů`);

    if (toScrape.length === 0) {
      console.log(`✅ Všechny profily v kategorii ${category.name} již staženy!`);
      continue;
    }

    // Scrape po batch
    let batchProfiles: ScrapedProfile[] = [];

    for (let i = 0; i < toScrape.length; i++) {
      const { url, category: cat } = toScrape[i];

      console.log(`\n[${i + 1}/${toScrape.length}] ${url}`);

      const profile = await scrapeProfile(url, cat);
      if (profile) {
        batchProfiles.push(profile);
        console.log(`  ✅ ${profile.name} | ${profile.photos.length} fotek | ${profile.profileType}`);
      }

      // Save každých 100 profilů
      if (batchProfiles.length >= BATCH_SIZE || i === toScrape.length - 1) {
        allProfiles = [...allProfiles, ...batchProfiles];
        saveBatch(outputFile, allProfiles);

        console.log(`\n📊 BATCH DOKONČEN:`);
        console.log(`  - Právě staženo: ${batchProfiles.length}`);
        console.log(`  - Celkem v kategorii: ${allProfiles.length}`);
        console.log(`  - Zbývá: ${toScrape.length - i - 1}`);

        batchProfiles = []; // Reset batch
      }

      // Delay mezi profily
      if (i < toScrape.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ SCRAPING DOKONČEN!`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
