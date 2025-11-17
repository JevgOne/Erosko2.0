const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50
  });

  const page = await browser.newPage();

  // Enable console logging - INCLUDING ERRORS
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log('❌ BROWSER ERROR:', text);
    } else {
      console.log(`🔍 [${type}]`, text);
    }
  });

  // Enable page error logging
  page.on('pageerror', error => {
    console.log('❌ PAGE ERROR:', error.message);
  });

  console.log('📱 Opening registration page...');
  await page.goto('http://localhost:3001/registrace', { waitUntil: 'networkidle2' });

  const testEmail = 'simple' + Date.now() + '@test.cz';
  const testPhone = '777' + Date.now().toString().slice(-6); // Dynamic phone number

  console.log('📧 Test email:', testEmail);
  console.log('📞 Test phone:', testPhone);

  // Handle age verification
  await page.evaluate(() => {
    const ageBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Jsem dospělý'));
    if (ageBtn) ageBtn.click();
  });

  await new Promise(r => setTimeout(r, 1000));

  // Fill form
  await page.type('input[type="tel"]', testPhone);
  await page.type('input[type="email"]', testEmail);

  const pwds = await page.$$('input[type="password"]');
  await pwds[0].type('test1234');
  await pwds[1].type('test1234');

  // Click terms checkbox
  await page.evaluate(() => {
    const checkbox = document.querySelector('input[type="checkbox"]#agreedToTerms');
    if (checkbox) {
      console.log('[TEST] Clicking terms checkbox');
      checkbox.click();
    }
  });

  await new Promise(r => setTimeout(r, 500));

  console.log('🚀 Clicking submit button and monitoring console...');

  // Click and wait
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pokračovat'));
    if (btn) {
      console.log('[TEST] Button found, triggering click...');
      btn.click();
    } else {
      console.log('[TEST] ERROR: Button not found!');
    }
  });

  // Wait and observe
  await new Promise(r => setTimeout(r, 10000));

  const finalUrl = page.url();
  console.log('📍 Final URL:', finalUrl);

  if (finalUrl.includes('dashboard') || finalUrl === 'http://localhost:3001/') {
    console.log('✅ SUCCESS!');
  } else {
    console.log('❌ Still on registration page');
  }

  await new Promise(r => setTimeout(r, 20000)); // Keep open for inspection
  await browser.close();
})();
