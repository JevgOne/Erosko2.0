import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface WorkingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

interface ProfileData {
  url: string;
  name: string;
  age?: number;
  phone?: string[];
  whatsapp?: string;
  address?: string;
  city?: string;
  photos: string[];
  workingHours?: WorkingHours;
  services: string[];
  measurements?: {
    breastSize?: string;
    weight?: number;
    height?: number;
    bodyType?: string;
  };
  languages?: string[];
  description?: string;
  categories?: string[];
  rolePlay?: string[];
  scrapedAt: string;
}

class DobryPrivatScraper {
  private browser: Browser | null = null;
  private baseUrl = 'https://www.dobryprivat.cz';
  private outputDir = './scraped-dobryprivat';
  private profilesFile = path.join(this.outputDir, 'profiles.json');
  private errorLog = path.join(this.outputDir, 'errors.log');

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private logError(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n${error ? JSON.stringify(error, null, 2) : ''}\n\n`;
    fs.appendFileSync(this.errorLog, logMessage);
    console.error(message, error);
  }

  async getAllProfileUrls(): Promise<string[]> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    const profileUrls: Set<string> = new Set();

    try {
      console.log('Getting all profile URLs from main listing page...');

      let pageNum = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        try {
          const url = pageNum === 1
            ? `${this.baseUrl}/divky/`
            : `${this.baseUrl}/divky/page/${pageNum}/`;

          console.log(`Loading page ${pageNum}: ${url}`);
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

          // Wait for profile listings to load
          await page.waitForSelector('.holky-ul', { timeout: 15000 });

          // Extract profile URLs from this page
          const urls = await page.evaluate(function() {
            const links = Array.from(document.querySelectorAll('.holky-ul li a:nth-child(1)')) as HTMLAnchorElement[];
            const profileUrls = links.map(function(link) {
              const href = link.href;
              // Only include profile URLs (divka/)
              return href.includes('/divka/') ? href : null;
            }).filter(Boolean);
            return Array.from(new Set(profileUrls));
          });

          if (urls.length === 0) {
            console.log(`No more profiles found on page ${pageNum}`);
            hasMorePages = false;
          } else {
            urls.forEach(url => profileUrls.add(url));
            console.log(`Found ${urls.length} profiles on this page (total: ${profileUrls.size})`);

            // Check if there's a next page
            const hasNext = await page.evaluate(function() {
              const nextButton = document.querySelector('a.next.page-numbers');
              return nextButton !== null;
            });

            if (!hasNext) {
              console.log('No more pages available');
              hasMorePages = false;
            } else {
              pageNum++;
              // Add delay to avoid rate limiting
              await this.delay(2000);
            }
          }

        } catch (error) {
          this.logError(`Error scraping page ${pageNum}`, error);
          hasMorePages = false;
        }
      }

    } catch (error) {
      this.logError('Error in getAllProfileUrls', error);
    } finally {
      await page.close();
    }

    console.log(`\nTotal unique profiles found: ${profileUrls.size}\n`);
    return Array.from(profileUrls);
  }

  async scrapeProfile(url: string): Promise<ProfileData | null> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();

    try {
      console.log(`Scraping profile: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const data = await page.evaluate(function() {
        function getText(selector) {
          const el = document.querySelector(selector);
          return el?.textContent?.trim() || undefined;
        }

        function getTexts(selector) {
          return Array.from(document.querySelectorAll(selector))
            .map(function(el) { return el.textContent?.trim(); })
            .filter(Boolean);
        }

        function findByText(text) {
          const items = Array.from(document.querySelectorAll('.detail-bottom-left-item'));
          for (const item of items) {
            if (item.textContent?.includes(text)) {
              return item.textContent?.trim();
            }
          }
          return undefined;
        }

        // Extract name
        const name = getText('.detail-info h1, .single-divka h1, h1.entry-title') || '';

        // Extract age
        const ageItem = findByText('Věk') || findByText('let');
        const age = ageItem ? parseInt(ageItem.match(/\d+/)?.[0] || '0') : undefined;

        // Extract phone numbers
        const phoneLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'));
        const phones = phoneLinks.map(function(link) {
          const href = link.href;
          return href.replace('tel:', '').replace(/\s/g, '').trim();
        }).filter(Boolean);

        // Extract WhatsApp
        const whatsappLink = document.querySelector('a[data-share="whatsapp"], .detail-whatsapp a, a[href*="whatsapp"]');
        const whatsapp = whatsappLink ? whatsappLink.href.match(/\d+/)?.[0] : undefined;

        // Extract address and city
        const addressText = getText('.detail-adresa-text') || findByText('Adresa');
        const cityItem = findByText('Město') || findByText('Praha') || findByText('Brno');
        const cityText = cityItem?.replace('Město:', '').trim();

        // Extract photos - multiple selectors for different gallery implementations
        const photoElements = Array.from(document.querySelectorAll(
          'a[data-fancybox="global-gallery"], a[data-fancybox] img, .gallery img, .woocommerce-product-gallery img'
        ));
        const photoUrls = photoElements.map(function(el) {
          let url = '';
          if (el.tagName === 'A') {
            url = el.href;
          } else if (el.tagName === 'IMG') {
            url = el.src;
            // Try to get parent link if exists
            const parent = el.parentElement;
            if (parent && parent.tagName === 'A') {
              url = parent.href;
            }
          }
          // Get full-size image URL by removing size suffixes
          return url?.replace(/-\d+x\d+(\.(jpg|jpeg|png|gif|webp))/i, '$1') || url;
        }).filter(Boolean);
        const photos = [...new Set(photoUrls)];

        // Extract working hours
        const workingHours: any = {};
        const dayMap: { [key: string]: string } = {
          'pondělí': 'monday', 'pondelí': 'monday', 'pondeli': 'monday',
          'úterý': 'tuesday', 'utery': 'tuesday',
          'středa': 'wednesday', 'streda': 'wednesday',
          'čtvrtek': 'thursday', 'ctvrtek': 'thursday',
          'pátek': 'friday', 'patek': 'friday',
          'sobota': 'saturday',
          'neděle': 'sunday', 'nedele': 'sunday'
        };

        const hoursRows = Array.from(document.querySelectorAll('.pracovni-doba tr, table tr, .detail-tabs-content tr'));
        hoursRows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const day = cells[0].textContent?.trim().toLowerCase() || '';
            const hours = cells[1].textContent?.trim() || '';
            const englishDay = dayMap[day];
            if (englishDay) {
              workingHours[englishDay] = hours;
            }
          }
        });

