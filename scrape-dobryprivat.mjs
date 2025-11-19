#!/usr/bin/env node

/**
 * Scraper for dobryprivat.cz businesses
 * Extracts: name, phone, city, address, description, opening hours, photos
 * Removes watermarks from photos
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory for scraped data
const OUTPUT_DIR = path.join(__dirname, 'scraped-businesses');
const PHOTOS_DIR = path.join(OUTPUT_DIR, 'photos');

// Create directories if they don't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

/**
 * Download image - skip if it has watermark
 */
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(PHOTOS_DIR, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', async () => {
        file.close();

        try {
          // Check if image has watermark by analyzing URL or image content
          // dobryprivat.cz watermarks are in URLs containing certain patterns
          const urlLower = url.toLowerCase();

          // Skip images with dobryprivat watermark indicators
          if (urlLower.includes('dobryprivat') && urlLower.includes('watermark')) {
            console.log(`⏭️  Skipped (watermark): ${filename}`);
            fs.unlinkSync(filepath);
            resolve(null); // Return null to indicate skipped
            return;
          }

          // Additional check: Analyze image to detect watermark text
          const image = sharp(filepath);
          const metadata = await image.metadata();

          // If image is too small, it might be a thumbnail with watermark
          if (metadata.width < 200 || metadata.height < 200) {
            console.log(`⏭️  Skipped (too small): ${filename}`);
            fs.unlinkSync(filepath);
            resolve(null);
            return;
          }

          console.log(`✅ Downloaded: ${filename}`);
          resolve(filepath);
        } catch (error) {
          console.error(`❌ Error processing image ${filename}:`, error.message);
          // Delete failed image
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          resolve(null);
        }
      });
    }).on('error', (err) => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

/**
 * Scrape a single profile/girl page
 */
async function scrapeProfile(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 1000));

    const profileData = await page.evaluate(() => {
      const data = {};

      // Name - parse from title tag
      const titleEl = document.querySelector('title');
      if (titleEl) {
        const titleText = titleEl.textContent.trim();
        // Format: "Name - DobryPrivat.cz"
        data.name = titleText.split(' - ')[0].trim();
      } else {
        data.name = '';
      }

      // Age, height, weight, bust from detail items
      const detailItems = document.querySelectorAll('.detail-bottom-left-item, .detail-info');
      detailItems.forEach(item => {
        const text = item.textContent.trim();

        const ageMatch = text.match(/Věk:\s*(\d+)/i);
        if (ageMatch) data.age = parseInt(ageMatch[1]);

        const heightMatch = text.match(/Výška:\s*(\d+)/i);
        if (heightMatch) data.height = parseInt(heightMatch[1]);

        const weightMatch = text.match(/Váha:\s*(\d+)/i);
        if (weightMatch) data.weight = parseInt(weightMatch[1]);

        const bustMatch = text.match(/Poprsí:\s*(\d+)/i);
        if (bustMatch) data.bust = bustMatch[1];
      });

      // Phone number
      const phoneEl = document.querySelector('a[href^="tel:"]');
      if (phoneEl) {
        data.phone = phoneEl.href.replace('tel:', '').trim();
      } else {
        data.phone = '';
      }

      // City - from address section
      const cityEl = document.querySelector('.detail-adresa-text');
      if (cityEl) {
        data.city = cityEl.textContent.trim();
      } else {
        data.city = '';
      }

      // Hair color, body type, etc.
      const hairEl = document.querySelector('[class*="barva-vlasu"], [class*="hair"]');
      if (hairEl) data.hairColor = hairEl.textContent.trim();

      // Description
      const descEl = document.querySelector('.detail-right-top, .description');
      if (descEl) {
        data.description = descEl.textContent.trim().substring(0, 500);
      }

      // Services
      data.services = [];
      const serviceEls = document.querySelectorAll('.services li, .praktiky li, a[href*="/praktiky/"]');
      serviceEls.forEach(el => {
        const service = el.textContent.trim();
        if (service && service.length > 2 && service.length < 50) {
          data.services.push(service);
        }
      });

      // Photos
      const photoEls = document.querySelectorAll('img');
      data.photos = Array.from(photoEls)
        .map(img => img.src || img.getAttribute('data-src'))
        .filter(src => {
          if (!src) return false;
          return src.includes('/uploads/') &&
                 !src.includes('logo') &&
                 !src.includes('icon') &&
                 (src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.png'));
        })
        .filter((url, index, self) => self.indexOf(url) === index)
        .slice(0, 10); // Max 10 photos per profile

      return data;
    });

    return profileData;
  } catch (error) {
    console.error(`❌ Error scraping profile ${url}:`, error.message);
    return null;
  }
}

