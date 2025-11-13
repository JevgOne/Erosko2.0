// Scrapuj fyzické parametry z dobryprivat.cz a updateuj databázi
import axios from 'axios';
import * as cheerio from 'cheerio';
import { turso } from '../lib/turso';
import fs from 'fs';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\+]/g, '');
}

async function extractPhysicalAttributes(url: string): Promise<{ height?: number; weight?: number; bust?: string } | null> {
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const params: { [key: string]: string } = {};
    $('.detail-bottom-left-item').each((_, element) => {
      const label = $(element).find('.detail-cont-promena').text().trim().replace(':', '');
      const value = $(element).find('.detail-bottom-hodnota').text().trim();
      if (label && value) {
        params[label] = value;
      }
    });

    const height = params['Výška'] ? parseInt(params['Výška']) : undefined;
    const weight = params['Váha'] ? parseInt(params['Váha']) : undefined;
    const bust = params['Prsa'];

    return { height, weight, bust };
  } catch (error) {
    console.error(`❌ Chyba při scraping ${url}:`, (error as any).message);
    return null;
  }
}

async function main() {
  console.log('🚀 Scrapuji fyzické parametry z dobryprivat.cz\n');

  // Načti JSON
  const jsonData = JSON.parse(fs.readFileSync('/Users/zen/Desktop/erosko.cz/scrapers/output/dobryprivat-FINAL.json', 'utf-8'));
  console.log(`📦 JSON má ${jsonData.length} profilů`);

  // Vytvoř mapu telefon -> sourceUrl
  const phoneToData = new Map();
  for (const profile of jsonData) {
    const privatePhone = profile.private_contacts?.phone;
    if (privatePhone) {
      const normalized = normalizePhone(privatePhone);
      phoneToData.set(normalized, {
        sourceUrl: profile.sourceUrl,
        name: profile.name
      });
    }
  }
  console.log(`📞 ${phoneToData.size} profilů s telefonem v JSON\n`);

  // Načti profily z databáze bez fyzických parametrů
  const result = await turso.execute(`
    SELECT id, name, phone
    FROM Profile
    WHERE (height IS NULL OR weight IS NULL OR bust IS NULL)
    AND phone IS NOT NULL AND phone != ''
    ORDER BY createdAt DESC
  `);

  const profiles = result.rows as any[];
  console.log(`📋 Profilů bez parametrů v databázi: ${profiles.length}\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let notFound = 0;

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const normalizedPhone = normalizePhone(profile.phone);
    const jsonData = phoneToData.get(normalizedPhone);

    console.log(`\n[${i + 1}/${profiles.length}] ${profile.name}`);
    console.log(`   📞 ${profile.phone} -> ${normalizedPhone}`);

    if (!jsonData) {
      console.log(`   ⚠️  Nenalezen v JSON`);
      notFound++;
      continue;
    }

    console.log(`   🔗 ${jsonData.sourceUrl}`);

    // Scrapuj fyzické parametry
    const attrs = await extractPhysicalAttributes(jsonData.sourceUrl);

    if (!attrs || (!attrs.height && !attrs.weight && !attrs.bust)) {
      console.log(`   ⚠️  Žádné parametry nenalezeny`);
      skipped++;
    } else {
      console.log(`   ✅ Výška: ${attrs.height || 'N/A'} cm, Váha: ${attrs.weight || 'N/A'} kg, Prsa: ${attrs.bust || 'N/A'}`);

      // Update databáze
      try {
        const updateParts: string[] = [];
        const values: any[] = [];

        if (attrs.height) {
          updateParts.push('height = ?');
          values.push(attrs.height);
        }
        if (attrs.weight) {
          updateParts.push('weight = ?');
          values.push(attrs.weight);
        }
        if (attrs.bust) {
          updateParts.push('bust = ?');
          values.push(attrs.bust);
        }

        if (updateParts.length > 0) {
          values.push(profile.id);

          await turso.execute({
            sql: `UPDATE Profile SET ${updateParts.join(', ')} WHERE id = ?`,
            args: values
          });

          console.log(`   💾 Databáze updateována`);
          updated++;
        }
      } catch (error) {
        console.error(`   ❌ Chyba při update databáze:`, error);
        failed++;
      }
    }

    // Delay 2 sekundy mezi požadavky
    if (i < profiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n\n🎉 HOTOVO!`);
  console.log(`   ✅ Updateováno: ${updated} profilů`);
  console.log(`   ⚠️  Přeskočeno (žádné parametry): ${skipped} profilů`);
  console.log(`   🔍 Nenalezeno v JSON: ${notFound} profilů`);
  console.log(`   ❌ Chyby: ${failed} profilů`);
}

main().catch(console.error);
