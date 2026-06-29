/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

// Credentials (from .env)
const USER_UID = process.env.USER_UID_ACTIVITIES_LOCAL;
const API_PATH = process.env.API_PATH_ACTIVITIES_LOCAL;

const products = [
  {
    'Tour ID': '847818',
    'Tour Title':
      'Melbourne: Penguin Parade Tour with Puffing Billy Train Ride',
    Category: 'Day Trips',
    City: 'Melbourne',
    'Area/State': 'Victoria',
    Country: 'Australia',
    'AVG Rating': '4.2',
    Reviews: '34',
    'Activity URL':
      'https://www.getyourguide.com/activity/-t847818?partner_id=FEYUTMR',
    'Save up to': '11%',
    From: '2026-03-06',
    To: '2026-03-08',
    'Price from': '€101.53',
  },
  {
    'Tour ID': '1116428',
    'Tour Title':
      'From Marrakech: Private 4-Day Tour To Merzouga & Luxury Camp',
    Category: 'Multi-day Trips',
    City: 'Fes',
    'Area/State': 'Fès-Meknès',
    Country: 'Morocco, Kingdom of',
    'AVG Rating': '5.0',
    Reviews: '1',
    'Activity URL':
      'https://www.getyourguide.com/activity/-t1116428?partner_id=FEYUTMR',
    'Save up to': '18%',
    From: '2026-03-06',
    To: '2026-04-05',
    'Price from': '€395.47',
  },
  {
    'Tour ID': '527490',
    'Tour Title': 'Holbox: Yum Balam Reserve Classic Boat Tour',
    Category: 'Adventure Tours',
    City: 'Holbox',
    'Area/State': 'Isla Holbox',
    Country: 'Mexico',
    'AVG Rating': '4.7',
    Reviews: '475',
    'Activity URL':
      'https://www.getyourguide.com/activity/-t527490?partner_id=FEYUTMR',
    'Save up to': '5%',
    From: '2026-03-06',
    To: '2026-03-13',
    'Price from': '€32.31',
  },
  {
    'Tour ID': '619710',
    'Tour Title':
      'Lisbon: Pena Palace, Qta Regaleira, Moorish Castle & Cascais',
    Category: 'Bus Tours',
    City: 'Sintra',
    'Area/State': 'Lisbon District',
    Country: 'Portugal',
    'AVG Rating': '5.0',
    Reviews: '17',
    'Activity URL':
      'https://www.getyourguide.com/activity/-t619710?partner_id=FEYUTMR',
    'Save up to': '10%',
    From: '2026-03-06',
    To: '2026-03-31',
    'Price from': '€112.50',
  },
  {
    'Tour ID': '444875',
    'Tour Title':
      'Benagil: Guided Kayak Tour inside caves and Praia da Marinha',
    Category: 'Adventure Tours',
    City: 'Benagil',
    'Area/State': 'Algarve',
    Country: 'Portugal',
    'AVG Rating': '4.9',
    Reviews: '1,517',
    'Activity URL':
      'https://www.getyourguide.com/activity/-t444875?partner_id=FEYUTMR',
    'Save up to': '5%',
    From: '2026-03-06',
    To: '2026-04-05',
    'Price from': '€31.35',
  },
  {
    'Tour ID': '478887',
    'Tour Title': 'From Delhi : Same Day Jaipur City Guided Tour By Car',
    Category: 'Day Trips',
    City: 'Jaipur',
    'Area/State': 'Rajasthan',
    Country: 'India',
    'AVG Rating': '5.0',
    Reviews: '2',
    'Activity URL':
      'https://www.getyourguide.com/activity/-t478887?partner_id=FEYUTMR',
    'Save up to': '50%',
    From: '2026-03-06',
    To: '2026-04-05',
    'Price from': '€18.77',
  },
  {
    'Tour ID': '42635',
    'Tour Title': 'From Rome: Pompeii and Herculaneum by High-Speed Train',
    Category: 'Day Trips',
    City: 'Rome',
    'Area/State': 'Lazio',
    Country: 'Italy',
    'AVG Rating': '4.8',
    Reviews: '331',
    'Activity URL':
      'https://www.getyourguide.com/activity/-t42635?partner_id=FEYUTMR',
    'Save up to': '28%',
    From: '2026-03-06',
    To: '2026-03-31',
    'Price from': '€205.00',
  },
  {
    'Tour ID': '519733',
    'Tour Title':
      'Marrakesh: Ourika Waterfalls, Atlas Mountains, Guide & Lunch',
    Category: 'Day Trips',
    City: 'Marrakesh',
    'Area/State': 'Marrakesh-Safi',
    Country: 'Morocco, Kingdom of',
    'AVG Rating': '4.0',
    Reviews: '24',
    'Activity URL':
      'https://www.getyourguide.com/activity/-t519733?partner_id=FEYUTMR',
    'Save up to': '20%',
    From: '2026-03-06',
    To: '2026-04-05',
    'Price from': '€2.97',
  },
  {
    'Tour ID': '554418',
    'Tour Title':
      'Walking Florence: Medici District, Piazza Repubblica & Duomo',
    Category: 'Walking Tours',
    City: 'Florence',
    'Area/State': 'Tuscany',
    Country: 'Italy',
    'AVG Rating': null,
    Reviews: null,
    'Activity URL':
      'https://www.getyourguide.com/activity/-t554418?partner_id=FEYUTMR',
    'Save up to': '10%',
    From: '2026-03-06',
    To: '2026-04-05',
    'Price from': '€83.70',
  },
  {
    'Tour ID': '1152460',
    'Tour Title': 'Reykjavik: Northern Lights Comfort Coach with Surprise',
    Category: 'Day Trips',
    City: 'Reykjavik',
    'Area/State': 'Capital Region of Iceland',
    Country: 'Iceland',
    'AVG Rating': '4.5',
    Reviews: '305',
    'Activity URL':
      'https://www.getyourguide.com/activity/-t1152460?partner_id=FEYUTMR',
    'Save up to': '10%',
    From: '2026-03-06',
    To: '2026-04-15',
    'Price from': '€61.20',
  },
];

// fetch helpers

const today = new Date();
const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

const allowedDays = [0, 1, 2, 3, 4, 5, 6];

if (!allowedDays.includes(todayDay)) {
  console.log('Not an allowed day, skipping job.');
  process.exit(0);
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

async function insertCity(title, areaId) {
  const res = await fetch(`${API_PATH}/cities`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, area_id: areaId }),
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
      const category = product.Category;
      const country = product.Country;
      const area = product['Area/State'];
      const city = product.City;
      const platformId = 1;
      const cleanUrl = product['Activity URL'].split('?')[0];
      const discount = Number(product['Save up to'].replace(/\D/g, ''));
      const price = Number(product['Price from'].replace(/[^0-9.]/g, ''));

      const newCategory = await insertCategory(category);
      const { categoryId } = newCategory;
      console.log('Inserted category:', newCategory);

      const newCountry = await insertCountry(country);
      const { countryId } = newCountry;
      console.log('Inserted country:', newCountry);

      const newArea = await insertArea(area, countryId);
      const { areaId } = newArea;
      console.log('Inserted area:', newArea);

      const newCity = await insertCity(city, areaId);
      const { cityId } = newCity;
      console.log('Inserted city:', newCity);

      const newProduct = await insertProduct({
        title: product['Tour Title'],
        external_id: product['Tour ID'],
        rating: product['AVG Rating'],
        price,
        reviews: product.Reviews,
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
