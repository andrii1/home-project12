/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
require('dotenv').config();

const insertProducts = require('./insertProductsTiqets'); // your DB insert function

const apiKey = process.env.TIQETS_API_KEY;
const pageSize = 10;
const totalPages = 1230; // optional: set a high number, we will stop when API returns empty
const throttleMs = 100; // ~10 requests/sec to stay under 15/sec

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(page) {
  const url = `https://api.tiqets.com/v2/products?page=${page}&page_size=${pageSize}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'my user agent',
        Authorization: `Token ${apiKey}`,
      },
    });

    if (res.status === 429) {
      console.log(`Rate limit hit on page ${page}, waiting 1 second...`);
      await sleep(1000);
      return fetchPage(page); // retry
    }

    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error(`Error fetching page ${page}:`, err);
    return [];
  }
}

async function fetchAndInsertAllProducts() {
  let page = 1;

  while (true) {
    const products = await fetchPage(page);
    if (!products.length) {
      console.log('No more products to fetch, stopping.');
      break;
    }

    // Insert into DB
    await insertProducts(products);
    console.log(`Inserted page ${page} (${products.length} products)`);

    page++;
    await sleep(throttleMs); // throttle to avoid exceeding 15 req/sec
  }

  console.log('All products processed.');
}

// Run the script
fetchAndInsertAllProducts();
