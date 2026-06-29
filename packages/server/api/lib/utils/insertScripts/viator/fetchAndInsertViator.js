/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
require('dotenv').config();

const knex = require('../../../../../config/db'); // your knex instance
const insertProducts = require('./insertProductsViator');

const apiKey = process.env.VIATOR_API_KEY;

const PAGE_SIZE = 10;
const throttleMs = 150; // safer than 100 for Viator
const MAX_PAGES_PER_CITY = 1;

const MAX_CITIES = 1700;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ✅ Get cities with viator_id
async function getCitiesToFetch(limit = 1) {
  return knex('cities')
    .whereNotNull('viator_id')
    .where(function () {
      this.whereNull('viator_last_fetched');
    })
    .orderBy('id', 'asc') // deterministic order by city id
    .limit(limit);
}

// ✅ Fetch products for a city
async function fetchProducts(destinationId, start) {
  try {
    const res = await fetch('https://api.viator.com/partner/products/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json;version=2.0',
        'exp-api-key': apiKey,
        'Accept-Language': 'en',
      },
      body: JSON.stringify({
        filtering: {
          destination: destinationId,
        },

        sorting: {
          sort: 'DEFAULT',
        },
        pagination: {
          start,
          count: PAGE_SIZE,
        },
        currency: 'USD',
      }),
    });

    if (res.status === 429) {
      console.log(
        `Rate limit hit for destination ${destinationId}, retrying...`,
      );
      await sleep(1000);
      return fetchProducts(destinationId, start);
    }

    const data = await res.json();
    console.log('data', data);

    return data.products || [];
  } catch (err) {
    console.error(`Error fetching destination ${destinationId}:`, err);
    return [];
  }
}

// ✅ Main logic
async function fetchAndInsertViatorProducts() {
  try {
    const cities = await getCitiesToFetch(MAX_CITIES);

    console.log(`Processing ${cities.length} cities...`);

    for (const city of cities) {
      const destinationId = city.viator_id;
      let start = 0;
      let pageCount = 0;

      console.log(`\n➡️ City: ${city.title} (${destinationId})`);

      while (pageCount < MAX_PAGES_PER_CITY) {
        const products = await fetchProducts(destinationId, start);

        if (!products.length) {
          console.log(`No more products for ${city.title}`);
          break;
        }

        await insertProducts(products, destinationId); // pass city if needed
        console.log(
          `Inserted ${products.length} products (start=${start}) for ${city.title}`,
        );

        start += PAGE_SIZE;
        pageCount++;

        await sleep(throttleMs);
      }
      await knex('cities')
        .where('id', city.id)
        .update({ viator_last_fetched: knex.fn.now() });
      console.log(`\n✅ City '${city.title}' processed and updated in db.`);
    }

    console.log('\n✅ All cities processed.');
  } catch (err) {
    console.error('❌ Script failed:', err);
  } finally {
    await knex.destroy();
    console.log('Knex connection closed.');
  }
}

// Run
fetchAndInsertViatorProducts();
