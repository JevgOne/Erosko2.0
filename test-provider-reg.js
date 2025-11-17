const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100
  });

  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log('❌ BROWSER ERROR:', text);
    } else if (text.includes('[CLIENT]') || text.includes('[TEST]')) {
      console.log(`🔍`, text);
    }
  });

  // Enable page error logging
  page.on('pageerror', error => {
    console.log('❌ PAGE ERROR:', error.message);
  });

  console.log('📱 Opening registration page...');
  await page.goto('http://localhost:3001/registrace', { waitUntil: 'networkidle2' });

  const testEmail = 'provider' + Date.now() + '@test.cz';
  const testPhone = '777666555';

  console.log('📧 Test email:', testEmail);
  console.log('📞 Test phone:', testPhone);

  // Handle age verification
  await page.evaluate(() => {
    const ageBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Jsem dospělý'));
    if (ageBtn) {
      ageBtn.click();
      console.log('[TEST] Age verification clicked');
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  console.log('✍️  Step 1: Filling basic info...');

  // Fill basic info
  await page.type('input[type="tel"]', testPhone);
  await page.type('input[type="email"]', testEmail);

  const pwds = await page.$$('input[type="password"]');
  await pwds[0].type('test1234');
  await pwds[1].type('test1234');

  console.log('🏢 Selecting "Podnik" (Business) option...');

  // Click "Podnik" button to set role to PROVIDER
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const podnikBtn = buttons.find(b => b.textContent.includes('Podnik'));
    if (podnikBtn) {
      console.log('[TEST] Clicking Podnik button');
      podnikBtn.click();
    } else {
      console.log('[TEST] ERROR: Podnik button not found!');
    }
  });

  await new Promise(r => setTimeout(r, 500));

  console.log('🚀 Clicking "Pokračovat" to go to step 2...');

  // Click "Pokračovat" - should go to step 2 since role is PROVIDER
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const continueBtn = buttons.find(b => b.textContent.includes('Pokračovat'));
    if (continueBtn) {
      console.log('[TEST] Clicking Pokračovat button');
      continueBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 2000));

  console.log('✍️  Step 2: Filling business details...');

  // Fill business details
  try {
    // Business name
    const nameInput = await page.$('input[id="name"]');
    if (nameInput) {
      await nameInput.type('Test Salon');
      console.log('✅ Business name filled');
    }

    // City
    const cityInput = await page.$('input[id="city"]');
    if (cityInput) {
      await cityInput.type('Praha');
      console.log('✅ City filled');
    }

    // Address (optional, but let's fill it)
    const addressInput = await page.$('input[id="address"]');
    if (addressInput) {
      await addressInput.type('Testovací 123');
      console.log('✅ Address filled');
    }

    await new Promise(r => setTimeout(r, 500));

    console.log('🚀 Submitting registration...');

    // Find and click the final submit button - or submit the form directly
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        console.log('[TEST] Found form, submitting directly');
        // Trigger submit event which should call handleSubmit
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      } else {
        console.log('[TEST] ERROR: Form not found!');
      }
    });

    await new Promise(r => setTimeout(r, 8000));

    const finalUrl = page.url();
    console.log('📍 Final URL:', finalUrl);

    if (finalUrl.includes('dashboard') || finalUrl.includes('inzerent_dashboard')) {
      console.log('✅ SUCCESS! Redirected to provider dashboard');
    } else if (finalUrl === 'http://localhost:3001/') {
      console.log('✅ SUCCESS! Redirected to homepage');
    } else if (finalUrl.includes('prihlaseni')) {
      console.log('⚠️  Redirected to login - auto-login may have failed');
    } else {
      console.log('❌ Still on registration page or unexpected URL');
    }

  } catch (err) {
    console.log('❌ Error in step 2:', err.message);
  }

  console.log('\n⏸️  Browser will stay open for 20 seconds...');
  await new Promise(r => setTimeout(r, 20000));

  await browser.close();
})();
