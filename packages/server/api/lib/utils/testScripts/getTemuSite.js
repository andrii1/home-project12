const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  page.on('response', async (response) => {
    const url = response.url();

    if (url.includes('/api')) {
      console.log(url);
    }
  });

  await page.goto('https://thunt.ai/historical-rankings', {
    waitUntil: 'networkidle',
  });
})();
