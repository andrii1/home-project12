/* eslint-disable no-console */
require('dotenv').config();
const knex = require('../../../../config/db');
const generateSlug = require('../generateSlug');

const categories = [
  { title: 'Appliances', nodeId: '2619526011' },
  { title: 'Arts, Crafts & Sewing', nodeId: '2617942011' },
  { title: 'Automotive', nodeId: '15690151' },
  { title: 'Baby', nodeId: '165797011' },
  { title: 'Beauty', nodeId: '11055981' },
  { title: 'Books', nodeId: '1000' },
  { title: 'Collectibles & Fine Arts', nodeId: '4991426011' },
  { title: 'Electronics', nodeId: '493964' },
  { title: 'Clothing, Shoes & Jewelry', nodeId: '7141124011' },
  { title: 'Gift Cards', nodeId: '2864120011' },
  { title: 'Grocery & Gourmet Food', nodeId: '16310211' },
  { title: 'Handmade', nodeId: '11260433011' },
  { title: 'Health & Personal Care', nodeId: '3760931' },
  { title: 'Home & Kitchen', nodeId: '1063498' },
  { title: 'Industrial & Scientific', nodeId: '16310161' },
  { title: 'Kindle Store', nodeId: '133141011' },
  { title: 'Patio, Lawn & Garden', nodeId: '3238155011' },
  { title: 'Luggage & Travel Gear', nodeId: '9479199011' },
  { title: 'Magazine Subscriptions', nodeId: '599872' },
  { title: 'Apps & Games', nodeId: '2350150011' },
  { title: 'Movies & TV', nodeId: '2625374011' },
  { title: 'Digital Music', nodeId: '624868011' },
  { title: 'CDs & Vinyl', nodeId: '301668' },
  { title: 'Musical Instruments', nodeId: '11965861' },
  { title: 'Office Products', nodeId: '1084128' },
  { title: 'Computers', nodeId: '541966' },
  { title: 'Pet Supplies', nodeId: '2619534011' },
  { title: 'Software', nodeId: '409488' },
  { title: 'Sports & Outdoors', nodeId: '3375301' },
  { title: 'Tools & Home Improvement', nodeId: '468240' },
  { title: 'Toys & Games', nodeId: '165795011' },
  { title: 'Vehicles', nodeId: '10677470011' },
  { title: 'Video Games', nodeId: '11846801' },
  { title: 'Wine', nodeId: '2983386011' },
  { title: 'Cell Phones & Accessories', nodeId: '2335753011' },
];

// Helper: ensure the slug is unique by checking the DB
async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await slugExists(slug)) {
    const suffix = `-${counter}`;
    const maxBaseLength = 200 - suffix.length; // adjust max length if needed
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

// Insert categories with slugs
async function insertCategories() {
  try {
    console.log('Inserting Amazon US categories with slugs...');

    for (const category of categories) {
      const baseSlug = generateSlug(category.title);
      const uniqueSlug = await ensureUniqueSlug(baseSlug);

      await knex('categories')
        .insert({
          title: category.title,
          nodeId: category.nodeId,
          slug: uniqueSlug,
        })
        .onConflict('nodeId') // prevent duplicates by nodeId
        .ignore();
    }

    console.log('Done ✅');
  } catch (error) {
    console.error('Error inserting categories:', error);
  } finally {
    await knex.destroy();
  }
}

insertCategories();