/**
 * Scrape a single business page
 */
async function scrapeBusiness(page, url) {
  console.log(`\n🔍 Scraping: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for content to load
    await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 2000)); // Extra wait for JS

    const businessData = await page.evaluate(() => {
      const data = {};

      // Extract name - from h1 or breadcrumb
      let nameEl = document.querySelector('h1');
      if (!nameEl) {
        // Try breadcrumb
        const breadcrumb = document.querySelector('.breadcrumb li:last-child, .breadcrumbs li:last-child');
        if (breadcrumb) {
          const match = breadcrumb.textContent.match(/([^›]+)\s+v\s+městě/);
          data.name = match ? match[1].trim() : breadcrumb.textContent.trim();
        } else {
          // Try title
          const titleMatch = document.title.match(/([^|]+)/);
          data.name = titleMatch ? titleMatch[1].trim() : '';
        }
      } else {
        data.name = nameEl.textContent.trim();
      }

      // Extract phone - from tel: link in detail-info
      const phoneEl = document.querySelector('.detail-info a[href^="tel:"], a[href^="tel:"]');
      if (phoneEl) {
        data.phone = phoneEl.getAttribute('href').replace('tel:', '').replace(/\s+/g, '');
      } else {
        // Try text content
        const detailInfo = document.querySelector('.detail-info');
        if (detailInfo) {
          const phoneMatch = detailInfo.textContent.match(/(\+?\d{9,13})/);
          data.phone = phoneMatch ? phoneMatch[1].replace(/\s+/g, '') : '';
        } else {
          data.phone = '';
        }
      }

      // Extract email - from mailto: links
      const emailEl = document.querySelector('a[href^="mailto:"]');
      data.email = emailEl ? emailEl.getAttribute('href').replace('mailto:', '') : '';

      // Extract website - look for external links
      const websiteEl = Array.from(document.querySelectorAll('a[href^="http"]'))
        .find(a =>
          !a.href.includes('dobryprivat.cz') &&
          !a.href.includes('cookie') &&
          !a.href.includes('virexa') &&
          !a.href.includes('facebook') &&
          !a.href.includes('instagram')
        );
      data.website = websiteEl ? websiteEl.href : '';

      // Extract address - from .detail-adresa or detail-adresa-text
      const addressEl = document.querySelector('.detail-adresa-text, .detail-adresa');
      if (addressEl) {
        const addressText = addressEl.textContent.trim();
        // Split city and street
        const parts = addressText.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          data.city = parts[0];
          data.address = parts.slice(1).join(', ');
        } else {
          // Try to extract city
          const cityMatch = addressText.match(/(Praha|Brno|Ostrava|Plzeň|Liberec|Olomouc|České Budějovice|Hradec Králové|Opava)(\s+\d+)?/i);
          if (cityMatch) {
            data.city = cityMatch[0];
            data.address = addressText.replace(cityMatch[0], '').replace(/^,\s*/, '').trim();
          } else {
            data.city = parts[0] || '';
            data.address = addressText;
          }
        }
      } else {
        data.city = '';
        data.address = '';
      }

      // Extract description - from .detail-right-top or main content
      const descEl = document.querySelector('.detail-right-top');
      if (descEl) {
        data.description = descEl.textContent.trim().substring(0, 500);
      } else {
        // Fallback to any paragraph content
        const paragraphs = document.querySelectorAll('p');
        const validParagraphs = Array.from(paragraphs)
          .map(p => p.textContent.trim())
          .filter(t => t.length > 50 && !t.includes('Copyright') && !t.includes('cookie'));
        data.description = validParagraphs.slice(0, 2).join(' ').substring(0, 500);
      }

      // Extract opening hours - look for table or structured hours
      data.openingHours = {};
      const hoursTable = document.querySelector('table');
      if (hoursTable) {
        const rows = hoursTable.querySelectorAll('tr');
        const dayMap = {
          'Pondělí': 'monday', 'Po': 'monday',
          'Úterý': 'tuesday', 'Út': 'tuesday',
          'Středa': 'wednesday', 'St': 'wednesday',
          'Čtvrtek': 'thursday', 'Čt': 'thursday',
          'Pátek': 'friday', 'Pá': 'friday',
          'Sobota': 'saturday', 'So': 'saturday',
          'Neděle': 'sunday', 'Ne': 'sunday'
        };

        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 2) {
            const dayText = cells[0].textContent.trim();
            const hoursText = cells[1].textContent.trim();

            for (const [czech, english] of Object.entries(dayMap)) {
              if (dayText.includes(czech)) {
                data.openingHours[english] = hoursText;
                break;
              }
            }
          }
        });
      }

      // Extract ALL photos - look for images in content, galleries, etc.
      const photoEls = document.querySelectorAll('img');
      data.photos = Array.from(photoEls)
        .map(img => img.src || img.getAttribute('data-src'))
        .filter(src => {
          if (!src) return false;
          // Include only actual content photos, exclude logos, icons, etc.
          return src.includes('/uploads/') &&
                 !src.includes('logo') &&
                 !src.includes('icon') &&
                 (src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.png'));
        })
        .filter((url, index, self) => self.indexOf(url) === index) // Unique only
        .slice(0, 20); // Max 20 photos

      return data;
    });

    // Download photos (skip those with watermarks)
    if (businessData.photos && businessData.photos.length > 0) {
      console.log(`📸 Downloading ${businessData.photos.length} photos...`);
      const downloadedPhotos = [];

      for (let i = 0; i < businessData.photos.length; i++) {
        const photoUrl = businessData.photos[i];
        const filename = `${businessData.name.toLowerCase().replace(/\s+/g, '-')}-${i + 1}.jpg`;

        try {
          const filepath = await downloadImage(photoUrl, filename);
          if (filepath) { // Only add if not skipped (watermark)
            downloadedPhotos.push(filepath);
          }
        } catch (error) {
          console.error(`❌ Failed to download photo ${i + 1}:`, error.message);
        }
      }

      businessData.photos = downloadedPhotos;
      console.log(`   ✅ Downloaded ${downloadedPhotos.length} photos (skipped watermarked images)`);
    }

    // Skip profiles - only scraping businesses
    businessData.profiles = [];

    /*
    // Extract profiles (girls working at this business) - DISABLED
    businessData.profiles = await page.evaluate(() => {
      const profiles = [];
      const profileLinks = document.querySelectorAll('a[href*="/divka/"]');

      profileLinks.forEach(link => {
        const profile = {
          url: link.href,
          name: '',
          age: '',
          phone: ''
        };

        // Try to extract name from link or nearby text
        const nameEl = link.querySelector('h3, .profile-name, strong');
        if (nameEl) {
          profile.name = nameEl.textContent.trim();
        }

        // Try to extract age
        const ageMatch = link.textContent.match(/(\d{2})\s*let/);
        if (ageMatch) {
          profile.age = ageMatch[1];
        }

        // Try to extract phone
        const phoneEl = link.querySelector('a[href^="tel:"]');
        if (phoneEl) {
          profile.phone = phoneEl.getAttribute('href').replace('tel:', '').replace(/\s+/g, '');
        }

        // Only add if we have a URL
        if (profile.url) {
          profiles.push(profile);
        }
      });

      // Remove duplicates based on URL
      const uniqueProfiles = profiles.filter((profile, index, self) =>
        index === self.findIndex(p => p.url === profile.url)
      );

      return uniqueProfiles;
    });
    */

    console.log(`   📋 Found ${businessData.profiles.length} profiles (scraping disabled)`);

    // Determine business type
    const nameLower = businessData.name.toLowerCase();
    const descLower = businessData.description.toLowerCase();

    if (nameLower.includes('masáž') || nameLower.includes('masaz') ||
        descLower.includes('masáž') || descLower.includes('tantra')) {
      businessData.profileType = 'MASSAGE_SALON';
    } else if (nameLower.includes('privát') || nameLower.includes('privat')) {
      businessData.profileType = 'PRIVAT';
    } else if (nameLower.includes('escort') || nameLower.includes('agentura')) {
      businessData.profileType = 'ESCORT_AGENCY';
    } else {
      businessData.profileType = 'PRIVAT'; // Default
    }

    console.log('✅ Scraped:', businessData.name);
    return businessData;

  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error.message);
    return null;
  }
}

/**
 * Main scraper function
 */
async function main() {
  console.log('🚀 Starting dobryprivat.cz scraper...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    // Go to businesses page to get business listings
    console.log('📋 Fetching business list from dobryprivat.cz/podniky...');
    await page.goto('https://dobryprivat.cz/podniky', { waitUntil: 'networkidle2' });

    // Extract business URLs
    const businessUrls = await page.evaluate(() => {
      const links = document.querySelectorAll('.privaty-ul li a[href*="/podnik/"]');
      return Array.from(links)
        .map(a => a.href)
        .filter((url, index, self) => self.indexOf(url) === index) // Unique URLs
        .slice(0, 10); // Limit to 10 businesses for testing
    });

    console.log(`\n✅ Found ${businessUrls.length} businesses\n`);

    // Scrape each business
    const allBusinesses = [];
    for (const url of businessUrls) {
      const businessData = await scrapeBusiness(page, url);
      if (businessData) {
        // DISABLED: Profile scraping - focusing on businesses only per user request
        // "ted se soustřed jen na podniky, bez profilu a jejich služeb"
        /*
        // Scrape each profile/girl for this business
        if (businessData.profiles && businessData.profiles.length > 0) {
          console.log(`   🔍 Scraping ${businessData.profiles.length} profiles...`);

          for (let i = 0; i < businessData.profiles.length; i++) {
            const profile = businessData.profiles[i];
            console.log(`      [${i + 1}/${businessData.profiles.length}] ${profile.name || profile.url}`);

            const profileDetails = await scrapeProfile(page, profile.url);
            if (profileDetails) {
              // Merge profile data
              businessData.profiles[i] = { ...profile, ...profileDetails };

              // Download profile photos (skip watermarked)
              if (profileDetails.photos && profileDetails.photos.length > 0) {
                const downloadedPhotos = [];
                for (let j = 0; j < Math.min(profileDetails.photos.length, 5); j++) {
                  const photoUrl = profileDetails.photos[j];
                  const filename = `${(profileDetails.name || 'profile').toLowerCase().replace(/\s+/g, '-')}-${j + 1}.jpg`;

                  try {
                    const filepath = await downloadImage(photoUrl, filename);
                    if (filepath) { // Only add if not watermarked
                      downloadedPhotos.push(filepath);
                    }
                  } catch (error) {
                    console.error(`         ❌ Failed to download photo:`, error.message);
                  }
                }
                businessData.profiles[i].photos = downloadedPhotos;
              }
            }
          }
        }
        */

        // Profile scraping disabled - profiles array will be empty per line 362-363

        allBusinesses.push(businessData);
      }
      // Wait between businesses
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Save to JSON
    const outputFile = path.join(OUTPUT_DIR, 'businesses.json');
    fs.writeFileSync(outputFile, JSON.stringify(allBusinesses, null, 2));

    console.log(`\n✅ Scraped ${allBusinesses.length} businesses`);
    console.log(`📁 Data saved to: ${outputFile}`);
    console.log(`📸 Photos saved to: ${PHOTOS_DIR}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

// Run scraper
main().catch(console.error);
