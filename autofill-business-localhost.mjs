#!/usr/bin/env node

/**
 * Auto-fill business registration form on localhost
 * Reads scraped data and fills the form automatically
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRAPED_DATA_FILE = path.join(__dirname, 'scraped-businesses', 'businesses.json');
const LOCALHOST_URL = 'http://localhost:3000/pridat-podnik';

/**
 * Login to localhost
 */
async function login(page, phone = '+420000000000', password = 'admin123') {
  console.log('🔐 Logging in...');

  await page.goto('http://localhost:3000/prihlaseni', { waitUntil: 'networkidle2' });

  // Fill login form
  await page.type('input[type="tel"]', phone);
  await page.type('input[type="password"]', password);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('✅ Logged in successfully');
}

/**
 * Map business type from name/description
 */
function determineBusinessType(business) {
  const nameLower = business.name.toLowerCase();
  const descLower = (business.description || '').toLowerCase();

  if (nameLower.includes('masáž') || nameLower.includes('masaz') ||
      descLower.includes('masáž') || descLower.includes('tantra')) {
    return 'MASSAGE_SALON';
  } else if (nameLower.includes('privát') || nameLower.includes('privat')) {
    return 'PRIVAT';
  } else if (nameLower.includes('escort') || nameLower.includes('agentura')) {
    return 'ESCORT_AGENCY';
  } else if (nameLower.includes('club') || nameLower.includes('klub')) {
    return 'NIGHT_CLUB';
  } else {
    return 'PRIVAT'; // Default
  }
}

/**
 * Normalize city name to match dropdown options
 */
function normalizeCity(city) {
  if (!city) return '';

  const cityMap = {
    'Praha 1': 'Praha',
    'Praha 2': 'Praha',
    'Praha 3': 'Praha',
    'Praha': 'Praha',
    'Brno': 'Brno',
    'Ostrava': 'Ostrava',
    'Plzeň': 'Plzeň',
    'Liberec': 'Liberec',
    'Olomouc': 'Olomouc',
    'České Budějovice': 'České Budějovice',
    'Hradec Králové': 'Hradec Králové'
  };

  // Try exact match first
  if (cityMap[city]) {
    return cityMap[city];
  }

  // Try partial match
  for (const [key, value] of Object.entries(cityMap)) {
    if (city.includes(key) || key.includes(city)) {
      return value;
    }
  }

  return 'Praha'; // Default to Praha
}

/**
 * Fill business registration form
 */
async function fillBusinessForm(page, business) {
  console.log(`\n📝 Filling form for: ${business.name}`);

  await page.goto(LOCALHOST_URL, { waitUntil: 'networkidle2' });

  // Wait for form to load
  await page.waitForSelector('form');

  // Fill business type (select dropdown)
  const businessType = determineBusinessType(business);
  await page.select('select[value=""]', businessType);
  console.log(`   Type: ${businessType}`);

  // Fill name
  if (business.name) {
    await page.type('input[placeholder*="Salon"]', business.name);
    console.log(`   Name: ${business.name}`);
  }

  // Fill description
  if (business.description) {
    await page.type('textarea[placeholder*="popis"]', business.description);
    console.log(`   Description: ${business.description.substring(0, 50)}...`);
  }

  // Fill phone
  if (business.phone) {
    await page.type('input[type="tel"]', business.phone);
    console.log(`   Phone: ${business.phone}`);
  }

  // Fill email
  if (business.email) {
    await page.type('input[type="email"]', business.email);
    console.log(`   Email: ${business.email}`);
  }

  // Fill website
  if (business.website) {
    await page.type('input[type="url"]', business.website);
    console.log(`   Website: ${business.website}`);
  }

  // Fill city (select dropdown)
  if (business.city) {
    const normalizedCity = normalizeCity(business.city);
    await page.select('select', normalizedCity);
    console.log(`   City: ${normalizedCity}`);
  }

  // Fill address
  if (business.address) {
    await page.type('input[placeholder*="Ulice"]', business.address);
    console.log(`   Address: ${business.address}`);
  }

  // TODO: Upload photos (requires file input handling)
  if (business.photos && business.photos.length > 0) {
    console.log(`   📸 Photos: ${business.photos.length} available (upload not implemented yet)`);
  }

  console.log('\n✅ Form filled! Ready for manual review/submit.');
  console.log('   Press Ctrl+C to stop, or wait 30 seconds...\n');

  // Wait 30 seconds before continuing to next business
  await new Promise(resolve => setTimeout(resolve, 30000));
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Auto-fill business registration on localhost\n');

  // Check if scraped data exists
  if (!fs.existsSync(SCRAPED_DATA_FILE)) {
    console.error('❌ Error: Scraped data not found!');
    console.error(`   Expected file: ${SCRAPED_DATA_FILE}`);
    console.error('   Run scrape-dobryprivat.mjs first.');
    process.exit(1);
  }

  // Load scraped businesses
  const businesses = JSON.parse(fs.readFileSync(SCRAPED_DATA_FILE, 'utf8'));
  console.log(`📊 Loaded ${businesses.length} businesses from scraped data\n`);

  if (businesses.length === 0) {
    console.error('❌ No businesses found in scraped data!');
    process.exit(1);
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Show browser so you can see it working
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 100 // Slow down by 100ms for visibility
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Login first
    await login(page);

    // Fill form for each business
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];

      console.log(`\n[${ i + 1}/${businesses.length}] Processing: ${business.name}`);

      try {
        await fillBusinessForm(page, business);
      } catch (error) {
        console.error(`❌ Error filling form for ${business.name}:`, error.message);
        console.log('   Continuing to next business...\n');
        continue;
      }
    }

    console.log('\n🎉 All businesses processed!');
    console.log('   Browser will stay open for review. Close manually when done.');

    // Keep browser open
    await new Promise(resolve => setTimeout(resolve, 300000)); // Wait 5 minutes

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    // Don't close browser automatically
    // await browser.close();
  }
}

// Run
main().catch(console.error);
