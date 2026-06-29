/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
const fetchSerpApiAmazon = require('../serpApiAmazon');
const knex = require('../../../../config/db');
const generateSlug = require('../generateSlug');

require('dotenv').config();

// Credentials (from .env)
const USER_UID = process.env.USER_UID_APPS_PROD;
const API_PATH = process.env.API_PATH_APPS_PROD;

const today = new Date();
const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

const allowedDays = [0, 3, 5];

if (!allowedDays.includes(todayDay)) {
  console.log('Not an allowed day, skipping job.');
  process.exit(0);
}

// Helper: ensure the slug is unique by checking the DB
async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await slugExists(slug)) {
    const suffix = `-${counter}`;
    const maxBaseLength = 200 - suffix.length;
    slug = `${baseSlug.slice(0, maxBaseLength)}${suffix}`;
    counter += 1;
  }

  return slug;
}

// Helper: check if a slug already exists in the database
async function slugExists(slug) {
  const existing = await knex('categories').where({ slug }).first();
  return !!existing;
}

// fetch helpers

// async function insertCategory(title, categoryNodeId) {
//   const res = await fetch(`${API_PATH}/categories`, {
//     method: 'POST',
//     headers: {
//       token: `token ${USER_UID}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ title, nodeId: categoryNodeId }),
//   });
//   const data = await res.json();
//   return data; // assume it returns { id, full_name }
// }

const insertCategory = async (title, categoryNodeId = null) => {
  try {
    // Check if category already exists (case insensitive)
    const existing = await knex('categories')
      .where({ nodeId: categoryNodeId })
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        categoryId: existing.id,
        categoryTitle: existing.title,
      };
    }

    // Generate slug
    const baseSlug = generateSlug(title);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    const insertData = {
      title,
      slug: uniqueSlug,
    };

    if (categoryNodeId) {
      insertData.nodeId = categoryNodeId;
    }

    const [categoryId] = await knex('categories').insert(insertData);

    return {
      successful: true,
      existing: false,
      categoryId,
      categoryTitle: title,
    };
  } catch (error) {
    console.error('Insert category error:', error);
    throw error;
  }
};

async function insertApp({ appTitle, appleId, appUrl, categoryId }) {
  const body = {
    title: appTitle,
    category_id: categoryId,
  };

  if (appleId) {
    body.apple_id = appleId;
  }

  if (appUrl) {
    body.url = appUrl;
  }
  const res = await fetch(`${API_PATH}/apps/node`, {
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

const insertProducts = async (appsParam) => {
  // console.log(appsParam);
  let products;
  if (allowedDays.includes(todayDay)) {
    products = await fetchSerpApiAmazon();
  }
  for (const product of products) {
    try {
      const category = product.nodeId;
      const categoryAppleId = app.primaryGenreId;
      const appTitle = app.trackName;
      const appDescription = app.description;
      const appUrl = app.sellerUrl;

      const newCategory = await insertCategory(category, categoryAppleId);
      const { categoryId } = newCategory;
      console.log('Inserted category:', newCategory);

      const newApp = await insertApp({ appTitle, appleId, appUrl, categoryId });
      const { appId } = newApp;
      const newAppTitle = newApp.appTitle;
      console.log('Inserted app:', newApp);
    } catch (err) {
      console.error(`❌ Failed to insert app ${appItem.id}:`, err.message);
      // continue with next app
    }
  }
};

module.exports = insertApps;
