// Extract private contacts (phones, emails) from scraped profiles
// Store them separately as PRIVATE data (not for public display)

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
  phone: string;
  email?: string;
  sourceUrl: string;
  private_contacts?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    telegram?: string;
    signal?: string;
  };
  [key: string]: any;
}

async function extractPrivateContacts(url: string): Promise<Profile['private_contacts']> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const contacts: Profile['private_contacts'] = {};

    // Extract phone from tel: links
    $('a[href^="tel:"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const phone = href.replace('tel:', '').replace(/\s/g, '');
        if (phone.length >= 9 && !contacts.phone) {
          // Format: 734807789 -> 734 807 789
          if (phone.startsWith('420')) {
            contacts.phone = `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
          } else {
            contacts.phone = `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
          }
        }
      }
    });

    // Extract WhatsApp
    $('a[href*="wa.me"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const match = href.match(/wa\.me\/(\d+)/);
        if (match && match[1]) {
          contacts.whatsapp = match[1];
        }
      }
    });

    // Extract email
    $('a[href^="mailto:"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !contacts.email) {
        contacts.email = href.replace('mailto:', '');
      }
    });

    // Extract Telegram
    $('a[href*="t.me"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !contacts.telegram) {
        const match = href.match(/t\.me\/([a-zA-Z0-9_]+)/);
        if (match && match[1]) {
          contacts.telegram = match[1];
        }
      }
    });

    return Object.keys(contacts).length > 0 ? contacts : undefined;
  } catch (error) {
    return undefined;
  }
}

async function processBatch(profiles: Profile[], startIndex: number): Promise<void> {
  const batch = profiles.slice(startIndex, startIndex + BATCH_SIZE);

  console.log(`\n📦 Batch ${Math.floor(startIndex / BATCH_SIZE) + 1}: Extracting ${batch.length} contacts...`);

  const promises = batch.map(async (profile, index) => {
    const globalIndex = startIndex + index;

    // Skip if already has private_contacts
    if (profile.private_contacts) {
      console.log(`  [${globalIndex + 1}] ⏭️  Already has contacts: ${profile.name}`);
      return;
    }

    const contacts = await extractPrivateContacts(profile.sourceUrl);

    if (contacts) {
      profile.private_contacts = contacts;
      const contactTypes = Object.keys(contacts).join(', ');
      console.log(`  [${globalIndex + 1}] ✅ ${profile.name}: ${contactTypes}`);
    } else {
      console.log(`  [${globalIndex + 1}] ⚠️  No contacts: ${profile.name}`);
    }
  });

  await Promise.all(promises);
}

async function processFile(filePath: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📂 Processing: ${filePath}`);
  console.log(`${'='.repeat(60)}`);

  const profiles: Profile[] = JSON.parse(readFileSync(filePath, 'utf-8'));
  console.log(`✅ Loaded ${profiles.length} profiles`);

  const withoutPrivateContacts = profiles.filter(p => !p.private_contacts);
  console.log(`📞 Without private contacts: ${withoutPrivateContacts.length}\n`);

  if (withoutPrivateContacts.length === 0) {
    console.log('✅ All profiles already have private contacts!\n');
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
  const withContacts = profiles.filter(p => p.private_contacts);
  console.log(`\n📊 STATS:`);
  console.log(`  - Total profiles: ${profiles.length}`);
  console.log(`  - With private contacts: ${withContacts.length}`);
  console.log(`  - Phones: ${profiles.filter(p => p.private_contacts?.phone).length}`);
  console.log(`  - WhatsApp: ${profiles.filter(p => p.private_contacts?.whatsapp).length}`);
  console.log(`  - Emails: ${profiles.filter(p => p.private_contacts?.email).length}`);
  console.log(`  - Telegram: ${profiles.filter(p => p.private_contacts?.telegram).length}`);
}

async function main() {
  console.log('🚀 EXTRACTING PRIVATE CONTACTS\n');

  // Find all JSON files in output directory
  const files = readdirSync(OUTPUT_DIR)
    .filter(f => f.startsWith('dobryprivat-') && f.endsWith('.json'));

  console.log(`📂 Found ${files.length} files to process:`);
  files.forEach(f => console.log(`  - ${f}`));

  for (const file of files) {
    await processFile(join(OUTPUT_DIR, file));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ ALL FILES PROCESSED!`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
