/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const parseNumber = require('../parseNumber.js');
const productsDeals = require('./data/getYourGuideProducts.js');
const products2 = require('./data/gygBestsellers.js');
const products3 = require('./data/gygNew.js');
const products4 = require('./data/gygTopPerforming.js');

const products = [...products2, ...products3, ...products4];

// Credentials (from .env)
const USER_UID = process.env.USER_UID_ACTIVITIES_PROD;
const API_PATH = process.env.API_PATH_ACTIVITIES_PROD;

// const products = [
//   {
//     'Tour ID': '913346',
//     'Tour Title': 'Atlanta: Ponce City Market Guided Walking Tour',
//     Category: 'Walking Tours',
//     City: 'Atlanta',
//     'Area/State': 'Fulton County',
//     Country: 'United States',
//     'AVG Rating': '5.0',
//     Reviews: '1',
//     'Activity URL':
//       'https://www.getyourguide.com/activity/-t913346?partner_id=FEYUTMR',
//     'Save up to': '15%',
//     From: '2026-03-05',
//     To: '2026-03-31',
//     'Price from': '€21.96',
//   },
//   {
//     'Tour ID': '561933',
//     'Tour Title': 'Osaka: Kuchu Teien Observatory Ticket with Private Transfer',
//     Category: 'Transfers',
//     City: 'Osaka',
//     'Area/State': 'Osaka Prefecture',
//     Country: 'Japan',
//     'AVG Rating': null,
//     Reviews: null,
//     'Activity URL':
//       'https://www.getyourguide.com/activity/-t561933?partner_id=FEYUTMR',
//     'Save up to': '5%',
//     From: '2026-03-05',
//     To: '2026-03-22',
//     'Price from': '€55.37',
//   },
//   {
//     'Tour ID': '1133955',
//     'Tour Title': 'Shanghai Pub Crawl (Guided Bar Hopping) with Shots Included',
//     Category: 'Walking Tours',
//     City: 'Shanghai',
//     'Area/State': 'East China',
//     Country: 'China',
//     'AVG Rating': '5.0',
//     Reviews: '56',
//     'Activity URL':
//       'https://www.getyourguide.com/activity/-t1133955?partner_id=FEYUTMR',
//     'Save up to': '5%',
//     From: '2026-03-05',
//     To: '2026-04-04',
//     'Price from': '€21.44',
//   },
// ];

// fetch helpers

const today = new Date();
const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

const allowedDays = [0, 1, 2, 3, 4, 5, 6];

if (!allowedDays.includes(todayDay)) {
  console.log('Not an allowed day, skipping job.');
  process.exit(0);
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

async function insertProduct({
  title,
  external_id,
  rating,
  price,
  reviews,
  url,
  url_affiliate,
  discount_percentage,
  categoryId,
  cityId,
  platformId,
}) {
  const body = {
    title,
    external_id,
    rating,
    price,
    reviews,
    url,
    url_affiliate,
    discount_percentage,
    category_id: categoryId,
    city_id: cityId,
    platform_id: platformId,
  };

  const res = await fetch(`${API_PATH}/products/node`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

const insertProducts = async () => {
  // console.log(appsParam);

  // let products;
  // if (allowedDays.includes(todayDay)) {
  //   products = await fetchSerpApiAmazon();
  // }

  for (const product of products) {
    try {
      const platform = 'GetYourGuide';
      const platformUrl = 'https://www.getyourguide.com/';

      const category = product['Category Name'];
      const country = product.Country?.trim();
      const area = product['Area/State']?.trim() || null;
      const city = product.City?.trim();
      const cleanUrl = product['Activity URL'].split('?')[0];
      const discount = product['Save up to']
        ? Number(product['Save up to'].replace(/\D/g, ''))
        : null;
      const price = product['Price from']
        ? Number(product['Price from'].replace(/[^0-9.]/g, ''))
        : null;
      const reviews = parseNumber(product.Reviews);

      const newPlatform = await insertPlatform(platform, platformUrl);
      const { platformId } = newPlatform;
      console.log('Inserted platform:', newPlatform);

      const newCategory = await insertCategory(category);
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
        title: product['Tour Title'],
        external_id: product['Tour ID'],
        rating: product['AVG Rating'],
        price,
        reviews,
        url: cleanUrl,
        url_affiliate: product['Activity URL'],
        discount_percentage: discount,
        categoryId,
        cityId,
        platformId,
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

insertProducts().catch(console.log);
