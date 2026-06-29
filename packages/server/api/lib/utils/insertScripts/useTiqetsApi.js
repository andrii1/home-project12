/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
require('dotenv').config();

const apiKey = process.env.TIQETS_API_KEY; // Replace with your API key

let currentKeyIndex = 0;

const excludeList = [
  'insurance',
  'cars',
  'mortgage',
  'loan',
  'renters',
  'vehicle',
  'mutual',
  'cheap',
  'auto',
  'state',
];

const amazonCategories = [
  // { title: 'Appliances', nodeId: '2619526011' },
  // { title: 'Arts, Crafts & Sewing', nodeId: '2617942011' },
  // { title: 'Automotive', nodeId: '15690151' },
  // { title: 'Baby', nodeId: '165797011' },
  // { title: 'Beauty', nodeId: '11055981' },
  // { title: 'Books', nodeId: '1000' },
  // { title: 'Collectibles & Fine Arts', nodeId: '4991426011' },
  // { title: 'Electronics', nodeId: '493964' },
  // { title: 'Clothing, Shoes & Jewelry', nodeId: '7141124011' },
  // { title: 'Gift Cards', nodeId: '2864120011' },
  // { title: 'Grocery & Gourmet Food', nodeId: '16310211' },
  // { title: 'Handmade', nodeId: '11260433011' },
  // { title: 'Health & Personal Care', nodeId: '3760931' },
  // { title: 'Home & Kitchen', nodeId: '1063498' },
  // { title: 'Industrial & Scientific', nodeId: '16310161' },
  // { title: 'Kindle Store', nodeId: '133141011' },
  // { title: 'Patio, Lawn & Garden', nodeId: '3238155011' },
  // { title: 'Luggage & Travel Gear', nodeId: '9479199011' },
  // { title: 'Magazine Subscriptions', nodeId: '599872' },
  // { title: 'Apps & Games', nodeId: '2350150011' },
  // { title: 'Movies & TV', nodeId: '2625374011' },
  // { title: 'Digital Music', nodeId: '624868011' },
  // { title: 'CDs & Vinyl', nodeId: '301668' },
  // { title: 'Musical Instruments', nodeId: '11965861' },
  // { title: 'Office Products', nodeId: '1084128' },
  // { title: 'Computers', nodeId: '541966' },
  // { title: 'Pet Supplies', nodeId: '2619534011' },
  // { title: 'Software', nodeId: '409488' },
  // { title: 'Sports & Outdoors', nodeId: '3375301' },
  // { title: 'Tools & Home Improvement', nodeId: '468240' },
  // { title: 'Toys & Games', nodeId: '165795011' },
  // { title: 'Vehicles', nodeId: '10677470011' },
  // { title: 'Video Games', nodeId: '11846801' },
  // { title: 'Wine', nodeId: '2983386011' },
  { title: 'Cell Phones & Accessories', nodeId: '2335753011' },
];

function extractAmazonRawProducts(data) {
  const keywords = ['best_sellers', 'featured', 'deals', 'organic_results'];

  const collected = [];

  for (const [key, value] of Object.entries(data)) {
    if (!Array.isArray(value)) continue;

    const matchesKeyword = keywords.some((keyword) =>
      key.toLowerCase().includes(keyword),
    );

    if (matchesKeyword) {
      collected.push(...value);
    }
  }

  return collected;
}

function extractAmazonProducts(data) {
  if (data.error) {
    console.log('SerpAPI error:', data.error);
    return [];
  }

  if (data.search_information?.organic_results_state === 'Fully empty') {
    console.log('Amazon returned empty results');
    return [];
  }

  const rawProducts = extractAmazonRawProducts(data);

  return rawProducts.map((item) => ({
    asin: item.asin,
    title: item.title,
    price: item.extracted_price || item.price || null,
    rating: item.rating || null,
    reviews: item.reviews || null,
    url: item.link_clean,
    url_affiliate: `${item.link_clean}?tag=onlinehikes-20`,
    url_serpapi: item.serpapi_link,
    url_image: item.thumbnail,
  }));
}

async function fetchSerpApiAmazon(
  categoryId,
  categoryTitle,
  domain = 'amazon.com',
) {
  const apiKey = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

  const params = new URLSearchParams({
    engine: 'amazon',
    amazon_domain: domain,
    type: 'best_sellers',
    node: categoryId,
    api_key: apiKey,
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await response.json();
    console.log('data', data);

    const products = extractAmazonProducts(data).map((product) => ({
      ...product,
      categoryNodeId: categoryId,
      categoryTitle: categoryTitle,
    }));

    console.log('products1', products);
    return products;
  } catch (error) {
    console.error('Error fetching Amazon best sellers:', error);
    return [];
  }
}

const useAmazon = async () => {
  const allProducts = [];

  for (const category of amazonCategories) {
    const products = await fetchSerpApiAmazon(category.nodeId, category.title);
    allProducts.push(...products);
  }
  console.log('allProducts', allProducts);

  return allProducts;
};

async function getProducts() {
  try {
    const response = await fetch(
      'https://api.tiqets.com/v2/experiences?page=725',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'my user agent',
          Authorization: `Token ${apiKey}`,
        },
      },
    );

    const data = await response.json();
    console.log('data', data);

    const products = data.experiences;
    // console.log(products);

    return products;
  } catch (error) {
    console.error(error);
  }
}

getProducts().catch(console.error);
module.exports = getProducts;
