/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
require('dotenv').config();

const insertProducts = require('./insertProducts'); // your DB insert function

const today = new Date();
const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

const allowedDays = [0, 4, 5, 6];

if (!allowedDays.includes(todayDay)) {
  console.log('Not an allowed day, skipping job.');
  process.exit(0);
}

async function fetchProducts(date) {
  const url = `https://thunt.ai/api/rank/rank_list?rank_type=0&date=${date}`;

  try {
    const res = await fetch(url);

    const data = await res.json();

    return (data.data?.list || []).map((product) => ({
      id: product.product_id,
      title: product.product_name,
      image: product.logo_url,
      price: product.price_us || product.price_all,
      rating: product.rating,
      reviews: product.review_num,
      category: product.category_backend?.[0]?.cate_name_en || null,
      rank: product.rank_index,
      url: `https://www.temu.com/goods.html?goods_id=${product.product_id}`,
    }));
  } catch (err) {
    console.error(`Error fetching rankings:`, err);
    return [];
  }
}

// const products = await fetchProducts('2026-07-08');

// console.log(products.slice(0, 5));

async function fetchAndInsertAllProducts() {
  const date = new Date();
  date.setDate(date.getDate() - 2);

  const dateString = date.toISOString().split('T')[0];
  console.log(dateString);

  const products = await fetchProducts(dateString);

  // Insert into DB
  await insertProducts(products);
}

// Run the script
fetchAndInsertAllProducts();
