/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const parseNumber = require('../../parseNumber.js');
// const productsDeals = require('./data/getYourGuideProducts.js');
// const products2 = require('./data/gygBestsellers.js');
// const products3 = require('./data/gygNew.js');
// const products4 = require('./data/gygTopPerforming.js');

// const products = [...products2, ...products3, ...products4];
// const useTiqetsApi = require('./useTiqetsApi.js');

// Credentials (from .env)
const USER_UID = process.env.USER_UID_ACTIVITIES_PROD;
const API_PATH = process.env.API_PATH_ACTIVITIES_PROD;

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

// fetch helpers

// const today = new Date();
// const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

// const allowedDays = [0, 1, 2, 3, 4, 5, 6];

// if (!allowedDays.includes(todayDay)) {
//   console.log('Not an allowed day, skipping job.');
//   process.exit(0);
// }

async function createCategoryWithChatGpt(categories, product, description) {
  // Generate a short description using OpenAI
  const prompt = `
Select the best category for this product.

Product: ${product}
Description: ${description}

Return ONLY ONE category from this list:
${categories.join(', ')}

Return ONLY the category name. Nothing else.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 100,
  });

  const category = completion.choices[0].message.content.trim();
  return category;
}

function minutesToTime(minutes) {
  if (minutes == null) return null;

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const secs = 0; // API only gives minutes

  // Pad with zeros
  const hh = String(hrs).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

async function fetchCategories() {
  const res = await fetch(`${API_PATH}/categories`);
  const data = await res.json();
  const categories = data.map((category) => category.title);
  return categories;
}

async function insertPlatform(title, url) {
  const res = await fetch(`${API_PATH}/platforms`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, url }),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

async function insertCategory(title) {
  const res = await fetch(`${API_PATH}/categories`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

async function insertCountry(title) {
  const res = await fetch(`${API_PATH}/countries`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

async function insertArea(title, countryId) {
  const res = await fetch(`${API_PATH}/areas`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, country_id: countryId }),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

// async function insertCity(title, areaId, countryId) {
//   const res = await fetch(`${API_PATH}/cities`, {
//     method: 'POST',
//     headers: {
//       token: `token ${USER_UID}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ title, area_id: areaId, country_id: countryId }),
//   });
//   const data = await res.json();
//   return data; // assume it returns { id, full_name }
// }

async function insertCity(cityViatorId) {
  const res = await fetch(`${API_PATH}/cities`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ viator_id: cityViatorId }),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

async function insertProduct(product) {
  const res = await fetch(`${API_PATH}/products/node`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  const data = await res.json();
  return data;
}

const insertProducts = async (products, cityViatorId) => {
  // products = await useTiqetsApi();

  // console.log(appsParam);

  // let products;
  // if (allowedDays.includes(todayDay)) {
  //   products = await fetchSerpApiAmazon();
  // }

  for (const product of products) {
    try {
      const platform = 'Viator';
      const platformUrl = 'http://viator.com/';

      const cleanUrl = product.productUrl.split('?')[0];
      const discount =
        ((product.pricing?.summary?.fromPriceBeforeDiscount -
          product.pricing?.summary?.fromPrice) /
          product.pricing?.summary?.fromPriceBeforeDiscount) *
        100;

      const minutes = product.duration?.fixedDurationInMinutes;
      const duration = minutesToTime(minutes);

      const image = product.images?.[0];
      const variant400 = image?.variants?.find((v) => v.height === 400);
      const urlImage400 = variant400?.url;

      const hasFreeCancellation = product.flags.includes('FREE_CANCELLATION');
      const isPrivateTour = product.flags.includes('PRIVATE_TOUR');
      const likelyToSellOut = product.flags.includes('LIKELY_TO_SELL_OUT');
      const isInstant = product.confirmationType === 'INSTANT';

      const newPlatform = await insertPlatform(platform, platformUrl);
      const { platformId } = newPlatform;
      console.log('Inserted platform:', newPlatform);

      const existingCategories = await fetchCategories();
      const createdCategory = await createCategoryWithChatGpt(
        existingCategories,
        product.title,
        product.description,
      );

      const newCategory = await insertCategory(createdCategory);
      const { categoryId } = newCategory;
      console.log('Inserted category:', newCategory);

      const newCity = await insertCity(cityViatorId);
      const { cityId } = newCity;
      console.log('Inserted city:', newCity);

      const productData = {
        title: product.title,
        external_id: product.productCode,
        price: product.pricing?.summary?.fromPrice,
        currency: product.pricing?.currency,
        rating: product.reviews?.combinedAverageRating,
        reviews: product.reviews?.totalReviews,
        description: product.description,
        url: cleanUrl,
        url_affiliate: product.productUrl,
        discount_percentage: discount,
        category_id: categoryId,
        city_id: cityId,
        platform_id: platformId,
        duration,
        url_image: urlImage400,
        image_alt_text: product.images?.[0]?.caption,
        free_cancellation: hasFreeCancellation,
        likely_to_sell_out: likelyToSellOut,
        instant_confirmation: isInstant,
        private_tour: isPrivateTour,
      };

      console.log('Product being inserted:', productData);

      const newProduct = await insertProduct(productData);
      const { productId } = newProduct;
      const newProductTitle = newProduct.productTitle;
      console.log('Inserted product:', newProduct);
    } catch (err) {
      console.error(`❌ Failed to insert product ${product.id}:`, err.message);
      // continue with next app
    }
  }
};

// insertProducts().catch(console.log);
module.exports = insertProducts;
