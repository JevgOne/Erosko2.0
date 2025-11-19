const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class DobryPrivatScraper {
  constructor() {
    this.browser = null;
    this.baseUrl = 'https://www.dobryprivat.cz';
    this.outputDir = './scraped-dobryprivat';
    this.profilesFile = path.join(this.outputDir, 'profiles.json');
    this.errorLog = path.join(this.outputDir, 'errors.log');
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  logError(message, error) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n${error ? JSON.stringify(error, null, 2) : ''}\n\n`;
    fs.appendFileSync(this.errorLog, logMessage);
    console.error(message, error);
  }

  async getAllProfileUrls() {
    const page = await this.browser.newPage();
    const profileUrls = new Set();

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
          await page.waitForSelector('.holky-ul', { timeout: 15000 });

          const urls = await page.evaluate(function() {
            const links = Array.from(document.querySelectorAll('.holky-ul li a:nth-child(1)'));
            const profileUrls = links.map(function(link) {
              const href = link.href;
              return href.includes('/divka/') ? href : null;
            }).filter(Boolean);
            return [...new Set(profileUrls)];
          });

          if (urls.length === 0) {
            console.log(`No more profiles found on page ${pageNum}`);
            hasMorePages = false;
          } else {
            urls.forEach(url => profileUrls.add(url));
            console.log(`Found ${urls.length} profiles on this page (total: ${profileUrls.size})`);

            const hasNext = await page.evaluate(function() {
              const nextButton = document.querySelector('a.next.page-numbers');
              return nextButton !== null;
            });

            if (!hasNext) {
              console.log('No more pages available');
              hasMorePages = false;
            } else {
              pageNum++;
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

  async scrapeProfile(url) {
    const page = await this.browser.newPage();

    try {
      console.log(`Scraping profile: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const data = await page.evaluate(function() {
        function getText(selector) {
          const el = document.querySelector(selector);
          return el && el.textContent ? el.textContent.trim() : undefined;
        }

        function getTexts(selector) {
          return Array.from(document.querySelectorAll(selector))
            .map(function(el) { return el.textContent ? el.textContent.trim() : ''; })
            .filter(Boolean);
        }

        function findByText(text) {
          const items = Array.from(document.querySelectorAll('.detail-bottom-left-item'));
          for (let i = 0; i < items.length; i++) {
            if (items[i].textContent && items[i].textContent.includes(text)) {
              return items[i].textContent.trim();
            }
          }
          return undefined;
        }

        const name = getText('.detail-info h1, .single-divka h1, h1.entry-title') || '';
        const ageItem = findByText('Věk') || findByText('let');
        const age = ageItem ? parseInt((ageItem.match(/\d+/) || ['0'])[0]) : undefined;

        const phoneLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'));
        const phones = phoneLinks.map(function(link) {
          const href = link.href;
          return href.replace('tel:', '').replace(/\s/g, '').trim();
        }).filter(Boolean);

        const whatsappLink = document.querySelector('a[data-share="whatsapp"], .detail-whatsapp a, a[href*="whatsapp"]');
        const whatsapp = whatsappLink && whatsappLink.href ? (whatsappLink.href.match(/\d+/) || [])[0] : undefined;

        const addressText = getText('.detail-adresa-text') || findByText('Adresa');
        const cityItem = findByText('Město') || findByText('Praha') || findByText('Brno');
        const cityText = cityItem ? cityItem.replace('Město:', '').trim() : undefined;

        const photoElements = Array.from(document.querySelectorAll(
          'a[data-fancybox="global-gallery"], a[data-fancybox] img, .gallery img, .woocommerce-product-gallery img'
        ));
        const photoUrls = photoElements.map(function(el) {
          let url = '';
          if (el.tagName === 'A') {
            url = el.href;
          } else if (el.tagName === 'IMG') {
            url = el.src;
            const parent = el.parentElement;
            if (parent && parent.tagName === 'A') {
              url = parent.href;
            }
          }
          return url ? url.replace(/-\d+x\d+(\.(jpg|jpeg|png|gif|webp))/i, '$1') : url;
        }).filter(Boolean);
        const photos = [...new Set(photoUrls)];

        const workingHours = {};
        const dayMap = {
          'pondělí': 'monday', 'pondelí': 'monday', 'pondeli': 'monday',
          'úterý': 'tuesday', 'utery': 'tuesday',
          'středa': 'wednesday', 'streda': 'wednesday',
          'čtvrtek': 'thursday', 'ctvrtek': 'thursday',
          'pátek': 'friday', 'patek': 'friday',
          'sobota': 'saturday',
          'neděle': 'sunday', 'nedele': 'sunday'
        };

        const hoursRows = Array.from(document.querySelectorAll('.pracovni-doba tr, table tr, .detail-tabs-content tr'));
        hoursRows.forEach(function(row) {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const day = cells[0].textContent ? cells[0].textContent.trim().toLowerCase() : '';
            const hours = cells[1].textContent ? cells[1].textContent.trim() : '';
            const englishDay = dayMap[day];
            if (englishDay) {
              workingHours[englishDay] = hours;
            }
          }
        });

        const services = getTexts('a[href*="/praktiky/"]');

        const measurements = {};
        const breastItem = findByText('Prsa');
        if (breastItem) {
          measurements.breastSize = (breastItem.match(/\d+/) || [])[0];
        }

        const weightItem = findByText('Váha');
        if (weightItem) {
          measurements.weight = parseInt((weightItem.match(/\d+/) || ['0'])[0]);
        }

        const heightItem = findByText('Výška');
        if (heightItem) {
          measurements.height = parseInt((heightItem.match(/\d+/) || ['0'])[0]);
        }

        const bodyTypeItem = findByText('Postava');
        if (bodyTypeItem) {
          measurements.bodyType = bodyTypeItem.replace('Postava:', '').trim();
        }

        const languagesItem = findByText('Jazyk');
        const languages = languagesItem ? languagesItem.replace('Jazyk:', '').split(',').map(function(l) { return l.trim(); }).filter(Boolean) : undefined;

        const description = getText('.detail-popis') ||
                          getText('.woocommerce-product-details__short-description') ||
                          getText('.et_pb_text_inner p') ||
                          getText('.entry-content p');

        const categories = getTexts('a[href*="/kategorie/"]');
        const rolePlay = getTexts('a[href*="/roleplay/"], a[href*="/nabidka/"]');

        return {
          name: name,
          age: age,
          phones: phones,
          whatsapp: whatsapp,
          address: addressText,
          city: cityText,
          photos: photos,
          workingHours: Object.keys(workingHours).length > 0 ? workingHours : undefined,
          services: services,
          measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
          languages: languages,
          description: description,
          categories: categories,
          rolePlay: rolePlay
        };
      });

      await page.close();

      return {
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

      const profileUrls = await this.getAllProfileUrls();
      console.log(`\nFound ${profileUrls.length} profiles to scrape\n`);

      const profiles = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < profileUrls.length; i++) {
        const url = profileUrls[i];
        console.log(`\nProgress: ${i + 1}/${profileUrls.length}`);

        const profile = await this.scrapeProfile(url);

        if (profile) {
          profiles.push(profile);
          successCount++;

          if (profiles.length % 10 === 0) {
            this.saveProfiles(profiles);
            console.log(`Saved progress: ${profiles.length} profiles`);
          }
        } else {
          errorCount++;
        }

        await this.delay(3000);
      }

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

  saveProfiles(profiles) {
    fs.writeFileSync(this.profilesFile, JSON.stringify(profiles, null, 2), 'utf-8');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (require.main === module) {
  const scraper = new DobryPrivatScraper();
  scraper.scrapeAll().catch(console.error);
}

module.exports = DobryPrivatScraper;
