const { chromium } = require('playwright');

async function debugPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://www.getyourguide.com/activity/-t847818', {
    waitUntil: 'networkidle',
  });

  const html = await page.content();

  console.log(html.slice(0, 2000)); // print first part of HTML

  await browser.close();
}

debugPage();
