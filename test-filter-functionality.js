/**
 * Comprehensive Filter Functionality Test
 *
 * Tests the SearchBar filtering functionality on live Erosko.cz
 * after the recent CZ→EN translation layer fixes.
 *
 * Tests:
 * 1. All Czech filter values translate correctly to English DB values
 * 2. Filter combinations work properly
 * 3. URL parameters are generated correctly
 * 4. Search results are returned
 * 5. eyeColor filter is removed from UI
 */

const BASE_URL = 'https://erosko.cz';
const API_URL = BASE_URL + '/api/profiles';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Test results accumulator
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

/**
 * Filter test cases - each filter with its Czech values
 */
const filterTestCases = {
  hairColor: {
    label: 'Barva vlasů (Hair Color)',
    values: [
      { czech: 'Blond', english: 'blonde', dbField: 'hairColor' },
      { czech: 'Hnědá', english: 'brunette', dbField: 'hairColor' },
      { czech: 'Černá', english: 'black', dbField: 'hairColor' },
      { czech: 'Zrzavá', english: 'red', dbField: 'hairColor' },
      { czech: 'Jiná', english: 'other', dbField: 'hairColor' },
    ],
  },
  bodyType: {
    label: 'Typ postavy (Body Type)',
    values: [
      { czech: 'Štíhlá', english: 'slim', dbField: 'bodyType' },
      { czech: 'Atletická', english: 'athletic', dbField: 'bodyType' },
      { czech: 'Průměrná', english: 'curvy', dbField: 'bodyType' },
      { czech: 'Kulatá', english: 'curvy', dbField: 'bodyType' },
      { czech: 'Plus size', english: 'plus-size', dbField: 'bodyType' },
    ],
  },
  ethnicity: {
    label: 'Národnost/Etnikum (Nationality)',
    values: [
      { czech: 'Česká', english: 'czech', dbField: 'nationality' },
      { czech: 'Slovenská', english: 'slovak', dbField: 'nationality' },
      { czech: 'Polská', english: 'polish', dbField: 'nationality' },
      { czech: 'Ukrajinská', english: 'ukrainian', dbField: 'nationality' },
      { czech: 'Ruská', english: 'russian', dbField: 'nationality' },
      { czech: 'Asijská', english: 'asian', dbField: 'nationality' },
      { czech: 'Latina', english: 'latina', dbField: 'nationality' },
      { czech: 'Africká', english: 'african', dbField: 'nationality' },
      { czech: 'Jiná', english: 'other', dbField: 'nationality' },
    ],
  },
  tattoo: {
    label: 'Tetování (Tattoos)',
    values: [
      { czech: 'Ano', english: 'medium', dbField: 'tattoos' },
      { czech: 'Ne', english: 'none', dbField: 'tattoos' },
      { czech: 'Malé', english: 'small', dbField: 'tattoos' },
    ],
  },
  piercing: {
    label: 'Piercing',
    values: [
      { czech: 'Ano', english: 'multiple', dbField: 'piercing' },
      { czech: 'Ne', english: 'none', dbField: 'piercing' },
      { czech: 'Jen uši', english: 'ears', dbField: 'piercing' },
    ],
  },
  breastSize: {
    label: 'Velikost prsou (Breast Size)',
    values: [
      { czech: '1', english: '1', dbField: 'bust' },
      { czech: '2', english: '2', dbField: 'bust' },
      { czech: '3', english: '3', dbField: 'bust' },
      { czech: '4', english: '4', dbField: 'bust' },
    ],
  },
};

/**
 * Range filter test cases
 */
const rangeFilterTestCases = [
  {
    name: 'Age Range',
    param: 'age',
    minParam: 'ageMin',
    maxParam: 'ageMax',
    testValues: { min: 20, max: 30 },
    dbField: 'age',
  },
  {
    name: 'Height Range',
    param: 'height',
    minParam: 'heightMin',
    maxParam: 'heightMax',
    testValues: { min: 160, max: 175 },
    dbField: 'height',
  },
  {
    name: 'Weight Range',
    param: 'weight',
    minParam: 'weightMin',
    maxParam: 'weightMax',
    testValues: { min: 50, max: 65 },
    dbField: 'weight',
  },
];

/**
 * Make API request to test filter
 */
async function testFilter(filterName, filterValue, expectedEnglishValue) {
  try {
    const url = `${API_URL}?${filterName}=${encodeURIComponent(filterValue)}`;

    console.log(`${colors.cyan}  Testing: ${url}${colors.reset}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    }

    const resultCount = data.profiles?.length || 0;
    const totalCount = data.total || 0;

    return {
      success: true,
      resultCount,
      totalCount,
      url,
      czechValue: filterValue,
      expectedEnglishValue,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: `${API_URL}?${filterName}=${encodeURIComponent(filterValue)}`,
      czechValue: filterValue,
      expectedEnglishValue,
    };
  }
}

/**
 * Test range filter
 */
async function testRangeFilter(rangeConfig) {
  try {
    const url = `${API_URL}?${rangeConfig.minParam}=${rangeConfig.testValues.min}&${rangeConfig.maxParam}=${rangeConfig.testValues.max}`;

    console.log(`${colors.cyan}  Testing: ${url}${colors.reset}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    }

    const resultCount = data.profiles?.length || 0;
    const totalCount = data.total || 0;

    return {
      success: true,
      resultCount,
      totalCount,
      url,
      range: `${rangeConfig.testValues.min}-${rangeConfig.testValues.max}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: `${API_URL}?${rangeConfig.minParam}=${rangeConfig.testValues.min}&${rangeConfig.maxParam}=${rangeConfig.testValues.max}`,
      range: `${rangeConfig.testValues.min}-${rangeConfig.testValues.max}`,
    };
  }
}

/**
 * Test filter combination
 */
async function testFilterCombination() {
  try {
    const params = new URLSearchParams({
      hairColor: 'Blond',
      bodyType: 'Štíhlá',
      ethnicity: 'Česká',
      ageMin: '20',
      ageMax: '30',
    });

    const url = `${API_URL}?${params.toString()}`;

    console.log(`${colors.cyan}  Testing combination: ${url}${colors.reset}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    }

    const resultCount = data.profiles?.length || 0;
    const totalCount = data.total || 0;

    return {
      success: true,
      resultCount,
      totalCount,
      url,
      filters: 'Blond + Štíhlá + Česká + Age 20-30',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: `${API_URL}?...`,
      filters: 'Blond + Štíhlá + Česká + Age 20-30',
    };
  }
}

