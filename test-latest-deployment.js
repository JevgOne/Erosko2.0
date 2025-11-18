/**
 * Test the latest Vercel deployment
 */

const DEPLOYMENT_URL = 'https://erosko-2-21ea3u7jc-jevg-ones-projects.vercel.app';
const API_URL = DEPLOYMENT_URL + '/api/profiles';

async function testFilter(filterName, filterValue) {
  try {
    const url = `${API_URL}?${filterName}=${encodeURIComponent(filterValue)}`;
    console.log(`Testing: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ FAIL: HTTP ${response.status}: ${data.error}`);
      return false;
    }

    const resultCount = data.profiles?.length || 0;
    console.log(`✅ PASS: ${resultCount} results`);
    return true;
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\nTesting latest Vercel deployment...\n');

  await testFilter('hairColor', 'Blond');
  await testFilter('bodyType', 'Štíhlá');
  await testFilter('ethnicity', 'Česká');
  await testFilter('tattoo', 'Ne');
  await testFilter('piercing', 'Ne');
  await testFilter('breastSize', '2');
}

runTests();
