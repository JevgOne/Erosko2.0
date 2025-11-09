// Fix names using WebFetch - Fast parallel processing
// Loads existing JSON, fetches real names from web, updates profiles

import axios from 'axios';
import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_FILE = join(__dirname, 'output/dobryprivat-dívky.json');
const OUTPUT_FILE = join(__dirname, 'output/dobryprivat-dívky-fixed.json');
const BATCH_SIZE = 20; // Parallel requests
const DELAY_BETWEEN_BATCHES = 2000; // 2s delay between batches

interface Profile {
  name: string;
  slug: string;
  sourceUrl: string;
  [key: string]: any;
}

function createSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function fetchNameFromUrl(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Extract from <title> tag (most reliable for this site)
    // Format: "NAME - DobryPrivat.cz"
    const titleText = $('title').text().trim();
    if (titleText) {
      let name = titleText.replace(/\s*-\s*DobryPrivat\.cz\s*/i, '').trim();
      // Remove common suffixes (MessengerWhatsApp, etc.)
      name = name.replace(/MessengerWhatsApp$/i, '').trim();
      name = name.replace(/Messenger$/i, '').trim();
      name = name.replace(/WhatsApp$/i, '').trim();
      if (name && name !== 'DobryPrivat.cz') {
        return name.replace(/\s+/g, ' ').trim();
      }
    }

    // Fallback: try h1 tags
    const h1Name = $('h1').first().text().trim();
    if (h1Name) {
      return h1Name.replace(/\s+/g, ' ').trim();
    }

    return null;
  } catch (error) {
    console.error(`  ❌ ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

async function processBatch(profiles: Profile[], startIndex: number): Promise<void> {
  const batch = profiles.slice(startIndex, startIndex + BATCH_SIZE);

  console.log(`\n📦 Batch ${Math.floor(startIndex / BATCH_SIZE) + 1}: Fetching ${batch.length} names...`);

  const promises = batch.map(async (profile, index) => {
    const globalIndex = startIndex + index;
    const name = await fetchNameFromUrl(profile.sourceUrl);

    if (name) {
      profile.name = name;
      profile.slug = createSlug(name);
      console.log(`  [${globalIndex + 1}] ✅ ${name}`);
    } else {
      console.log(`  [${globalIndex + 1}] ⚠️  Failed, keeping: ${profile.name}`);
    }
  });

  await Promise.all(promises);
}

async function main() {
  console.log('🚀 FIXING NAMES - WebFetch parallel processing\n');

  // Load existing data
  console.log(`📂 Loading: ${INPUT_FILE}`);
  const profiles: Profile[] = JSON.parse(readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`✅ Loaded ${profiles.length} profiles\n`);

  // Process in batches
  const totalBatches = Math.ceil(profiles.length / BATCH_SIZE);

  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    await processBatch(profiles, i);

    // Save progress after each batch
    writeFileSync(OUTPUT_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
    console.log(`💾 Progress saved (${i + BATCH_SIZE}/${profiles.length})`);

    // Delay between batches (except last one)
    if (i + BATCH_SIZE < profiles.length) {
      console.log(`⏱️  Waiting ${DELAY_BETWEEN_BATCHES}ms...`);
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  // Final save
  writeFileSync(OUTPUT_FILE, JSON.stringify(profiles, null, 2), 'utf-8');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ DONE!`);
  console.log(`📊 Stats:`);
  console.log(`  - Total profiles: ${profiles.length}`);
  console.log(`  - Fixed names: ${profiles.filter(p => p.name !== 'Neznámé jméno').length}`);
  console.log(`  - Still unknown: ${profiles.filter(p => p.name === 'Neznámé jméno').length}`);
  console.log(`💾 Output: ${OUTPUT_FILE}`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