        // Extract services/practices
        const services = getTexts('a[href*="/praktiky/"]');

        // Extract measurements
        const measurements: any = {};
        const breastItem = findByText('Prsa');
        if (breastItem) {
          measurements.breastSize = breastItem.match(/\d+/)?.[0];
        }

        const weightItem = findByText('Váha');
        if (weightItem) {
          measurements.weight = parseInt(weightItem.match(/\d+/)?.[0] || '0');
        }

        const heightItem = findByText('Výška');
        if (heightItem) {
          measurements.height = parseInt(heightItem.match(/\d+/)?.[0] || '0');
        }

        const bodyTypeItem = findByText('Postava');
        if (bodyTypeItem) {
          measurements.bodyType = bodyTypeItem.replace('Postava:', '').trim();
        }

        // Extract languages
        const languagesItem = findByText('Jazyk');
        const languages = languagesItem?.replace('Jazyk:', '').split(',').map(function(l) { return l.trim(); }).filter(Boolean);

        // Extract description
        const description = getText('.detail-popis') ||
                          getText('.woocommerce-product-details__short-description') ||
                          getText('.et_pb_text_inner p') ||
                          getText('.entry-content p');

        // Extract categories
        const categories = getTexts('a[href*="/kategorie/"]');

        // Extract role-play options
        const rolePlay = getTexts('a[href*="/roleplay/"], a[href*="/nabidka/"]');

        return {
          name,
          age,
          phones,
          whatsapp,
          address: addressText,
          city: cityText,
          photos,
          workingHours: Object.keys(workingHours).length > 0 ? workingHours : undefined,
          services,
          measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
          languages,
          description,
          categories,
          rolePlay
        };
      });

      const profileData: ProfileData = {
        url,
        name: data.name,
        age: data.age,
        phone: data.phones.length > 0 ? data.phones : undefined,
        whatsapp: data.whatsapp,
        address: data.address,
        city: data.city,
        photos: data.photos,
        workingHours: data.workingHours,
        services: data.services,
        measurements: data.measurements,
        languages: data.languages,
        description: data.description,
        categories: data.categories,
        rolePlay: data.rolePlay,
        scrapedAt: new Date().toISOString()
      };

      await page.close();
      return profileData;

    } catch (error) {
      this.logError(`Error scraping profile: ${url}`, error);
      await page.close();
      return null;
    }
  }

  async scrapeAll() {
    try {
      console.log('Starting DobryPrivat scraper...');
      await this.init();

      // Get all profile URLs
      const profileUrls = await this.getAllProfileUrls();
      console.log(`\nFound ${profileUrls.length} profiles to scrape\n`);

      // Scrape each profile
      const profiles: ProfileData[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < profileUrls.length; i++) {
        const url = profileUrls[i];
        console.log(`\nProgress: ${i + 1}/${profileUrls.length}`);

        const profile = await this.scrapeProfile(url);

        if (profile) {
          profiles.push(profile);
          successCount++;

          // Save progress every 10 profiles
          if (profiles.length % 10 === 0) {
            this.saveProfiles(profiles);
            console.log(`Saved progress: ${profiles.length} profiles`);
          }
        } else {
          errorCount++;
        }

        // Add delay to avoid rate limiting
        await this.delay(3000);
      }

      // Save final results
      this.saveProfiles(profiles);

      console.log('\n=== SCRAPING COMPLETE ===');
      console.log(`Total profiles found: ${profileUrls.length}`);
      console.log(`Successfully scraped: ${successCount}`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Output file: ${this.profilesFile}`);

    } catch (error) {
      this.logError('Fatal error in scrapeAll', error);
    } finally {
      await this.close();
    }
  }

  private saveProfiles(profiles: ProfileData[]) {
    fs.writeFileSync(this.profilesFile, JSON.stringify(profiles, null, 2), 'utf-8');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run scraper
if (require.main === module) {
  const scraper = new DobryPrivatScraper();
  scraper.scrapeAll().catch(console.error);
}

export default DobryPrivatScraper;
