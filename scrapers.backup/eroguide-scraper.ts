/**
 * EroGuide.cz Scraper
 *
 * Scrapes profiles from www.eroguide.cz
 * Data includes: name, age, measurements, services, pricing, hours, photos
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface ScrapedProfile {
  url: string;
  name: string;
  username: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  bust: string | null;
  city: string;
  address: string;
  salon: string | null;
  phone: string[];
  website: string | null;
  serviceType: string; // incall/outcall
  availability: string;
  openingHours: any;
  pricing: any[];
  services: string[];
  description: string;
  photos: string[];
  languages: string[];
  verified: boolean;
  scrapedAt: Date;
}

async function scrapeProfileList(page: puppeteer.Page, maxProfiles = 50): Promise<string[]> {
  console.log('🔍 Scraping profile list...');

  await page.goto('https://www.eroguide.cz/hledat', { waitUntil: 'networkidle2' });

  const profileUrls: string[] = [];
  let pageNum = 1;

  while (profileUrls.length < maxProfiles) {
    console.log(`  Page ${pageNum}...`);

    // Get profile URLs from current page
    const urls = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="/"]'));
      return links
        .map(a => (a as HTMLAnchorElement).href)
        .filter(href => {
          // Filter only profile pages (not /hledat, /auth, etc.)
          const path = new URL(href).pathname;
          return path !== '/' &&
                 path !== '/hledat' &&
                 !path.startsWith('/auth') &&
                 !path.startsWith('/hledat/') &&
                 path.split('/').length === 2; // Only /profile-name format
        });
    });

    // Add unique URLs
    urls.forEach(url => {
      if (!profileUrls.includes(url) && profileUrls.length < maxProfiles) {
        profileUrls.push(url);
      }
    });

    console.log(`  Found ${profileUrls.length} profiles so far`);

    // Try to click "Zobrazit další" (load more) button
    const hasMore = await page.evaluate(() => {
      const loadMoreBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent?.includes('Zobrazit další'));
      if (loadMoreBtn) {
        (loadMoreBtn as HTMLButtonElement).click();
        return true;
      }
      return false;
    });

    if (!hasMore) {
      break;
    }

    // Wait for new content to load
    await page.waitForTimeout(2000);
    pageNum++;
  }

  console.log(`✓ Found ${profileUrls.length} total profiles\n`);
  return profileUrls.slice(0, maxProfiles);
}

async function scrapeProfile(page: puppeteer.Page, url: string): Promise<ScrapedProfile | null> {
  try {
    console.log(`📄 Scraping: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const data = await page.evaluate(() => {
      // Helper functions
      const getText = (selector: string): string => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || '';
      };

      const getNumber = (text: string): number | null => {
        const match = text.match(/\d+/);
        return match ? parseInt(match[0]) : null;
      };

      // Extract profile data
      const name = getText('h1') || getText('[class*="name"]');
      const username = getText('[class*="username"]') || '';

      // Find age, height, weight from info sections
      const infoTexts = Array.from(document.querySelectorAll('[class*="info"], dt, dd, p'))
        .map(el => el.textContent?.trim() || '');

      let age = null, height = null, weight = null, bust = null;
      infoTexts.forEach(text => {
        if (text.includes('let') || text.includes('roků')) {
          age = getNumber(text);
        }
        if (text.includes('cm') && text.includes('výška')) {
          height = getNumber(text);
        }
        if (text.includes('kg')) {
          weight = getNumber(text);
        }
        if (text.includes('prsa') || text.includes('bust')) {
          bust = text.match(/\d/)?[0] || null;
        }
      });

      // City and address
      const locationText = getText('[class*="location"]') || getText('[class*="address"]');
      const city = locationText.split(',')[0] || 'Praha';

      // Salon info
      const salon = getText('[class*="salon"]') || null;

      // Phone numbers
      const phones = Array.from(document.querySelectorAll('a[href^="tel:"]'))
        .map(a => (a as HTMLAnchorElement).href.replace('tel:', ''));

      // Website
      const websiteEl = document.querySelector('a[href^="http"]:not([href*="eroguide"])') as HTMLAnchorElement;
      const website = websiteEl?.href || null;

      // Services
      const services = Array.from(document.querySelectorAll('[class*="service"], [class*="tag"]'))
        .map(el => el.textContent?.trim())
        .filter(Boolean) as string[];

      // Description
      const description = getText('[class*="description"]') || getText('[class*="bio"]') || '';

      // Photos - find all image URLs from cdn.eroguide.cz
      const photos = Array.from(document.querySelectorAll('img[src*="cdn.eroguide"]'))
        .map(img => (img as HTMLImageElement).src)
        .filter(src => src && !src.includes('avatar')); // Exclude avatars

      // Languages
      const languageText = infoTexts.find(t => t.includes('Jazyk') || t.includes('Language')) || '';
      const languages = languageText
        .split(/[,;]/)
        .map(l => l.trim())
        .filter(l => l && !l.includes('Jazyk'));

      return {
        name,
        username,
        age,
        height,
        weight,
        bust,
        city,
        address: locationText,
        salon,
        phone: phones,
        website,
        services,
        description,
        photos,
        languages,
      };
    });

    const profile: ScrapedProfile = {
      url,
      name: data.name,
      username: data.username,
      age: data.age,
      height: data.height,
      weight: data.weight,
      bust: data.bust,
      city: data.city,
      address: data.address,
      salon: data.salon,
      phone: data.phone,
      website: data.website,
      serviceType: 'incall', // Default, could be detected
      availability: 'available',
      openingHours: {},
      pricing: [],
      services: data.services,
      description: data.description,
      photos: data.photos,
      languages: data.languages,
      verified: false,
      scrapedAt: new Date(),
    };

    console.log(`  ✓ Name: ${profile.name}, Photos: ${profile.photos.length}`);
    return profile;

  } catch (error: any) {
    console.error(`  ✗ Error scraping ${url}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 EroGuide.cz Scraper Starting...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Set user agent to avoid blocking
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

  try {
    // Step 1: Get profile URLs
    const maxProfiles = parseInt(process.env.MAX_PROFILES || '20');
    const profileUrls = await scrapeProfileList(page, maxProfiles);

    // Step 2: Scrape each profile
    const profiles: ScrapedProfile[] = [];

    for (let i = 0; i < profileUrls.length; i++) {
      console.log(`\n[${i + 1}/${profileUrls.length}]`);

      const profile = await scrapeProfile(page, profileUrls[i]);
      if (profile) {
        profiles.push(profile);
      }

      // Polite delay between requests
      await page.waitForTimeout(1000 + Math.random() * 1000);
    }

    // Step 3: Save results
    const outputDir = path.join(process.cwd(), 'scraped-eroguide');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'profiles.json');
    fs.writeFileSync(outputPath, JSON.stringify(profiles, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ SCRAPING COMPLETE');
    console.log(`📦 Scraped ${profiles.length} profiles`);
    console.log(`💾 Saved to: ${outputPath}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

main();
