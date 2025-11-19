const DobryPrivatScraper = require('./dobryprivat-simple.js');

async function test() {
  const scraper = new DobryPrivatScraper();
  await scraper.init();

  console.log('Testing profile scraping...');
  const profile = await scraper.scrapeProfile('https://dobryprivat.cz/divka/emma-9/');

  if (profile) {
    console.log('\n=== PROFILE DATA ===');
    console.log(JSON.stringify(profile, null, 2));
    console.log('\n=== TEST PASSED ===');
  } else {
    console.log('\n=== TEST FAILED ===');
  }

  await scraper.close();
}

test().catch(console.error);
