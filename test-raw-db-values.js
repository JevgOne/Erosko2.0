/**
 * Test production database with English values directly
 * (bypassing translation layer to test database)
 */

const PRODUCTION_URL = 'https://erosko.cz';
const API_URL = PRODUCTION_URL + '/api/profiles';

async function testDirectEnglishValue(filterName, englishValue) {
  try {
    const url = `${API_URL}?${filterName}=${encodeURIComponent(englishValue)}`;
    console.log(`Testing: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ FAIL: HTTP ${response.status}: ${data.error}`);
      return { success: false, error: data.error };
    }

    const resultCount = data.profiles?.length || 0;
    console.log(`✅ PASS: ${resultCount} results`);
    return { success: true, count: resultCount };
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n=== Testing Production DB with ENGLISH values (no translation) ===\n');

  console.log('Hair Color:');
  await testDirectEnglishValue('hairColor', 'blonde');
  await testDirectEnglishValue('hairColor', 'brunette');
  await testDirectEnglishValue('hairColor', 'black');

  console.log('\nBody Type:');
  await testDirectEnglishValue('bodyType', 'slim');
  await testDirectEnglishValue('bodyType', 'athletic');
  await testDirectEnglishValue('bodyType', 'curvy');

  console.log('\nNationality:');
  await testDirectEnglishValue('ethnicity', 'czech');
  await testDirectEnglishValue('ethnicity', 'slovak');

  console.log('\nTattoos:');
  await testDirectEnglishValue('tattoo', 'none');
  await testDirectEnglishValue('tattoo', 'small');
  await testDirectEnglishValue('tattoo', 'medium');

  console.log('\nPiercing:');
  await testDirectEnglishValue('piercing', 'none');
  await testDirectEnglishValue('piercing', 'ears');
  await testDirectEnglishValue('piercing', 'multiple');
}

runTests();
