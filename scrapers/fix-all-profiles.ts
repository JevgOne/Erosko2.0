// Fix ALL profiles - names + private contacts
// Universal script for all dobryprivat JSON files

import axios from 'axios';
import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, 'output');
const BATCH_SIZE = 20;
const DELAY_BETWEEN_BATCHES = 2000;

interface Profile {
  name: string;
  slug: string;
  phone: string;
  email?: string;
  sourceUrl: string;
  private_contacts?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    telegram?: string;
  };
  [key: string]: any;
}

function createSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function fetchProfileData(url: string): Promise<{ name: string | null; contacts: Profile['private_contacts'] }> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const result: { name: string | null; contacts: Profile['private_contacts'] } = {
      name: null,
      contacts: {},
    };

    // Extract name from <title>
    const titleText = $('title').text().trim();
    if (titleText) {
      let name = titleText.replace(/\s*-\s*DobryPrivat\.cz\s*/i, '').trim();
      name = name.replace(/MessengerWhatsApp$/i, '').trim();
      name = name.replace(/Messenger$/i, '').trim();
      name = name.replace(/WhatsApp$/i, '').trim();
      if (name && name !== 'DobryPrivat.cz') {
        result.name = name.replace(/\s+/g, ' ').trim();
      }
    }

    // Extract private contacts
    $('a[href^="tel:"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !result.contacts.phone) {
        const phone = href.replace('tel:', '').replace(/\s/g, '');
        if (phone.length >= 9) {
          if (phone.startsWith('420')) {
            result.contacts.phone = `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
          } else {
            result.contacts.phone = `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
          }
        }
      }
    });

    $('a[href*="wa.me"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !result.contacts.whatsapp) {
        const match = href.match(/wa\.me\/(\d+)/);
        if (match && match[1]) {
          result.contacts.whatsapp = match[1];
        }
      }
    });

    $('a[href^="mailto:"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !result.contacts.email) {
        result.contacts.email = href.replace('mailto:', '');
      }
    });

    $('a[href*="t.me"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !result.contacts.telegram) {
        const match = href.match(/t\.me\/([a-zA-Z0-9_]+)/);
        if (match && match[1]) {
          result.contacts.telegram = match[1];
        }
      }
    });

    return result;
  } catch (error) {
    console.error(`  ❌ ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { name: null, contacts: {} };
  }
}

async function processBatch(profiles: Profile[], startIndex: number): Promise<void> {
  const batch = profiles.slice(startIndex, startIndex + BATCH_SIZE);

  console.log(`\n📦 Batch ${Math.floor(startIndex / BATCH_SIZE) + 1}: Processing ${batch.length} profiles...`);

  const promises = batch.map(async (profile, index) => {
    const globalIndex = startIndex + index;

    // Skip if already processed
    if (profile.name !== 'Neznámé jméno' && profile.private_contacts) {
      console.log(`  [${globalIndex + 1}] ⏭️  Already processed: ${profile.name}`);
      return;
    }

    const data = await fetchProfileData(profile.sourceUrl);

    if (data.name) {
      profile.name = data.name;
      profile.slug = createSlug(data.name);
    }

    if (Object.keys(data.contacts).length > 0) {
      profile.private_contacts = data.contacts;
    }

    const contactTypes = profile.private_contacts ? Object.keys(profile.private_contacts).join(', ') : 'none';
    console.log(`  [${globalIndex + 1}] ✅ ${profile.name} | ${contactTypes}`);
  });

  await Promise.all(promises);
}

async function processFile(filePath: string) {
  const filename = filePath.split('/').pop();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📂 Processing: ${filename}`);
  console.log(`${'='.repeat(60)}`);

  const profiles: Profile[] = JSON.parse(readFileSync(filePath, 'utf-8'));
  console.log(`✅ Loaded ${profiles.length} profiles`);

  const needsProcessing = profiles.filter(p =>
    p.name === 'Neznámé jméno' || !p.private_contacts
  );
  console.log(`📝 Needs processing: ${needsProcessing.length}\n`);

  if (needsProcessing.length === 0) {
    console.log('✅ All profiles already processed!\n');
    return;
  }

  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    await processBatch(profiles, i);

    // Save progress after each batch
    writeFileSync(filePath, JSON.stringify(profiles, null, 2), 'utf-8');
    console.log(`💾 Progress saved (${Math.min(i + BATCH_SIZE, profiles.length)}/${profiles.length})`);

    if (i + BATCH_SIZE < profiles.length) {
      console.log(`⏱️  Waiting ${DELAY_BETWEEN_BATCHES}ms...`);
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  // Final stats
  const withRealNames = profiles.filter(p => p.name !== 'Neznámé jméno').length;
  const withContacts = profiles.filter(p => p.private_contacts).length;
  const withPhones = profiles.filter(p => p.private_contacts?.phone).length;

  console.log(`\n📊 STATS:`);
  console.log(`  - Total profiles: ${profiles.length}`);
  console.log(`  - Real names: ${withRealNames}`);
  console.log(`  - With private contacts: ${withContacts}`);
  console.log(`  - Private phones: ${withPhones}`);
}

async function main() {
  console.log('🚀 FIXING ALL PROFILES - Names + Private Contacts\n');

  // Find all dobryprivat JSON files
  const files = readdirSync(OUTPUT_DIR)
    .filter(f => f.startsWith('dobryprivat-') && f.endsWith('.json'))
    .map(f => join(OUTPUT_DIR, f));

  console.log(`📂 Found ${files.length} files:`);
  files.forEach(f => console.log(`  - ${f.split('/').pop()}`));

  for (const file of files) {
    await processFile(file);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ ALL FILES PROCESSED!`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
