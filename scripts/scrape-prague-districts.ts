// Scrapuj konkrétní části Prahy (Praha 1, Praha 2, atd.) z dobryprivat.cz
import axios from 'axios';
import * as cheerio from 'cheerio';
import { turso } from '../lib/turso';
import fs from 'fs';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

interface LocationData {
  district?: string;  // např. "Praha 2"
  address?: string;   // např. "Mánesova 711/16"
  fullAddress?: string; // celá adresa "Praha 2, Mánesova 711/16"
}

async function extractLocationData(url: string): Promise<LocationData | null> {
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    // Extrakce adresy z detail-adresa-text
    const addressText = $('.detail-adresa-text').text().trim();

    if (!addressText) {
      return null;
    }

    // Rozděl na části: "Praha 2, Mánesova 711/16" -> ["Praha 2", "Mánesova 711/16"]
    const parts = addressText.split(',').map(p => p.trim());

    const district = parts[0]; // "Praha 2"
    const streetAddress = parts.length > 1 ? parts[1] : undefined; // "Mánesova 711/16"

    return {
      district,
      address: streetAddress,
      fullAddress: addressText
    };
  } catch (error) {
    console.error(`❌ Chyba při scraping ${url}:`, (error as any).message);
    return null;
  }
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\+]/g, '');
}

async function main() {
  console.log('🚀 Scrapuji konkrétní části Prahy z dobryprivat.cz\n');

  // Načti JSON s mapováním
  const jsonData = JSON.parse(fs.readFileSync('/Users/zen/Desktop/erosko.cz/scrapers/output/dobryprivat-FINAL.json', 'utf-8'));

  // Vytvoř mapu telefon -> sourceUrl (stejně jako u fyzických parametrů)
  const phoneToUrl = new Map<string, string>();
  for (const profile of jsonData) {
    const privatePhone = profile.private_contacts?.phone;
    if (privatePhone && profile.sourceUrl) {
      const normalized = normalizePhone(privatePhone);
      phoneToUrl.set(normalized, profile.sourceUrl);
    }
  }
  console.log(`📦 Načteno ${phoneToUrl.size} mapování telefon -> URL z JSON\n`);

  // Načti profily z databáze kde city = "Praha" (bez konkrétní části)
  const result = await turso.execute(`
    SELECT id, name, phone, city, location
    FROM Profile
    WHERE city = 'Praha'
    AND (location = 'Praha' OR location IS NULL)
    AND phone IS NOT NULL AND phone != ''
    ORDER BY createdAt DESC
  `);

  const profiles = result.rows as any[];

  // Filtruj pouze profily které mají sourceUrl v JSON (podle telefonu)
  const profilesWithUrl = profiles.filter(p => {
    const normalized = normalizePhone(p.phone);
    return phoneToUrl.has(normalized);
  });

  console.log(`📋 Celkem pražských profilů bez konkrétní části: ${profiles.length}`);
  console.log(`📋 S URL z dobryprivat: ${profilesWithUrl.length}\n`);

  if (profilesWithUrl.length === 0) {
    console.log('✅ Všechny profily již mají konkrétní části Prahy!');
    return;
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < profilesWithUrl.length; i++) {
    const profile = profilesWithUrl[i];
    const normalizedPhone = normalizePhone(profile.phone);
    const sourceUrl = phoneToUrl.get(normalizedPhone)!;

    console.log(`\n[${i + 1}/${profilesWithUrl.length}] ${profile.name}`);
    console.log(`   📞 ${profile.phone}`);
    console.log(`   🔗 ${sourceUrl}`);

    // Extrahuj lokační data
    const locationData = await extractLocationData(sourceUrl);

    if (!locationData || !locationData.district) {
      console.log(`   ⚠️  Žádná konkrétní část Prahy nenalezena`);
      skipped++;
    } else {
      console.log(`   ✅ Část: ${locationData.district}`);
      if (locationData.address) {
        console.log(`   📍 Adresa: ${locationData.address}`);
      }

      // Update databáze
      try {
        await turso.execute({
          sql: `UPDATE Profile SET location = ?, address = ? WHERE id = ?`,
          args: [locationData.district, locationData.address || null, profile.id]
        });

        console.log(`   💾 Databáze updateována`);
        updated++;
      } catch (error) {
        console.error(`   ❌ Chyba při update databáze:`, error);
        failed++;
      }
    }

    // Delay 2 sekundy mezi požadavky
    if (i < profilesWithUrl.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n\n🎉 HOTOVO!`);
  console.log(`   ✅ Updateováno: ${updated} profilů`);
  console.log(`   ⚠️  Přeskočeno: ${skipped} profilů`);
  console.log(`   ❌ Chyby: ${failed} profilů`);
}

main().catch(console.error);
