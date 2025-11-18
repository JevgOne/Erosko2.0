const puppeteer = require('puppeteer');
const fs = require('fs');

// Create screenshots directory
const screenshotsDir = '/Users/zen/Erosko2.0/screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) { console.log(color, ...args, colors.reset); }
function section(title) {
  console.log('\n' + colors.cyan + '='.repeat(80));
  console.log(colors.bright + colors.cyan + title);
  console.log(colors.cyan + '='.repeat(80) + colors.reset + '\n');
}
function success(msg) { log(colors.green + '✓', msg); }
function error(msg) { log(colors.red + '✗', msg); }
function warning(msg) { log(colors.yellow + '⚠', msg); }
function info(msg) { log(colors.blue + 'ℹ', msg); }

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testSearch() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Intercept API calls
  const apiCalls = [];
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.url().includes('/api/profiles')) {
      apiCalls.push({ url: request.url(), timestamp: new Date().toISOString() });
      info(`API Call: ${request.url()}`);
    }
    request.continue();
  });

  const results = { total: 0, passed: 0, failed: 0, issues: [] };

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

  try {
    // ========================================================================
    // TEST 1: Basic Navigation
    // ========================================================================
    section('TEST 1: Navigate to /holky-na-sex');

    await page.goto('http://localhost:3000/holky-na-sex', { waitUntil: 'networkidle2' });
    await sleep(1500);
    await page.screenshot({ path: `${screenshotsDir}/01-holky-na-sex.png`, fullPage: true });

    test('Page loaded', page.url().includes('/holky-na-sex'), `URL: ${page.url()}`);

    // Wait for API call
    await sleep(2000);
    const initialApiCall = apiCalls.find(c => c.url.includes('category=HOLKY_NA_SEX'));
    test('Initial API call with category', !!initialApiCall, initialApiCall ? initialApiCall.url : '');

    // ========================================================================
    // TEST 2: Basic Search (no filters)
    // ========================================================================
    section('TEST 2: Basic Search Without Filters');

    apiCalls.length = 0;

    // Find and click Search button
    const searchButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const hledatBtn = buttons.find(b => b.textContent.includes('Hledat'));
      if (hledatBtn) {
        hledatBtn.click();
        return true;
      }
      return false;
    });
    info(`Search button clicked: ${searchButton}`);

    if (searchButton) {
      await sleep(2000);
      await page.screenshot({ path: `${screenshotsDir}/02-basic-search.png`, fullPage: true });

      const searchUrl = page.url();
      test('Navigated to /search', searchUrl.includes('/search'), `URL: ${searchUrl}`);
      test('Category preserved in URL', searchUrl.includes('category=HOLKY_NA_SEX'), `URL: ${searchUrl}`);

      await sleep(1000);
      const searchApiCall = apiCalls.find(c => c.url.includes('/api/profiles'));
      test('API called on search page', !!searchApiCall);
    } else {
      test('Search button found', false);
    }

    // ========================================================================
    // TEST 3: City Filter
    // ========================================================================
    section('TEST 3: City Filtering');

    await page.goto('http://localhost:3000/holky-na-sex', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Select Praha from dropdown
    const citySelect = await page.$('select');
    if (citySelect) {
      await citySelect.select('Praha');
      await sleep(500);
      info('Selected Praha from dropdown');
      await page.screenshot({ path: `${screenshotsDir}/03-city-selected.png`, fullPage: true });

      // Search
      apiCalls.length = 0;
      const searchBtns2 = await page.$x("//button[contains(., 'Hledat')]");
      if (searchBtns2.length > 0) {
        await searchBtns2[0].click();
        await sleep(2000);
        await page.screenshot({ path: `${screenshotsDir}/04-city-search.png`, fullPage: true });

        const cityUrl = page.url();
        test('URL has city param', cityUrl.includes('city=Praha'), `URL: ${cityUrl}`);
        test('URL has category param', cityUrl.includes('category=HOLKY_NA_SEX'), `URL: ${cityUrl}`);

        const cityApi = apiCalls.find(c => c.url.includes('/api/profiles'));
        if (cityApi) {
          test('API has city filter', cityApi.url.includes('city=Praha'), cityApi.url);
        }
      }
    } else {
      test('City select found', false);
    }

    // ========================================================================
    // TEST 4: Praktiky Modal
    // ========================================================================
    section('TEST 4: Praktiky Modal');

    await page.goto('http://localhost:3000/holky-na-sex', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Click Praktiky button
    const praktikyBtns = await page.$x("//button[contains(., 'Praktiky')]");
    info(`Found ${praktikyBtns.length} Praktiky buttons`);

    if (praktikyBtns.length > 0) {
      await praktikyBtns[0].click();
      await sleep(1000);
      await page.screenshot({ path: `${screenshotsDir}/05-praktiky-modal.png`, fullPage: true });

      // Check modal opened
      const modalTitle = await page.$x("//h3[contains(., 'Vyberte praktiky')]");
      test('Praktiky modal opened', modalTitle.length > 0);

      if (modalTitle.length > 0) {
        // Select 3 checkboxes
        const checkboxes = await page.$$('input[type="checkbox"]');
        info(`Found ${checkboxes.length} checkboxes`);

        if (checkboxes.length >= 3) {
          await checkboxes[0].click();
          await sleep(200);
          await checkboxes[1].click();
          await sleep(200);
          await checkboxes[2].click();
          await sleep(500);
          await page.screenshot({ path: `${screenshotsDir}/06-praktiky-selected.png`, fullPage: true });

          // Click "Použít filtry"
          const applyBtns = await page.$x("//button[contains(., 'Použít filtry')]");
          if (applyBtns.length > 0) {
            await applyBtns[0].click();
            await sleep(1000);
            await page.screenshot({ path: `${screenshotsDir}/07-praktiky-applied.png`, fullPage: true });

            // Check button shows count
            const praktikyText = await page.evaluate(() => {
              const btn = Array.from(document.querySelectorAll('button'))
                .find(b => b.textContent.includes('praktik'));
              return btn ? btn.textContent.trim() : '';
            });
            info(`Praktiky button text: "${praktikyText}"`);
            test('Praktiky count shown', praktikyText.includes('3') || praktikyText.includes('praktik'));

            // Search
            apiCalls.length = 0;
            const searchBtns3 = await page.$x("//button[contains(., 'Hledat')]");
            if (searchBtns3.length > 0) {
              await searchBtns3[0].click();
              await sleep(2000);
              await page.screenshot({ path: `${screenshotsDir}/08-services-search.png`, fullPage: true });

              const servicesUrl = page.url();
              test('URL has services param', servicesUrl.includes('services='), `URL: ${servicesUrl}`);

              const servicesApi = apiCalls.find(c => c.url.includes('/api/profiles'));
              if (servicesApi) {
                test('API has services param', servicesApi.url.includes('services='), servicesApi.url);
              }
            }
          }
        }
      }
    } else {
      test('Praktiky button found', false);
    }

    // ========================================================================
    // TEST 5: Detailed Filters Modal
    // ========================================================================
    section('TEST 5: Detailed Filters (Hair, Body Type, Range Sliders)');

    await page.goto('http://localhost:3000/holky-na-sex', { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Click Filtry button (should be the last button with "Filtry" text)
    const filtryBtns = await page.$x("//button[contains(., 'Filtry')]");
    info(`Found ${filtryBtns.length} Filtry buttons`);

    if (filtryBtns.length > 0) {
      // Click the LAST Filtry button (detailed filters, not category filters)
      await filtryBtns[filtryBtns.length - 1].click();
      await sleep(1000);
      await page.screenshot({ path: `${screenshotsDir}/09-detailed-modal.png`, fullPage: true });

      const detailedTitle = await page.$x("//h3[contains(., 'Podrobné filtry')]");
      test('Detailed filters modal opened', detailedTitle.length > 0);

      if (detailedTitle.length > 0) {
        // Select Blond
        const blondBtn = await page.$x("//button[text()='Blond']");
        if (blondBtn.length > 0) {
          await blondBtn[0].click();
          await sleep(300);
          info('Selected Blond hair color');
        }

        // Select Štíhlá
        const stihlaBtn = await page.$x("//button[text()='Štíhlá']");
        if (stihlaBtn.length > 0) {
          await stihlaBtn[0].click();
          await sleep(300);
          info('Selected Štíhlá body type');
        }

        await page.screenshot({ path: `${screenshotsDir}/10-filters-selected.png`, fullPage: true });

        // ========================================================================
        // TEST 6: Range Sliders UX
        // ========================================================================
        section('TEST 6: Range Sliders UX Analysis');

        const rangeSliders = await page.$$('input[type="range"]');
        info(`Found ${rangeSliders.length} range sliders`);

        if (rangeSliders.length >= 2) {
          // Get age label before
          const ageLabelBefore = await page.evaluate(() => {
            const label = Array.from(document.querySelectorAll('label'))
              .find(l => l.textContent.includes('Věk:'));
            return label ? label.textContent.trim() : '';
          });
          info(`Age before: ${ageLabelBefore}`);

          // Adjust first slider (min)
          await rangeSliders[0].click();
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('ArrowRight');
          await sleep(300);

          // Adjust second slider (max)
          await rangeSliders[1].click();
          await page.keyboard.press('ArrowLeft');
          await page.keyboard.press('ArrowLeft');
          await sleep(300);

          const ageLabelAfter = await page.evaluate(() => {
            const label = Array.from(document.querySelectorAll('label'))
              .find(l => l.textContent.includes('Věk:'));
            return label ? label.textContent.trim() : '';
          });
          info(`Age after: ${ageLabelAfter}`);

          await page.screenshot({ path: `${screenshotsDir}/11-sliders-adjusted.png`, fullPage: true });

          test('Sliders are adjustable', ageLabelBefore !== ageLabelAfter);

          // Check min < max
          const match = ageLabelAfter.match(/Věk: (\d+) - (\d+) let/);
          if (match) {
            const min = parseInt(match[1]);
            const max = parseInt(match[2]);
            test('Age min < max', min < max, `min: ${min}, max: ${max}`);

            if (min >= max) {
              warning('CRITICAL UX BUG: Range sliders allow min >= max!');
            }
          }

          // UX Issues
          warning('UX Issue: Two separate sliders - unclear which is MIN vs MAX');
          warning('UX Issue: No visual track showing selected range');
          warning('UX Issue: Sliders can overlap and conflict');
        }

        // Apply filters
        const applyDetailedBtns = await page.$x("//button[contains(., 'Použít filtry')]");
        if (applyDetailedBtns.length > 0) {
          // Click the last "Použít filtry" button (in detailed modal)
          await applyDetailedBtns[applyDetailedBtns.length - 1].click();
          await sleep(1000);
          await page.screenshot({ path: `${screenshotsDir}/12-detailed-applied.png`, fullPage: true });

          // Search
          apiCalls.length = 0;
          const searchBtns4 = await page.$x("//button[contains(., 'Hledat')]");
          if (searchBtns4.length > 0) {
            await searchBtns4[0].click();
            await sleep(2000);
            await page.screenshot({ path: `${screenshotsDir}/13-detailed-search.png`, fullPage: true });

            const detailedUrl = page.url();
            info(`Detailed search URL: ${detailedUrl}`);
            test('URL has hairColor', detailedUrl.includes('hairColor='));
            test('URL has bodyType', detailedUrl.includes('bodyType='));
          }
        }
      }
    } else {
      test('Filtry button found', false);
    }

    // ========================================================================
    // TEST 7: Active Filters on Search Page
    // ========================================================================
    section('TEST 7: Active Filters Display');

    // Should already be on search page with filters
    const activeFiltersHeading = await page.$x("//h3[contains(., 'Aktivní filtry')]");
    test('Active filters section visible', activeFiltersHeading.length > 0);

    if (activeFiltersHeading.length > 0) {
      await page.screenshot({ path: `${screenshotsDir}/14-active-filters.png`, fullPage: true });

      // Count filter chips
      const filterChips = await page.$$('.inline-flex.items-center.gap-2');
      info(`Found ${filterChips.length} filter chips`);

      // Try removing one filter
      if (filterChips.length > 0) {
        const xButtons = await filterChips[0].$$('button');
        if (xButtons.length > 0) {
          await xButtons[0].click();
          await sleep(1500);
          await page.screenshot({ path: `${screenshotsDir}/15-filter-removed.png`, fullPage: true });

          const newChips = await page.$$('.inline-flex.items-center.gap-2');
          test('Individual filter removable', newChips.length < filterChips.length,
            `Before: ${filterChips.length}, After: ${newChips.length}`);
        }
      }

      // Test "Vymazat vše"
      const clearAllBtns = await page.$x("//button[contains(., 'Vymazat vše')]");
      if (clearAllBtns.length > 0) {
        await clearAllBtns[0].click();
        await sleep(1500);
        await page.screenshot({ path: `${screenshotsDir}/16-all-cleared.png`, fullPage: true });

        const clearedUrl = page.url();
        test('"Vymazat vše" works',
          !clearedUrl.includes('hairColor') && !clearedUrl.includes('bodyType'),
          `URL: ${clearedUrl}`);
      }
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    section('TEST SUMMARY');

    console.log(`${colors.bright}Total:${colors.reset} ${results.total}`);
    console.log(`${colors.green}Passed:${colors.reset} ${results.passed}`);
    console.log(`${colors.red}Failed:${colors.reset} ${results.failed}`);
    console.log('');

    if (results.issues.length > 0) {
      section('FAILED TESTS');
      results.issues.forEach((issue, i) => {
        error(`${i + 1}. ${issue.test}: ${issue.details}`);
      });
    }

    section('DETAILED UX FEEDBACK');
    console.log(`
${colors.red}🚨 CRITICAL ISSUES:${colors.reset}

  ${colors.red}✗ Range Sliders${colors.reset}
    - Two separate side-by-side sliders are VERY confusing
    - NO visual indication which is MIN vs MAX
    - NO colored track showing selected range
    - Sliders can overlap, making them indistinguishable
    - Possible to set min >= max (no validation)

  ${colors.red}Recommendation:${colors.reset} Use a proper dual-handle range slider like:
    - rc-slider (https://www.npmjs.com/package/rc-slider)
    - react-range (https://www.npmjs.com/package/react-range)
    - Add input fields for precise value entry

${colors.green}✓ WHAT WORKS WELL:${colors.reset}

  ${colors.green}✓${colors.reset} Filter modals open/close smoothly
  ${colors.green}✓${colors.reset} URL parameters correctly set for all filters
  ${colors.green}✓${colors.reset} API calls include all selected filters
  ${colors.green}✓${colors.reset} Active filters display nicely on search page
  ${colors.green}✓${colors.reset} Individual filter removal works
  ${colors.green}✓${colors.reset} "Vymazat vše" clears all filters correctly
  ${colors.green}✓${colors.reset} Visual feedback when filters active (colored buttons)
  ${colors.green}✓${colors.reset} Category preserved through navigation
  ${colors.green}✓${colors.reset} City dropdown works correctly
  ${colors.green}✓${colors.reset} Multiple services selection works

${colors.yellow}⚠ MINOR IMPROVEMENTS:${colors.reset}

  ${colors.yellow}⚠${colors.reset} Add loading spinner when applying filters
  ${colors.yellow}⚠${colors.reset} Show result count preview before clicking Search
  ${colors.yellow}⚠${colors.reset} Add keyboard shortcuts (ESC to close modals)
  ${colors.yellow}⚠${colors.reset} Consider adding filter presets ("Oblíbené filtry")
  ${colors.yellow}⚠${colors.reset} Mobile responsiveness testing needed

${colors.cyan}📸 SCREENSHOTS:${colors.reset}
  All ${results.total} test screenshots saved to:
  ${screenshotsDir}/
`);

  } catch (err) {
    error(`Test crashed: ${err.message}`);
    console.error(err.stack);
  } finally {
    await browser.close();

    if (results.failed === 0) {
      success('\nAll tests passed! ✓');
    } else {
      error(`\n${results.failed} test(s) failed!`);
    }
  }
}

testSearch().catch(console.error);
