#!/usr/bin/env node

/**
 * Auto-register businesses and profiles on localhost
 * Reads scraped data and submits forms to create real database entries
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRAPED_DATA_FILE = path.join(__dirname, 'scraped-businesses', 'businesses.json');

/**
 * Login to localhost
 */
async function login(page, email = 'admin@erosko.cz', password = 'admin123') {
  console.log('🔐 Logging in...');

  await page.goto('http://localhost:3000/prihlaseni', { waitUntil: 'networkidle2' });

  // Wait for form to load
  await page.waitForSelector('input#email');

  // Fill login form
  await page.type('input#email', email);
  await page.type('input#password', password);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for successful login - check URL change after short delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check if login was successful by verifying URL changed
  const currentUrl = page.url();
  if (currentUrl.includes('/prihlaseni')) {
    throw new Error('Login failed - still on login page');
  }

  // Extra wait to ensure page is ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('✅ Logged in successfully\n');
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
  if (!city) return 'Praha';

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
 * Determine profile category based on business type
 */
function determineProfileCategory(businessType) {
  switch (businessType) {
    case 'MASSAGE_SALON':
      return 'EROTICKE_MASERKY';
    case 'ESCORT_AGENCY':
    case 'PRIVAT':
    case 'NIGHT_CLUB':
    case 'STRIP_CLUB':
    case 'SWINGERS_CLUB':
      return 'HOLKY_NA_SEX';
    case 'DIGITAL_AGENCY':
      return 'DIGITALNI_SLUZBY';
    default:
      return 'HOLKY_NA_SEX';
  }
}

/**
 * Create business and return businessId
 */
async function createBusiness(page, business) {
  console.log(`📝 Creating business: ${business.name}`);

  await page.goto('http://localhost:3000/pridat-podnik', { waitUntil: 'networkidle2' });

  // Wait for form to load
  await page.waitForSelector('form');

  // Fill business type (first select dropdown)
  const businessType = determineBusinessType(business);
  const typeSelects = await page.$$('select');
  await typeSelects[0].select(businessType);
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

  // Fill city (second select dropdown)
  const normalizedCity = normalizeCity(business.city);
  await typeSelects[1].select(normalizedCity);
  console.log(`   City: ${normalizedCity}`);

  // Fill address
  if (business.address) {
    await page.type('input[placeholder*="Ulice"]', business.address);
    console.log(`   Address: ${business.address}`);
  }

  // Set up dialog handler BEFORE clicking submit
  page.once('dialog', async dialog => {
    console.log(`   💬 Alert: ${dialog.message()}`);
    await dialog.accept();
  });

  // Click submit button
  console.log('\n   ⏳ Submitting business...');
  await page.click('button[type="submit"]');

  // Wait for page to navigate away (simple delay + URL check)
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check if form submission was successful
  const currentUrl = page.url();
  if (currentUrl.includes('/pridat-podnik')) {
    console.log('   ⚠️  Warning: Still on business form page');
  }

  console.log('   ✅ Business created!\n');

  // Wait a bit for DB to settle
  await new Promise(resolve => setTimeout(resolve, 2000));

  return businessType;
}

/**
 * Create profile for a business
 */
async function createProfile(page, profile, businessName, businessType) {
  console.log(`   📝 Creating profile: ${profile.name}`);

  await page.goto('http://localhost:3000/pridat-inzerat', { waitUntil: 'networkidle2' });

  // Wait for form to load
  await page.waitForSelector('form');

  // Profile type - default to SALON/PRIVAT based on business type
  let profileType = 'SOLO';
  if (businessType === 'MASSAGE_SALON') {
    profileType = 'SALON';
  } else if (businessType === 'PRIVAT') {
    profileType = 'PRIVAT';
  } else if (businessType === 'ESCORT_AGENCY') {
    profileType = 'ESCORT_AGENCY';
  }

  await page.select('select', profileType);
  console.log(`      Profile type: ${profileType}`);

  // Business name (only if not SOLO)
  if (profileType !== 'SOLO' && businessName) {
    await page.type('input#businessName', businessName);
    console.log(`      Business: ${businessName}`);
  }

  // Category
  const category = determineProfileCategory(businessType);
  const selects = await page.$$('select');
  await selects[1].select(category);
  console.log(`      Category: ${category}`);

  // Name
  await page.type('input#name', profile.name);
  console.log(`      Name: ${profile.name}`);

  // Age (default to 25 if not available)
  const age = profile.age || '25';
  await page.type('input#age', age.toString());
  console.log(`      Age: ${age}`);

  // City
  const city = normalizeCity(profile.city);
  await page.select('select#city', city);
  console.log(`      City: ${city}`);

  // Phone
  const phone = profile.phone || '+420123456789';
  await page.type('input#phone', phone);
  console.log(`      Phone: ${phone}`);

  // Services - check first service (required)
  const checkboxes = await page.$$('input[type="checkbox"]');
  if (checkboxes.length > 0) {
    await checkboxes[0].click();
    // Check a few more randomly
    if (checkboxes.length > 2) {
      await checkboxes[1].click();
      await checkboxes[2].click();
    }
    console.log(`      Services: Selected ${Math.min(3, checkboxes.length)} services`);
  }

  // Submit
  console.log('      ⏳ Submitting profile...');
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

  console.log('      ✅ Profile created!\n');

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Auto-register businesses and profiles on localhost\n');
  console.log('═══════════════════════════════════════════════════\n');

  // Check if scraped data exists
  if (!fs.existsSync(SCRAPED_DATA_FILE)) {
    console.error('❌ Error: Scraped data not found!');
    console.error(`   Expected file: ${SCRAPED_DATA_FILE}`);
    console.error('   Run scrape-dobryprivat.mjs first.');
    process.exit(1);
  }

  // Load scraped businesses
  const businesses = JSON.parse(fs.readFileSync(SCRAPED_DATA_FILE, 'utf8'));
  console.log(`📊 Loaded ${businesses.length} businesses from scraped data`);

  // Count total profiles
  const totalProfiles = businesses.reduce((sum, b) => sum + (b.profiles?.length || 0), 0);
  console.log(`👥 Total profiles to create: ${totalProfiles}\n`);

  if (businesses.length === 0) {
    console.error('❌ No businesses found in scraped data!');
    process.exit(1);
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Show browser so you can see it working
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 50 // Slow down by 50ms for visibility
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // Login first
    await login(page);

    let successCount = 0;
    let errorCount = 0;

    // Process each business
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];

      console.log(`\n[${i + 1}/${businesses.length}] Processing: ${business.name}`);
      console.log('─'.repeat(60));

      try {
        // Create business
        const businessType = await createBusiness(page, business);
        successCount++;

        // Create profiles for this business
        if (business.profiles && business.profiles.length > 0) {
          console.log(`   👥 Creating ${business.profiles.length} profiles for ${business.name}...\n`);

          for (let j = 0; j < business.profiles.length; j++) {
            const profile = business.profiles[j];

            console.log(`   [${j + 1}/${business.profiles.length}]`);

            try {
              await createProfile(page, profile, business.name, businessType);
              successCount++;
            } catch (error) {
              console.error(`      ❌ Error creating profile ${profile.name}:`, error.message);
              errorCount++;
            }
          }
        }

      } catch (error) {
        console.error(`❌ Error processing ${business.name}:`, error.message);
        errorCount++;
        continue;
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 REGISTRATION COMPLETE!');
    console.log('═'.repeat(60));
    console.log(`✅ Successfully created: ${successCount} entries`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount}`);
    }
    console.log('\n📸 Photos available in: scraped-businesses/photos/');
    console.log('   Upload manually through business dashboard');
    console.log('\n⚠️  Note: All businesses and profiles require admin approval');
    console.log('   to appear publicly on the site.');
    console.log('═'.repeat(60));

    console.log('\n   Browser will stay open for review. Close manually when done.');

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
