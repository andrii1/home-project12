/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

// Credentials (from .env)
const USER_UID = process.env.USER_UID_CATCH_TOP_DEALS_PROD;
const API_PATH = process.env.API_PATH_CATCH_TOP_DEALS_PROD;

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

async function createCategoryWithChatGpt(categories, product) {
  // Generate a short description using OpenAI
  const prompt = `
Select the best category for this product.

Product: ${product}

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
  for (const product of products) {
    try {
      const platform = 'CJ';
      const platformUrl = 'http://www.cj.com/';

      const newPlatform = await insertPlatform(platform, platformUrl);
      const { platformId } = newPlatform;
      console.log('Inserted platform:', newPlatform);

      const existingCategories = await fetchCategories();
      const createdCategory = await createCategoryWithChatGpt(
        existingCategories,
        product['Product Desc'],
      );

      const newCategory = await insertCategory(createdCategory);
      const { categoryId } = newCategory;
      console.log('Inserted category:', newCategory);

      const price = Number(product['Discount Price'].split(' ')[1]);

      const discount = Number(product.Discount.replace('%', ''));

      const newProduct = await insertProduct({
        title: product['Product Desc'],
        external_id: product.ProductId,
        price,
        currency: product.Currency,
        discount_percentage: discount,
        url_affiliate: product['Promotion Url'],
        category_id: categoryId,
        platform_id: platformId,
        url_image: product['Image Url'],
        image_alt_text: product['Product Desc'],
        url_video: product['Video Url'],
      });
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
