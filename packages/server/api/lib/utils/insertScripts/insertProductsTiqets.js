/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const parseNumber = require('../parseNumber.js');
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

async function createCategoryWithChatGpt(
  categories,
  product,
  description,
  summary,
) {
  // Generate a short description using OpenAI
  const prompt = `
Select the best category for this product.

Product: ${product}
Description: ${description}
Summary: ${summary}

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

async function insertCity(title, areaId, countryId) {
  const res = await fetch(`${API_PATH}/cities`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, area_id: areaId, country_id: countryId }),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

// async function insertProduct({
//   title,
//   external_id,
//   rating,
//   price,
//   reviews,
//   url,
//   url_affiliate,
//   discount_percentage,
//   categoryId,
//   cityId,
//   platformId,
// }) {
//   const body = {
//     title,
//     external_id,
//     rating,
//     price,
//     reviews,
//     url,
//     url_affiliate,
//     discount_percentage,
//     category_id: categoryId,
//     city_id: cityId,
//     platform_id: platformId,
//   };

//   const res = await fetch(`${API_PATH}/products/node`, {
//     method: 'POST',
//     headers: {
//       token: `token ${USER_UID}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(body),
//   });
//   const data = await res.json();
//   return data; // assume it returns { id, full_name }
// }

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

const insertProducts = async (products) => {
  // products = await useTiqetsApi();

  // console.log(appsParam);

  // let products;
  // if (allowedDays.includes(todayDay)) {
  //   products = await fetchSerpApiAmazon();
  // }

  for (const product of products) {
    try {
      const platform = 'Tiqets';
      const platformUrl = 'http://tiqets.com/';

      const country = product.country_name;
      let area;
      // const area = product['Area/State']?.trim() || null;
      const city = product.city_name;
      const cleanUrl = product.product_url.split('?')[0];

      const rating = product.ratings?.average || null;
      const reviews = product.ratings?.total || 0;

      const newPlatform = await insertPlatform(platform, platformUrl);
      const { platformId } = newPlatform;
      console.log('Inserted platform:', newPlatform);

      const existingCategories = await fetchCategories();
      const createdCategory = await createCategoryWithChatGpt(
        existingCategories,
        product.title,
        product.summary,
        product.description,
      );

      const newCategory = await insertCategory(createdCategory);
      const { categoryId } = newCategory;
      console.log('Inserted category:', newCategory);

      const newCountry = await insertCountry(country);
      const { countryId } = newCountry;
      console.log('Inserted country:', newCountry);

      let areaId = null;

      if (area) {
        const newArea = await insertArea(area, countryId);
        areaId = newArea.areaId;
        console.log('Inserted area:', newArea);
      }

      const newCity = await insertCity(city, areaId, countryId);
      const { cityId } = newCity;
      console.log('Inserted city:', newCity);

      const newProduct = await insertProduct({
        title: product.title,
        external_id: product.id,
        price: product.price,
        currency: product.currency,
        rating,
        reviews,
        summary: product.summary,
        description: product.description,
        url: cleanUrl,
        url_affiliate: product.product_url,
        discount_percentage: product.discount_percentage,
        category_id: categoryId,
        city_id: cityId,
        platform_id: platformId,
        address: product.address,
        postal_code: product.postal_code,
        whats_included: product.whats_included,
        whats_excluded: product.whats_excluded,
        duration: product.duration,
        wheelchair_access: product.wheelchair_access,
        smartphone_ticket: product.smartphone_ticket,
        geolocation_lat: product.geolocation?.lat,
        geolocation_lng: product.geolocation?.lng,
        image_alt_text: product.image_alt_text,
        image_credit: product.image_credit,
        bestseller: product.promo_label === 'bestseller',
        url_image: product.images?.[0]?.large,
        image_alt_text: product.images?.[0]?.alt_text,
        image_credit: product.images?.[0]?.credit,
        address: product.venue?.address,
        postal_code: product.venue?.postal_code,
      });
      const { productId } = newProduct;
      const newProductTitle = newProduct.productTitle;
      console.log('Inserted product:', newProduct);
    } catch (err) {
      console.error(
        `❌ Failed to insert product ${product['Tour ID']}:`,
        err.message,
      );
      // continue with next app
    }
  }
};

// insertProducts().catch(console.log);
module.exports = insertProducts;
