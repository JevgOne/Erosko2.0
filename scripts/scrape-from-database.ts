// Script pro extrakci fyzických parametrů - načítá profily Z DATABÁZE
import axios from 'axios';
import * as cheerio from 'cheerio';
import { turso } from '../lib/turso';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

async function extractPhysicalAttributes(url: string): Promise<{ height?: number; weight?: number; bust?: string } | null> {
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    // Extrakce parametrů
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
  console.log('🚀 Scraping fyzických parametrů z databáze\n');

  // Načti JSON s mapováním slug -> sourceUrl
  const fs = await import('fs');
  const jsonData = JSON.parse(fs.readFileSync('/Users/zen/Desktop/erosko.cz/scrapers/output/dobryprivat-FINAL.json', 'utf-8'));
  const slugToUrl = new Map(jsonData.map((p: any) => [p.slug, p.sourceUrl]));

  console.log(`📦 Načteno ${slugToUrl.size} mapování slug -> URL z JSON\n`);

  // Načti profily Z DATABÁZE bez fyzických parametrů
  const result = await turso.execute(`
    SELECT id, name, slug
    FROM Profile
    WHERE (height IS NULL OR weight IS NULL OR bust IS NULL)
    ORDER BY createdAt DESC
  `);

  const profiles = result.rows as any[];

  // Filtruj pouze profily, které mají sourceUrl v JSON
  const profilesWithUrl = profiles.filter(p => slugToUrl.has(p.slug));

  console.log(`📋 Celkem profilů bez parametrů: ${profiles.length}`);
  console.log(`📋 S URL z dobryprivat: ${profilesWithUrl.length}\n`);

  if (profilesWithUrl.length === 0) {
    console.log('✅ Všechny profily s dobryprivat URL již mají fyzické parametry!');
    return;
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < profilesWithUrl.length; i++) {
    const profile = profilesWithUrl[i];
    const sourceUrl = slugToUrl.get(profile.slug);

    console.log(`\n[${i + 1}/${profilesWithUrl.length}] ${profile.name} (ID: ${profile.id})`);
    console.log(`   URL: ${sourceUrl}`);

    // Extrahuj parametry
    const attrs = await extractPhysicalAttributes(sourceUrl!);

    if (!attrs || (!attrs.height && !attrs.weight && !attrs.bust)) {
      console.log(`   ⚠️  Žádné parametry nenalezeny`);
      skipped++;
    } else {
      console.log(`   ✅ Výška: ${attrs.height || 'N/A'} cm, Váha: ${attrs.weight || 'N/A'} kg, Prsa: ${attrs.bust || 'N/A'}`);

      // Update databáze podle ID
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
