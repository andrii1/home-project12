/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
require('dotenv').config();

const products = require('./aliexpressProducts.json');
const insertProducts = require('./insertProducts'); // your DB insert function

const today = new Date();
const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

const allowedDays = [0, 2, 3, 4, 5, 6];

if (!allowedDays.includes(todayDay)) {
  console.log('Not an allowed day, skipping job.');
  process.exit(0);
}

// const products = await fetchProducts('2026-07-27');

// console.log(products.slice(0, 5));

async function fetchAndInsertAllProducts() {
  console.log(products.slice(0, 5));
  // Insert into DB
  await insertProducts(products);
}

// Run the script
fetchAndInsertAllProducts();