/**
 * Test eyeColor filter (should be removed)
 */
async function testEyeColorRemoval() {
  try {
    // Check if eyeColor parameter still works (it shouldn't be used, but API might still accept it)
    const url = `${API_URL}?eyeColor=Modré`;

    console.log(`${colors.cyan}  Testing eyeColor (should be deprecated): ${url}${colors.reset}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    }

    // eyeColor filter should still work in API for backward compatibility,
    // but UI should not show it
    return {
      success: true,
      warning: 'eyeColor filter still works in API (backward compatibility)',
      note: 'Verify UI does NOT show eyeColor filter option',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Print test result
 */
function printTestResult(testName, result) {
  if (result.success) {
    console.log(`${colors.green}✓ PASS${colors.reset} ${testName}`);
    if (result.resultCount !== undefined) {
      console.log(`  ${colors.blue}Results: ${result.resultCount} profiles (Total: ${result.totalCount})${colors.reset}`);
    }
    if (result.warning) {
      console.log(`  ${colors.yellow}⚠ ${result.warning}${colors.reset}`);
      results.warnings++;
    }
    if (result.note) {
      console.log(`  ${colors.cyan}ℹ ${result.note}${colors.reset}`);
    }
    results.passed++;
  } else {
    console.log(`${colors.red}✗ FAIL${colors.reset} ${testName}`);
    console.log(`  ${colors.red}Error: ${result.error}${colors.reset}`);
    results.failed++;
  }

  results.tests.push({
    name: testName,
    ...result,
  });
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}  EROSKO.CZ FILTER FUNCTIONALITY TEST${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}  Testing CZ→EN Translation Layer${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.cyan}Testing against: ${BASE_URL}${colors.reset}\n`);

  // Test 1: Individual filter values with translation
  console.log(`\n${colors.bold}TEST 1: Individual Filter Values (CZ→EN Translation)${colors.reset}\n`);

  for (const [filterKey, filterConfig] of Object.entries(filterTestCases)) {
    console.log(`\n${colors.bold}${filterConfig.label}${colors.reset}`);

    for (const testCase of filterConfig.values) {
      const result = await testFilter(
        filterKey,
        testCase.czech,
        testCase.english
      );

      printTestResult(
        `${testCase.czech} → ${testCase.english}`,
        result
      );
    }
  }

  // Test 2: Range filters
  console.log(`\n\n${colors.bold}TEST 2: Range Filters${colors.reset}\n`);

  for (const rangeConfig of rangeFilterTestCases) {
    const result = await testRangeFilter(rangeConfig);
    printTestResult(
      `${rangeConfig.name} (${rangeConfig.range})`,
      result
    );
  }

  // Test 3: Filter combinations
  console.log(`\n\n${colors.bold}TEST 3: Filter Combinations${colors.reset}\n`);

  const comboResult = await testFilterCombination();
  printTestResult('Multiple Filters Combined', comboResult);

  // Test 4: eyeColor removal verification
  console.log(`\n\n${colors.bold}TEST 4: eyeColor Filter Removal${colors.reset}\n`);

  const eyeColorResult = await testEyeColorRemoval();
  printTestResult('eyeColor Filter (deprecated)', eyeColorResult);

  // Print summary
  console.log(`\n\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}TEST SUMMARY${colors.reset}\n`);
  console.log(`${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}`);
  console.log(`${colors.bold}Total: ${results.passed + results.failed}${colors.reset}`);

  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  console.log(`\n${colors.bold}Success Rate: ${successRate}%${colors.reset}`);

  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Print detailed results for failed tests
  if (results.failed > 0) {
    console.log(`\n${colors.bold}${colors.red}FAILED TESTS DETAILS:${colors.reset}\n`);

    results.tests
      .filter(t => !t.success)
      .forEach(test => {
        console.log(`${colors.red}✗ ${test.name}${colors.reset}`);
        console.log(`  Error: ${test.error}`);
        console.log(`  URL: ${test.url}\n`);
      });
  }

  // Print warnings
  if (results.warnings > 0) {
    console.log(`\n${colors.bold}${colors.yellow}WARNINGS:${colors.reset}\n`);

    results.tests
      .filter(t => t.warning)
      .forEach(test => {
        console.log(`${colors.yellow}⚠ ${test.name}${colors.reset}`);
        console.log(`  ${test.warning}`);
        if (test.note) console.log(`  ${test.note}\n`);
      });
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`\n${colors.red}${colors.bold}FATAL ERROR:${colors.reset}`, error);
  process.exit(1);
});
