// Merge all scraped files into one final JSON
// Structure: dobryprivat-FINAL.json

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, 'output');
const FINAL_FILE = join(OUTPUT_DIR, 'dobryprivat-FINAL.json');

interface Profile {
  name: string;
  slug: string;
  sourceUrl: string;
  phone: string; // PUBLIC phone (if available)
  private_contacts?: { // PRIVATE data (admin only)
    phone?: string;
    whatsapp?: string;
    email?: string;
    telegram?: string;
  };
  [key: string]: any;
}

function main() {
  console.log('🔄 MERGING ALL FILES\n');

  const files = readdirSync(OUTPUT_DIR)
    .filter(f => f.startsWith('dobryprivat-') && f.endsWith('.json') && !f.includes('FINAL'))
    .map(f => join(OUTPUT_DIR, f));

  console.log(`📂 Found ${files.length} files:`);
  files.forEach(f => console.log(`  - ${f.split('/').pop()}`));

  let allProfiles: Profile[] = [];

  files.forEach(file => {
    const filename = file.split('/').pop();
    const profiles: Profile[] = JSON.parse(readFileSync(file, 'utf-8'));
    console.log(`\n✅ ${filename}: ${profiles.length} profiles`);

    allProfiles = [...allProfiles, ...profiles];
  });

  // Remove duplicates based on sourceUrl
  const uniqueProfiles = allProfiles.filter((profile, index, self) =>
    index === self.findIndex(p => p.sourceUrl === profile.sourceUrl)
  );

  console.log(`\n📊 STATS:`);
  console.log(`  - Total profiles: ${allProfiles.length}`);
  console.log(`  - Duplicates removed: ${allProfiles.length - uniqueProfiles.length}`);
  console.log(`  - Unique profiles: ${uniqueProfiles.length}`);

  // Sort by category
  uniqueProfiles.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  // Save final merged file
  writeFileSync(FINAL_FILE, JSON.stringify(uniqueProfiles, null, 2), 'utf-8');

  console.log(`\n💾 Saved: ${FINAL_FILE}`);

  // Stats breakdown
  const byCategory: Record<string, number> = {};
  uniqueProfiles.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  });

  console.log(`\n📋 By Category:`);
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count}`);
  });

  const publicPhones = uniqueProfiles.filter(p => p.phone && p.phone !== '').length;
  const privatePhones = uniqueProfiles.filter(p => p.private_contacts?.phone).length;
  const whatsapp = uniqueProfiles.filter(p => p.private_contacts?.whatsapp).length;
  const emails = uniqueProfiles.filter(p => p.private_contacts?.email).length;

  console.log(`\n🌐 PUBLIC DATA:`);
  console.log(`  - Phones: ${publicPhones} (${Math.round(publicPhones/uniqueProfiles.length*100)}%)`);

  console.log(`\n🔒 PRIVATE DATA:`);
  console.log(`  - Phones: ${privatePhones} (${Math.round(privatePhones/uniqueProfiles.length*100)}%)`);
  console.log(`  - WhatsApp: ${whatsapp} (${Math.round(whatsapp/uniqueProfiles.length*100)}%)`);
  console.log(`  - Emails: ${emails} (${Math.round(emails/uniqueProfiles.length*100)}%)`);

  console.log(`\n✅ DONE!`);
}

main();
