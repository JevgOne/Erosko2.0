// Analyze HTML structure of eroguide.cz and banging.cz
import axios from 'axios';
import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'cs,en;q=0.9',
};

async function analyzeEroguide() {
  console.log('🔍 Analyzing eroguide.cz...\n');

  try {
    const response = await axios.get('https://www.eroguide.cz', { headers });
    const $ = cheerio.load(response.data);

    console.log('📋 All links on homepage:');
    const links = new Set<string>();
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href && href.startsWith('/')) {
        links.add(href);
      }
    });

    Array.from(links).slice(0, 30).forEach(link => console.log(`  ${link}`));

    console.log('\n📸 Image tags:');
    $('img').slice(0, 10).each((_, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt');
      console.log(`  ${src} - ${alt}`);
    });

    console.log('\n🏷️  Classes used:');
    const classes = new Set<string>();
    $('[class]').each((_, element) => {
      const classNames = $(element).attr('class')?.split(' ') || [];
      classNames.forEach(c => {
        if (c && !c.includes('fa-') && !c.includes('w-') && !c.includes('h-')) {
          classes.add(c);
        }
      });
    });

    Array.from(classes).slice(0, 30).forEach(className => console.log(`  .${className}`));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function analyzeBanging() {
  console.log('\n\n🔍 Analyzing banging.cz...\n');

  try {
    const response = await axios.get('https://www.banging.cz', { headers });
    const $ = cheerio.load(response.data);

    console.log('📋 All links on homepage:');
    const links = new Set<string>();
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href && href.startsWith('/')) {
        links.add(href);
      }
    });

    Array.from(links).slice(0, 30).forEach(link => console.log(`  ${link}`));

    console.log('\n📸 Image tags:');
    $('img').slice(0, 10).each((_, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt');
      console.log(`  ${src} - ${alt}`);
    });

    console.log('\n🏷️  Classes used:');
    const classes = new Set<string>();
    $('[class]').each((_, element) => {
      const classNames = $(element).attr('class')?.split(' ') || [];
      classNames.forEach(c => {
        if (c && !c.includes('fa-') && !c.includes('w-') && !c.includes('h-')) {
          classes.add(c);
        }
      });
    });

    Array.from(classes).slice(0, 30).forEach(className => console.log(`  .${className}`));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  await analyzeEroguide();
  await analyzeBanging();
}

main().catch(console.error);
