const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    slowMo: 100, // Slow down actions
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    console.log('🔍 BROWSER CONSOLE:', text);
  });

  // Enable request logging
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/register') || url.includes('/api/auth')) {
      console.log(`📡 ${response.status()} ${response.statusText()} - ${url}`);
    }
  });

  console.log('📱 Opening http://localhost:3001/registrace');
  await page.goto('http://localhost:3001/registrace', { waitUntil: 'networkidle2', timeout: 15000 });

  const testEmail = 'pup' + Date.now() + '@test.cz';
  const testPhone = '999888777';

  console.log('📧 Test email:', testEmail);
  console.log('📞 Test phone:', testPhone);

  try {
    // First, handle age verification modal if it appears
    try {
      console.log('🔍 Checking for age verification modal...');
      const ageButton = await page.waitForSelector('button', { timeout: 2000 });
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const ageBtn = buttons.find(btn => btn.textContent.includes('Jsem dospělý'));
        if (ageBtn) {
          console.log('[CLIENT] Clicking age verification button...');
          ageBtn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        console.log('✅ Age verification confirmed');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (e) {
      console.log('ℹ️  No age verification modal (or already verified)');
    }

    // Wait for form to load
    await page.waitForSelector('input[type="tel"]', { timeout: 5000 });
    console.log('✅ Form loaded');

    // Fill the form
    console.log('✍️  Filling phone...');
    await page.type('input[type="tel"]', testPhone, { delay: 50 });

    console.log('✍️  Filling email...');
    await page.type('input[type="email"]', testEmail, { delay: 50 });

    console.log('✍️  Filling passwords...');
    const pwdInputs = await page.$$('input[type="password"]');
    if (pwdInputs.length >= 2) {
      await pwdInputs[0].type('test1234', { delay: 50 });
      await pwdInputs[1].type('test1234', { delay: 50 });
    }

    console.log('🔍 Looking for submit button...');

    // Try multiple ways to find and click the button
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitBtn = buttons.find(btn => btn.textContent.includes('Pokračovat'));
      if (submitBtn) {
        console.log('[CLIENT] Found button, clicking...');
        submitBtn.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      console.log('❌ Could not find submit button');
      await browser.close();
      return;
    }

    console.log('🚀 Button clicked, waiting for response...');

    // Wait for navigation or API response
    await new Promise(resolve => setTimeout(resolve, 8000));

    const finalUrl = page.url();
    console.log('📍 Final URL:', finalUrl);

    if (finalUrl.includes('dashboard') || finalUrl.includes('inzerent_dashboard')) {
      console.log('✅ SUCCESS! Redirected to dashboard');
    } else if (finalUrl.includes('prihlaseni')) {
      console.log('❌ FAILED - Redirected to login page (auto-login did not work)');
    } else if (finalUrl === 'http://localhost:3001/registrace') {
      console.log('⚠️  Still on registration page - form may have validation errors');

      // Check for error messages
      const errorText = await page.evaluate(() => {
        const errorEl = document.querySelector('[class*="error"]') || document.querySelector('[class*="text-red"]');
        return errorEl ? errorEl.textContent : null;
      });

      if (errorText) {
        console.log('❌ Error message:', errorText);
      }
    } else {
      console.log('⚠️  UNEXPECTED - Ended at:', finalUrl);
    }

    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open for 30 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (err) {
    console.log('❌ Error:', err.message);
    console.log('Current URL:', page.url());
  }

  await browser.close();
})();
