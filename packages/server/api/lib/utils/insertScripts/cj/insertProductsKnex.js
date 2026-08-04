/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

require('dotenv').config();

const knex = require('../../../../../config/db');

const OpenAI = require('openai');

const generateSlug = require('../../generateSlug');
const ensureUniqueSlugItems = require('../../ensureUniqueSlugItems');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createCategoryWithChatGpt(productTitle) {
  const categories = await knex('categories').select('title');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `
Choose best category.

Product:
${productTitle}

Available categories:
${categories.map((c) => c.title).join(', ')}

Return only category name.
`,
      },
    ],
    temperature: 0,
  });

  return completion.choices[0].message.content.trim();
}

async function getOrCreatePlatform(title, url) {
  const slug = generateSlug(title);

  const existing = await knex('platforms').where({ slug }).first();

  if (existing) {
    return existing.id;
  }

  const [id] = await knex('platforms').insert({
    title,
    slug,
    url,
  });

  console.log(`Created platform ${title}`);

  return id;
}

async function getOrCreateBrand(title) {
  if (!title) return null;

  const slug = generateSlug(title);

  const existing = await knex('brands').where({ slug }).first();

  if (existing) {
    return existing.id;
  }

  const [id] = await knex('brands').insert({
    title,
    slug,
  });

  return id;
}

async function getOrCreateMerchant(title, externalId, platformId) {
  const existing = await knex('merchants')
    .where({
      external_id: externalId,
      platform_id: platformId,
    })
    .first();

  if (existing) {
    return existing.id;
  }

  const slug = await ensureUniqueSlugItems(generateSlug(title), 'merchants');

  const [id] = await knex('merchants').insert({
    title,
    slug,
    external_id: externalId,
    platform_id: platformId,
  });

  return id;
}

async function getOrCreateCategory(title) {
  const slug = generateSlug(title);

  const existing = await knex('categories').where({ slug }).first();

  if (existing) {
    return existing.id;
  }

  const [id] = await knex('categories').insert({
    title,
    slug,
  });

  return id;
}

async function createGPTDescription(title, url) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',

    messages: [
      {
        role: 'user',
        content: `Write a short engaging description for product "${title}".
Do not include links.
${url || ''}`,
      },
    ],

    temperature: 0.7,
  });

  return completion.choices[0].message.content.trim();
}

async function createGPTMeta(title) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',

    messages: [
      {
        role: 'user',
        content: `Write SEO meta description maximum 150 characters for product "${title}".`,
      },
    ],

    temperature: 0.7,
  });

  return completion.choices[0].message.content.trim();
}

async function getOrCreateItem(table, title) {
  const slug = generateSlug(title);

  const existing = await knex(table).where({ slug }).first();

  if (existing) {
    return existing.id;
  }

  const [id] = await knex(table).insert({
    title,
    slug,
  });

  return id;
}

async function createTags(product) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',

    messages: [
      {
        role: 'user',
        content: `Create 3-5 niche long tail tags for:
${product.title}

Return only comma separated tags`,
      },
    ],
    temperature: 0.7,
  });

  const tags = response.choices[0].message.content
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const ids = [];

  for (const tag of tags) {
    const id = await getOrCreateItem('tags', tag);

    ids.push(id);
  }

  return ids;
}

async function createItems(product, table, type) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',

    messages: [
      {
        role: 'user',
        content: `Create maximum 5 niche detailed long tail ${type} for:

${product.title}

Return only comma separated values.`,
      },
    ],

    temperature: 0.7,
  });

  const items = response.choices[0].message.content
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const ids = [];

  for (const item of items) {
    const id = await getOrCreateItem(table, item);

    ids.push(id);
  }

  return ids;
}

async function insertRelations(table, column, productId, ids) {
  for (const id of ids) {
    const exists = await knex(table)
      .where({
        product_id: productId,
        [column]: id,
      })
      .first();

    if (!exists) {
      await knex(table).insert({
        product_id: productId,
        [column]: id,
      });
    }
  }
}

async function insertProduct(product) {
  const existing = await knex('products')
    .where({
      external_id: product.external_id,
      platform_id: product.platform_id,
    })
    .first();

  if (existing) {
    console.log(`Already exists: ${product.title}`);

    return existing.id;
  }

  const description = await createGPTDescription(product.title, product.url);

  const metaDescription = await createGPTMeta(product.title);

  const baseSlug = generateSlug(product.title);

  const uniqueSlug = await ensureUniqueSlugItems(baseSlug, 'products');

  // Tags

  const tagIds = await createTags(product);

  // Highlights

  const highlightIds = await createItems(product, 'highlights', 'highlights');

  // Use cases

  const useCaseIds = await createItems(product, 'useCases', 'useCases');

  const [productId] = await knex('products').insert({
    ...product,

    slug: uniqueSlug,

    description_ai: description,

    meta_description: metaDescription,
  });

  console.log(`Inserted product: ${product.title}`);

  await insertRelations('tagsProducts', 'tag_id', productId, tagIds);

  await insertRelations(
    'highlightsProducts',
    'highlight_id',
    productId,
    highlightIds,
  );

  await insertRelations(
    'useCasesProducts',
    'useCase_id',
    productId,
    useCaseIds,
  );

  return productId;
}

const insertProducts = async (products) => {
  const platformId = await getOrCreatePlatform('CJ', 'https://www.cj.com/');

  for (const product of products) {
    try {
      const brandId = await getOrCreateBrand(product.brand);

      const merchantId = await getOrCreateMerchant(
        product.merchant.title,
        product.merchant.external_id,
        platformId,
      );

      const categoryTitle = await createCategoryWithChatGpt(product.title);

      const categoryId = await getOrCreateCategory(categoryTitle);

      await insertProduct({
        external_id: product.external_id,

        title: product.title,

        description: product.description,

        category_id: categoryId,

        platform_id: platformId,

        brand_id: brandId,

        merchant_id: merchantId,

        url: product.url,

        url_affiliate: product.url_affiliate,

        url_image: product.url_image,

        price: product.price,

        currency: product.currency,

        discount_percentage: product.discount_percentage,

        status: product.status,
      });
    } catch (error) {
      console.error(`Failed ${product.title}:`, error.message);
    }
  }
};

module.exports = insertProducts;
