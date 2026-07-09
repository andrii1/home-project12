const { chromium } = require('playwright');

async function scrapeTemuXHR(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    locale: 'en-US',
  });

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  });

  const products = [];

  // 🎯 Intercept API responses
  page.on('response', async (response) => {
    try {
      const url = response.url();

      // Temu product APIs usually contain keywords like:
      if (
        url.includes('api') ||
        url.includes('goods') ||
        url.includes('product') ||
        url.includes('search') ||
        url.includes('recommend')
      ) {
        const json = await response.json().catch(() => null);

        if (!json) return;

        extractProducts(json, products);
      }
    } catch (e) {}
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  // scroll to trigger more XHR calls
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1200);
  }

  await browser.close();

  // remove duplicates
  const unique = Array.from(new Map(products.map((p) => [p.url, p])).values());

  return unique;
}

function extractProducts(obj, products) {
  if (!obj || typeof obj !== 'object') return;

  if (obj.goods_id || obj.product_id || obj.id) {
    console.log(JSON.stringify(obj, null, 2));
  }

  // 🔍 recursive search through JSON
  for (const key in obj) {
    const val = obj[key];

    if (Array.isArray(val)) {
      val.forEach((item) => extractProducts(item, products));
    } else if (val && typeof val === 'object') {
      extractProducts(val, products);
    }
  }

  // 🎯 common Temu fields (varies by endpoint)
  if (obj.goods_id || obj.product_id || obj.id) {
    const id = obj.goods_id || obj.product_id || obj.id;

    const title = obj.title || obj.goods_name || obj.name;

    const image = obj.image || obj.goods_image || obj.pic_url || obj.thumbnail;

    const price = obj.price || obj.sale_price || obj.min_price;

    if (title && image) {
      products.push({
        id,
        title: String(title).slice(0, 120),
        image,
        price,
        url: id
          ? `https://www.temu.com/goods.html?_bg_fs=1&goods_id=${id}`
          : null,
      });
    }
  }
}

// 🚀 run
scrapeTemuXHR('https://www.temu.com/us-en/channel/best-sellers.html')
  .then((data) => {
    console.log('Products:', data.length);
    console.log(data.slice(0, 10));
  })
  .catch(console.error);
