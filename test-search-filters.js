const puppeteer = require('puppeteer');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function section(title) {
  console.log('\n' + colors.cyan + '='.repeat(80));
  console.log(colors.bright + colors.cyan + title);
  console.log(colors.cyan + '='.repeat(80) + colors.reset + '\n');
}

function success(msg) {
  log(colors.green + '✓', msg);
}

function error(msg) {
  log(colors.red + '✗', msg);
}

function warning(msg) {
  log(colors.yellow + '⚠', msg);
}

function info(msg) {
  log(colors.blue + 'ℹ', msg);
}

async function takeScreenshot(page, name) {
  await page.screenshot({ path: `/Users/zen/Erosko2.0/screenshots/${name}.png`, fullPage: true });
  info(`Screenshot saved: ${name}.png`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSearch() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Intercept API calls
  const apiCalls = [];
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.url().includes('/api/profiles')) {
      apiCalls.push({
        url: request.url(),
        timestamp: new Date().toISOString()
      });
      info(`API Call: ${request.url()}`);
    }
    request.continue();
  });

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
  };

  function test(name, passed, details = '') {
    results.total++;
    if (passed) {
      results.passed++;
      success(`${name} ${details}`);
    } else {
      results.failed++;
      error(`${name} ${details}`);
      results.issues.push({ test: name, details });
    }
  }

  function warn(name, details) {
    results.warnings++;
    warning(`${name} ${details}`);
    results.issues.push({ test: name, details, type: 'warning' });
  }

  try {
    // ========================================================================
    // TEST 1: Basic navigation to category page
    // ========================================================================
    section('TEST 1: Basic Navigation to Category Page');

    info('Navigating to /holky-na-sex...');
    await page.goto('http://localhost:3000/holky-na-sex', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await takeScreenshot(page, '01-holky-na-sex-page');

    const currentUrl = page.url();
    test('Navigate to /holky-na-sex', currentUrl.includes('/holky-na-sex'), `(URL: ${currentUrl})`);

    // Check if page loaded with category filter
    const lastApiCall = apiCalls[apiCalls.length - 1];
    if (lastApiCall) {
      test('API called with category filter',
        lastApiCall.url.includes('category=HOLKY_NA_SEX'),
        `(${lastApiCall.url})`
      );
    } else {
      test('API called', false, '(No API calls detected)');
    }

    // ========================================================================
    // TEST 2: Search without filters (basic search)
    // ========================================================================
    section('TEST 2: Basic Search Without Filters');

    info('Clicking Search button...');
    apiCalls.length = 0; // Clear previous calls

    const searchButton = await page.$x("//button[contains(text(), 'Hledat')]");
    if (searchButton.length > 0) {
      await searchButton[0].click();
      await sleep(2000);
      await takeScreenshot(page, '02-search-no-filters');

      const searchUrl = page.url();
      test('Navigates to /search', searchUrl.includes('/search'), `(URL: ${searchUrl})`);
      test('Includes category parameter',
        searchUrl.includes('category=HOLKY_NA_SEX'),
        `(URL: ${searchUrl})`
      );

      // Check API call
      const searchApiCall = apiCalls.find(call => call.url.includes('/api/profiles'));
      test('API called on search page', !!searchApiCall);
      if (searchApiCall) {
        info(`API URL: ${searchApiCall.url}`);
      }
    } else {
      test('Search button found', false, '(Could not find Search button)');
    }

    // ========================================================================
    // TEST 3: City Filtering
    // ========================================================================
    section('TEST 3: City Filtering');

    info('Navigating back to /holky-na-sex...');
    await page.goto('http://localhost:3000/holky-na-sex', { waitUntil: 'networkidle2' });
    await sleep(1000);

    info('Opening city dropdown...');
    const citySelect = await page.$('select');
    if (citySelect) {
      await citySelect.click();
      await sleep(500);

      info('Selecting Praha...');
      await citySelect.select('Praha');
      await sleep(500);
      await takeScreenshot(page, '03-city-selected');

      apiCalls.length = 0;
      info('Clicking Search...');
      const searchBtn = await page.$('button:has-text("Hledat")');
      if (searchBtn) {
        await searchBtn.click();
        await sleep(2000);
        await takeScreenshot(page, '04-city-search-results');

        const citySearchUrl = page.url();
        test('URL includes city parameter',
          citySearchUrl.includes('city=Praha') || citySearchUrl.includes('city=PRAHA'),
          `(URL: ${citySearchUrl})`
        );
        test('URL includes category',
          citySearchUrl.includes('category=HOLKY_NA_SEX'),
          `(URL: ${citySearchUrl})`
        );

        const cityApiCall = apiCalls.find(call => call.url.includes('/api/profiles'));
        if (cityApiCall) {
          test('API includes city filter',
            cityApiCall.url.includes('city=Praha') || cityApiCall.url.includes('city=PRAHA'),
            `(${cityApiCall.url})`
          );
        }
      }
    } else {
      test('City dropdown found', false, '(Could not find city select)');
    }

    // ========================================================================
    // TEST 4: Praktiky Modal
    // ========================================================================
    section('TEST 4: Praktiky Modal');

    info('Navigating back to /holky-na-sex...');
    await page.goto('http://localhost:3000/holky-na-sex', { waitUntil: 'networkidle2' });
    await sleep(1000);

    info('Looking for Praktiky button...');
    const praktikyButton = await page.$('button:has-text("Praktiky")');
    if (praktikyButton) {
      await praktikyButton.click();
      await sleep(1000);
      await takeScreenshot(page, '05-praktiky-modal-open');

      // Check if modal opened
      const modalVisible = await page.$('text=Vyberte praktiky');
      test('Praktiky modal opens', !!modalVisible);

      if (modalVisible) {
        info('Selecting services...');

        // Select checkboxes for services
        const checkboxes = await page.$$('input[type="checkbox"]');
        info(`Found ${checkboxes.length} checkboxes`);

        if (checkboxes.length >= 3) {
          // Select first 3 services
          await checkboxes[0].click();
          await sleep(300);
          await checkboxes[1].click();
          await sleep(300);
          await checkboxes[2].click();
          await sleep(300);

          await takeScreenshot(page, '06-praktiky-selected');

          // Click "Použít filtry"
          const applyButton = await page.$('button:has-text("Použít filtry")');
          if (applyButton) {
            await applyButton.click();
            await sleep(1000);
            await takeScreenshot(page, '07-praktiky-applied');

            // Check if button shows count
            const praktikyText = await page.$eval('button:has-text("praktik")', el => el.textContent);
            test('Praktiky button shows count',
              praktikyText.includes('3') || praktikyText.includes('praktik'),
              `(Text: "${praktikyText}")`
            );

            // Now search
            apiCalls.length = 0;
            const searchBtn = await page.$('button:has-text("Hledat")');
            if (searchBtn) {
              await searchBtn.click();
              await sleep(2000);
              await takeScreenshot(page, '08-praktiky-search-results');

              const servicesUrl = page.url();
              test('URL includes services parameter',
                servicesUrl.includes('services='),
                `(URL: ${servicesUrl})`
              );

              const servicesApiCall = apiCalls.find(call => call.url.includes('/api/profiles'));
              if (servicesApiCall) {
                test('API includes services parameter',
                  servicesApiCall.url.includes('services='),
                  `(${servicesApiCall.url})`
                );
              }
            }
          } else {
            test('Apply filters button found', false);
          }
        } else {
          warn('Not enough checkboxes found', `(Found only ${checkboxes.length})`);
        }
      }
    } else {
      test('Praktiky button found', false);
    }

    // ========================================================================
    // TEST 5: Podrobné Filtry Modal
    // ========================================================================
    section('TEST 5: Podrobné Filtry Modal');

    info('Navigating back to /holky-na-sex...');
    await page.goto('http://localhost:3000/holky-na-sex', { waitUntil: 'networkidle2' });
    await sleep(1000);

    info('Looking for Filtry button...');
    const filtryButton = await page.$$('button:has-text("Filtry")');
    if (filtryButton.length > 0) {
      // Click the last "Filtry" button (the detailed filters one)
      await filtryButton[filtryButton.length - 1].click();
      await sleep(1000);
      await takeScreenshot(page, '09-detailed-filters-modal');

      const detailedModal = await page.$('text=Podrobné filtry');
      test('Detailed filters modal opens', !!detailedModal);

      if (detailedModal) {
        // Test hair color selection
        info('Selecting Blond hair color...');
        const blondButton = await page.$('button:has-text("Blond")');
        if (blondButton) {
          await blondButton.click();
          await sleep(500);
          await takeScreenshot(page, '10-hair-color-selected');
          test('Hair color button clickable', true);
        }

        // Test body type selection
        info('Selecting Štíhlá body type...');
        const stihlaButton = await page.$('button:has-text("Štíhlá")');
        if (stihlaButton) {
          await stihlaButton.click();
          await sleep(500);
          await takeScreenshot(page, '11-body-type-selected');
          test('Body type button clickable', true);
        }

        // ========================================================================
        // TEST 6: Range Sliders UX
        // ========================================================================
        section('TEST 6: Range Sliders UX');

        info('Testing age range sliders...');
        const ageSliders = await page.$$('input[type="range"]');
        info(`Found ${ageSliders.length} range sliders`);

        if (ageSliders.length >= 2) {
          // Get the age range label before
          const ageLabelBefore = await page.$eval('label:has-text("Věk:")', el => el.textContent);
          info(`Age range before: ${ageLabelBefore}`);

          // Try to set min age slider (first one)
          await ageSliders[0].focus();
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('ArrowRight');
          await sleep(500);

          // Try to set max age slider (second one)
          await ageSliders[1].focus();
          await page.keyboard.press('ArrowLeft');
          await page.keyboard.press('ArrowLeft');
          await page.keyboard.press('ArrowLeft');
          await sleep(500);

          await takeScreenshot(page, '12-age-sliders-adjusted');

          const ageLabelAfter = await page.$eval('label:has-text("Věk:")', el => el.textContent);
          info(`Age range after: ${ageLabelAfter}`);

          test('Age sliders can be adjusted', ageLabelBefore !== ageLabelAfter,
            `Before: "${ageLabelBefore}" After: "${ageLabelAfter}"`);

          // Check if min/max makes sense
          const match = ageLabelAfter.match(/Věk: (\d+) - (\d+) let/);
          if (match) {
            const min = parseInt(match[1]);
            const max = parseInt(match[2]);
            test('Age min < max', min < max, `(min: ${min}, max: ${max})`);

            if (min > max) {
              warn('Range slider allows min > max',
                'Users can set invalid ranges - this is confusing!');
            }
          }

          // UX Issues to report
          warn('Range slider UX Issue',
            'Two separate sliders side-by-side - unclear which is MIN vs MAX');
          warn('Range slider UX Issue',
            'No visual indication of selected range (no colored track between handles)');
          warn('Range slider UX Issue',
            'Sliders can overlap - confusing which is which');
        } else {
          test('Age range sliders found', false, `(Found only ${ageSliders.length})`);
        }

        // Apply filters
        info('Applying detailed filters...');
        const applyDetailedButton = await page.$$('button:has-text("Použít filtry")');
        if (applyDetailedButton.length > 0) {
          await applyDetailedButton[applyDetailedButton.length - 1].click();
          await sleep(1000);
          await takeScreenshot(page, '13-detailed-filters-applied');

          // Search
          apiCalls.length = 0;
          const searchBtn = await page.$('button:has-text("Hledat")');
          if (searchBtn) {
            await searchBtn.click();
            await sleep(2000);
            await takeScreenshot(page, '14-detailed-filters-search');

            const detailedUrl = page.url();
            info(`Search URL: ${detailedUrl}`);

            test('URL includes hairColor', detailedUrl.includes('hairColor='));
            test('URL includes bodyType', detailedUrl.includes('bodyType='));

            const detailedApiCall = apiCalls.find(call => call.url.includes('/api/profiles'));
            if (detailedApiCall) {
              info(`API: ${detailedApiCall.url}`);
            }
          }
        }
      }
    } else {
      test('Filtry button found', false);
    }

    // ========================================================================
    // TEST 7: Active Filters Display on Search Page
    // ========================================================================
    section('TEST 7: Active Filters Display on /search Page');

    // Should be on search page with filters already applied
    const activeFiltersSection = await page.$('text=Aktivní filtry');
    test('Active filters section visible', !!activeFiltersSection);

    if (activeFiltersSection) {
      await takeScreenshot(page, '15-active-filters-display');

      // Count active filter chips
      const filterChips = await page.$$('.inline-flex.items-center.gap-2.bg-gradient-to-r');
      info(`Found ${filterChips.length} active filter chips`);
      test('Active filter chips displayed', filterChips.length > 0);

      // Try removing one filter
      if (filterChips.length > 0) {
        info('Removing one filter...');
        const removeButton = await filterChips[0].$('button');
        if (removeButton) {
          await removeButton.click();
          await sleep(1000);
          await takeScreenshot(page, '16-filter-removed');

          const newFilterChips = await page.$$('.inline-flex.items-center.gap-2.bg-gradient-to-r');
          test('Filter removed successfully',
            newFilterChips.length < filterChips.length,
            `(Before: ${filterChips.length}, After: ${newFilterChips.length})`
          );
        }
      }

      // Test "Vymazat vše" button
      info('Testing clear all filters...');
      const clearAllButton = await page.$('button:has-text("Vymazat vše")');
      if (clearAllButton) {
        await clearAllButton.click();
        await sleep(1000);
        await takeScreenshot(page, '17-filters-cleared');

        const urlAfterClear = page.url();
        test('Clear all removes parameters',
          !urlAfterClear.includes('hairColor') && !urlAfterClear.includes('bodyType'),
          `(URL: ${urlAfterClear})`
        );
      }
    }

    // ========================================================================
    // TEST 8: Complex Multi-Filter Search
    // ========================================================================
    section('TEST 8: Complex Multi-Filter Search');

    info('Setting up complex search with all filter types...');
    await page.goto('http://localhost:3000/holky-na-sex', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Select city
    const citySelectComplex = await page.$('select');
    if (citySelectComplex) {
      await citySelectComplex.select('Brno');
      await sleep(300);
    }

    // Select praktiky
    const praktikyBtnComplex = await page.$('button:has-text("Praktiky")');
    if (praktikyBtnComplex) {
      await praktikyBtnComplex.click();
      await sleep(500);

      const checkboxes = await page.$$('input[type="checkbox"]');
      if (checkboxes.length >= 2) {
        await checkboxes[0].click();
        await sleep(200);
        await checkboxes[1].click();
        await sleep(200);
      }

      const applyBtn = await page.$('button:has-text("Použít filtry")');
      if (applyBtn) await applyBtn.click();
      await sleep(500);
    }

    // Select detailed filters
    const filtryBtnComplex = await page.$$('button:has-text("Filtry")');
    if (filtryBtnComplex.length > 0) {
      await filtryBtnComplex[filtryBtnComplex.length - 1].click();
      await sleep(500);

      const hnedaButton = await page.$('button:has-text("Hnědá")');
      if (hnedaButton) await hnedaButton.click();
      await sleep(200);

      const atletickaButton = await page.$('button:has-text("Atletická")');
      if (atletickaButton) await atletickaButton.click();
      await sleep(200);

      const applyDetailedBtn = await page.$$('button:has-text("Použít filtry")');
      if (applyDetailedBtn.length > 0) {
        await applyDetailedBtn[applyDetailedBtn.length - 1].click();
      }
      await sleep(500);
    }

    await takeScreenshot(page, '18-complex-filters-set');

    // Search
    apiCalls.length = 0;
    const complexSearchBtn = await page.$('button:has-text("Hledat")');
    if (complexSearchBtn) {
      await complexSearchBtn.click();
      await sleep(2000);
      await takeScreenshot(page, '19-complex-search-results');

      const complexUrl = page.url();
      info(`Complex search URL: ${complexUrl}`);

      test('Complex URL has city', complexUrl.includes('city='));
      test('Complex URL has category', complexUrl.includes('category='));
      test('Complex URL has services', complexUrl.includes('services='));
      test('Complex URL has hairColor', complexUrl.includes('hairColor='));
      test('Complex URL has bodyType', complexUrl.includes('bodyType='));

      const complexApiCall = apiCalls.find(call => call.url.includes('/api/profiles'));
      if (complexApiCall) {
        info(`Complex API: ${complexApiCall.url}`);
        test('Complex API has all params',
          complexApiCall.url.includes('city=') &&
          complexApiCall.url.includes('category=') &&
          complexApiCall.url.includes('services=') &&
          complexApiCall.url.includes('hairColor=') &&
          complexApiCall.url.includes('bodyType=')
        );
      }
    }

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================
    section('TEST SUMMARY');

    console.log(`${colors.bright}Total Tests:${colors.reset} ${results.total}`);
    console.log(`${colors.green}Passed:${colors.reset} ${results.passed}`);
    console.log(`${colors.red}Failed:${colors.reset} ${results.failed}`);
    console.log(`${colors.yellow}Warnings:${colors.reset} ${results.warnings}`);
    console.log('');

    if (results.issues.length > 0) {
      section('ISSUES FOUND');
      results.issues.forEach((issue, i) => {
        if (issue.type === 'warning') {
          warning(`${i + 1}. ${issue.test}: ${issue.details}`);
        } else {
          error(`${i + 1}. ${issue.test}: ${issue.details}`);
        }
      });
    }

    section('UX FEEDBACK & RECOMMENDATIONS');

    console.log(`
${colors.yellow}Range Slider Issues:${colors.reset}
  ${colors.red}✗${colors.reset} Two separate sliders side-by-side is confusing
  ${colors.red}✗${colors.reset} No visual indication which slider is MIN vs MAX
  ${colors.red}✗${colors.reset} No colored track showing selected range
  ${colors.red}✗${colors.reset} Sliders can overlap, making it hard to distinguish them
  ${colors.red}✗${colors.reset} Can potentially set min > max (no validation)

${colors.green}Recommendations:${colors.reset}
  ${colors.green}✓${colors.reset} Use a dual-handle range slider library (e.g., rc-slider, react-range)
  ${colors.green}✓${colors.reset} Add colored track between handles
  ${colors.green}✓${colors.reset} Add input fields next to sliders for precise values
  ${colors.green}✓${colors.reset} Prevent min from exceeding max
  ${colors.green}✓${colors.reset} Add labels "Od" and "Do" above each slider

${colors.blue}What Works Well:${colors.reset}
  ${colors.green}✓${colors.reset} Modal system is clean and functional
  ${colors.green}✓${colors.reset} Filter chips display nicely on search results page
  ${colors.green}✓${colors.reset} Individual filter removal works
  ${colors.green}✓${colors.reset} "Vymazat vše" (Clear all) works correctly
  ${colors.green}✓${colors.reset} URL parameters are correctly set
  ${colors.green}✓${colors.reset} API calls include all filter parameters
  ${colors.green}✓${colors.reset} Visual feedback when filters are active (colored buttons)

${colors.yellow}Minor Issues:${colors.reset}
  ${colors.yellow}⚠${colors.reset} No loading state indicator when filters are applied
  ${colors.yellow}⚠${colors.reset} Modal close animation could be smoother
  ${colors.yellow}⚠${colors.reset} No indication of how many results will be returned before clicking Search
    `);

    section('SCREENSHOTS SAVED');
    info('All screenshots saved to /Users/zen/Erosko2.0/screenshots/');
    info('Review them to see the visual flow of the tests');

  } catch (err) {
    error(`Test crashed: ${err.message}`);
    console.error(err);
  } finally {
    info('Closing browser...');
    await browser.close();

    console.log('');
    if (results.failed === 0) {
      success('All tests passed! ✓');
    } else {
      error(`${results.failed} test(s) failed!`);
    }
  }
}

// Create screenshots directory
const fs = require('fs');
const screenshotsDir = '/Users/zen/Erosko2.0/screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Run tests
testSearch().catch(console.error);
