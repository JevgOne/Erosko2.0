const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Listen to console
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[CLIENT]') || text.includes('[AUTH]') || text.includes('SignIn') || text.includes('Auto-login')) {
      console.log('🔍 BROWSER:', text);
    }
  });

  console.log('📱 Opening http://localhost:3001/registrace');
  await page.goto('http://localhost:3001/registrace', { waitUntil: 'networkidle2', timeout: 15000 });

  const testEmail = 'pup' + Date.now() + '@test.cz';
  const testPhone = '999888777';

  console.log('📧 Test email:', testEmail);
  console.log('📞 Test phone:', testPhone);

  try {
    // Wait for form to load
    await page.waitForSelector('input[type="tel"]', { timeout: 5000 });

    console.log('✍️  Filling form...');
    await page.type('input[type="tel"]', testPhone);
    await page.type('input[type="email"]', testEmail);

    const pwdInputs = await page.$$('input[type="password"]');
    if (pwdInputs.length >= 2) {
      await pwdInputs[0].type('test1234');
      await pwdInputs[1].type('test1234');
    }

    console.log('🚀 Submitting registration...');

    // Find and click the "Pokračovat →" button
    const submitButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Pokračovat'));
    });
    await submitButton.click();

    // Wait for navigation or error
    await new Promise(resolve => setTimeout(resolve, 5000));

    const url = page.url();
    console.log('📍 Final URL:', url);

    if (url.includes('dashboard') || url.includes('inzerent_dashboard')) {
      console.log('✅ SUCCESS! Redirected to dashboard');
    } else if (url.includes('prihlaseni')) {
      console.log('❌ FAILED - Redirected to login page (auto-login did not work)');

      // Check if there's an error message
      const errorMsg = await page.$eval('body', el => el.textContent).catch(() => '');
      if (errorMsg) {
        console.log('Page content snippet:', errorMsg.substring(0, 200));
      }
    } else {
      console.log('⚠️  UNEXPECTED - Ended at:', url);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    console.log('Current URL:', page.url());
  }

  await browser.close();
})();
