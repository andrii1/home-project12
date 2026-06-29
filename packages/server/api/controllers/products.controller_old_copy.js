/* eslint-disable no-promise-executor-return */
/* eslint-disable one-var */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */
require('dotenv').config();
const generateSlug = require('../lib/utils/generateSlug');
const capitalize = require('../lib/utils/capitalize');

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

const getOppositeOrderDirection = (direction) => {
  let lastItemDirection;
  if (direction === 'asc') {
    lastItemDirection = 'desc';
  } else if (direction === 'desc') {
    lastItemDirection = 'asc';
  }
  return lastItemDirection;
};

function toMySQLTimestamp(datetimeStr) {
  if (!datetimeStr) return null;
  const d = new Date(datetimeStr);
  return d.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:MM:SS"
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
  const existing = await knex('tags').where({ slug }).first();
  return !!existing;
}

// Helper: ensure the slug is unique by checking the DB
async function ensureUniqueSlugItems(baseSlug, table) {
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await slugExistsItems(slug, table)) {
    const suffix = `-${counter}`;
    const maxBaseLength = 200 - suffix.length;
    slug = `${baseSlug.slice(0, maxBaseLength)}${suffix}`;
    counter += 1;
  }

  return slug;
}

// Helper: check if a slug already exists in the database
async function slugExistsItems(slug, table) {
  const existing = await knex(table).where({ slug }).first();
  return !!existing;
}

async function createItems(prompt, table) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const string = completion.choices[0].message.content.trim();

  const array = string
    .split(',')
    .map((tag) => (typeof tag === 'string' ? tag.trim() : null))
    .filter(Boolean);

  const itemsIds = await Promise.all(
    array.map(async (item) => {
      const existing = await knex(table)
        .whereRaw('LOWER(title) = ?', [item.toLowerCase()])
        .first();

      if (existing) {
        return existing.id;
      }

      const baseSlug = generateSlug(item);
      const uniqueSlug = await ensureUniqueSlugItems(baseSlug, table);

      const [itemId] = await knex(table).insert({
        title: item,
        slug: uniqueSlug,
      }); // just use the ID
      return itemId;
    }),
  );
  return itemsIds;
}

function safeJsonParse(text) {
  try {
    // Remove ```json or ``` and trailing ```
    const cleaned = text.replace(/```json\s*|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON from OpenAI:', err, text);
    return null;
  }
}

async function useChatGptForData(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    const rawText = completion.choices[0].message.content;
    const data = safeJsonParse(rawText) || {}; // ✅ parse safely

    return data;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {}; // fallback if API call fails
  }
}

// === Timeout wrproducter ===
async function withTimeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('OpenAI request timeout')), ms),
    ),
  ]);
}

const getProductsAll = async () => {
  try {
    const products = knex('products')
      .select('products.*', 'categories.title as categoryTitle')
      .join('categories', 'products.category_id', '=', 'categories.id');
    return products;
  } catch (error) {
    return error.message;
  }
};

const getProducts = async (page, column, direction) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('products')
        .select(
          'products.*',
          'categories.title as categoryTitle',
          'categories.slug as categorySlug',
        )
        .join('categories', 'products.category_id', '=', 'categories.id');
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const getProductsPagination = async (column, direction, page, size) => {
  try {
    const getModel = () =>
      knex('products')
        .select(
          'products.*',
          'categories.title as categoryTitle',
          'categories.slug as categorySlug',
        )
        .join('categories', 'products.category_id', '=', 'categories.id')
        .orderBy(column, direction);
    const totalCount = await getModel()
      .count('products.id', { as: 'rows' })
      .groupBy('products.id');
    const data = await getModel()
      .offset(page * size)
      .limit(size)
      .select();
    const dataExport = await getModel().select();

    return {
      totalCount: totalCount.length,
      data,
      dataExport,
    };
  } catch (error) {
    return error.message;
  }
};

const getProductsSearch = async (search, column, direction, page, size) => {
  try {
    const getModel = () =>
      knex('products')
        .select('products.*', 'categories.title as categoryTitle')
        .join('categories', 'products.category_id', '=', 'categories.id')
        .orderBy(column, direction)
        .where('products.title', 'like', `%${search}%`);
    const totalCount = await getModel()
      .count('products.id', { as: 'rows' })
      .groupBy('products.id');
    const data = await getModel()
      .offset(page * size)
      .limit(size)
      .select();
    const dataExport = await getModel().select();

    return {
      totalCount: totalCount.length,
      data,
      dataExport,
    };
  } catch (error) {
    return error.message;
  }
};

const getProductsByCategories = async (categories) => {
  try {
    const products = await knex('products')
      .select('products.*', 'categories.title as categoryTitle')
      .join('categories', 'products.category_id', '=', 'categories.id')
      .whereIn('category_id', categories);

    return products;
  } catch (error) {
    return error.message;
  }
};

const getProductsByCategory = async (category, page, column, direction) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('products')
        .select('products.*', 'categories.title as categoryTitle')
        .join('categories', 'products.category_id', '=', 'categories.id')
        .where({
          'products.category_id': category,
        });

    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const getProductsByTag = async (page, column, direction, tag) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('products')
        .select(
          'products.*',
          'categories.title as categoryTitle',
          'tags.id as tagId',
          'tags.slug as tagSlug',
          'tags.title as tagTitle',
        )
        .join('categories', 'products.category_id', '=', 'categories.id')
        .join('tagsProducts', 'tagsProducts.product_id', '=', 'products.id')
        .join('tags', 'tags.id', '=', 'tagsProducts.tag_id')
        .where('tags.slug', '=', `${tag}`);
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const pricingFiltersMap = {
  free: (qb) => qb.orWhere('products.pricing_free', true),
  freemium: (qb) => qb.orWhere('products.pricing_freemium', true),
  'ios-paid': (qb) => qb.orWhere('products.pricing_ios_product_paid', true),
  'ios-free': (qb) => qb.orWhere('products.pricing_ios_product_free', true),
  subscription: (qb) => qb.orWhere('products.pricing_subscription', true),
  'one-time': (qb) => qb.orWhere('products.pricing_one_time', true),
  trial: (qb) => qb.orWhere('products.pricing_trial_available', true),
};

const platformsFiltersMap = {
  'browser-extension': (qb) =>
    qb.orWhereNotNull('products.url_chrome_extension'),
  ios: (qb) => qb.orWhereNotNull('products.productle_id'),
  android: (qb) => qb.orWhereNotNull('products.url_google_play_store'),
  windows: (qb) => qb.orWhereNotNull('products.url_windows'),
  mac: (qb) => qb.orWhereNotNull('products.url_mac'),
};

const socialMediaFiltersMap = {
  twitter: (qb) => qb.orWhereNotNull('products.url_x'),
  discord: (qb) => qb.orWhereNotNull('products.url_discord'),
};

const otherFiltersMap = {
  'open-source': (qb) => qb.orWhere('products.is_open_source', true),
  ai: (qb) => qb.orWhere('products.is_ai_powered', true),
};

const getProductsBy = async ({
  page,
  column,
  direction,
  categories,
  pricing,
  platforms,
  socials,
  other,
  search,
  tags,
  features,
  userTypes,
  occasions,
  useCases,
  industries,
}) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('products')
        .select(
          'products.*',
          'categories.title as categoryTitle',
          'categories.slug as categorySlug',
        )
        .join('categories', 'products.category_id', '=', 'categories.id')
        .modify((queryBuilder) => {
          if (categories !== undefined) {
            const categoriesArray = categories.split(',');
            queryBuilder.whereIn('categories.slug', categoriesArray);
          }
          if (pricing !== undefined) {
            const pricingArray = pricing.split(',');
            queryBuilder.where(function () {
              pricingArray.forEach((pricingItem) => {
                const filterFn = pricingFiltersMap[pricingItem];
                if (filterFn) filterFn(this);
              });
            });
          }

          if (platforms !== undefined) {
            const platformsArray = platforms.split(',');
            queryBuilder.where(function () {
              platformsArray.forEach((platform) => {
                const filterFn = platformsFiltersMap[platform];
                if (filterFn) filterFn(this);
              });
            });
          }

          if (socials !== undefined) {
            const socialsArray = socials.split(',');
            queryBuilder.where(function () {
              socialsArray.forEach((social) => {
                const filterFn = socialMediaFiltersMap[social];
                if (filterFn) filterFn(this);
              });
            });
          }

          if (other !== undefined) {
            const otherArray = other.split(',');
            queryBuilder.where(function () {
              otherArray.forEach((otherItem) => {
                const filterFn = otherFiltersMap[otherItem];
                if (filterFn) filterFn(this);
              });
            });
          }

          if (search !== undefined) {
            const searchArray = search.split(',');
            queryBuilder.where(function () {
              searchArray.forEach((term) => {
                this.orWhere('products.title', 'like', `%${term}%`).orWhere(
                  'products.description',
                  'like',
                  `%${term}%`,
                );
              });
            });
          }

          // if (tags !== undefined) {
          //   const tagsArray = tags.split(',');
          //   queryBuilder.whereIn('products.id', function () {
          //     this.select('product_id')
          //       .from('tagsProducts')
          //       .whereIn('tag_id', tagsArray);
          //   });
          // }
          if (tags !== undefined) {
            const tagsArray = tags.split(',');
            queryBuilder.whereIn('products.id', function () {
              this.select('tagsProducts.product_id')
                .from('tagsProducts')
                .join('tags', 'tagsProducts.tag_id', 'tags.id')
                .whereIn('tags.slug', tagsArray);
            });
          }

          if (features !== undefined) {
            const featuresArray = features.split(',');
            queryBuilder.whereIn('products.id', function () {
              this.select('featuresProducts.product_id')
                .from('featuresProducts')
                .join('features', 'featuresProducts.feature_id', 'features.id')
                .whereIn('features.slug', featuresArray);
            });
          }

          if (userTypes !== undefined) {
            const userTypesArray = userTypes.split(',');
            queryBuilder.whereIn('products.id', function () {
              this.select('userTypesProducts.product_id')
                .from('userTypesProducts')
                .join(
                  'userTypes',
                  'userTypesProducts.userType_id',
                  'userTypes.id',
                )
                .whereIn('userTypes.slug', userTypesArray);
            });
          }

          if (occasions !== undefined) {
            const occasionsArray = occasions.split(',');
            queryBuilder.whereIn('products.id', function () {
              this.select('occasionsProducts.product_id')
                .from('occasionsProducts')
                .join(
                  'occasions',
                  'occasionsProducts.occasion_id',
                  'occasions.id',
                )
                .whereIn('occasions.slug', occasionsArray);
            });
          }

          if (useCases !== undefined) {
            const useCasesArray = useCases.split(',');
            queryBuilder.whereIn('products.id', function () {
              this.select('useCasesProducts.product_id')
                .from('useCasesProducts')
                .join('useCases', 'useCasesProducts.useCase_id', 'useCases.id')
                .whereIn('useCases.slug', useCasesArray);
            });
          }

          if (industries !== undefined) {
            const industriesArray = industries.split(',');
            queryBuilder.whereIn('products.id', function () {
              this.select('industriesProducts.product_id')
                .from('industriesProducts')
                .join(
                  'industries',
                  'industriesProducts.industry_id',
                  'industries.id',
                )
                .whereIn('industries.slug', industriesArray);
            });
          }

          // if (features !== undefined) {
          //   const featuresArray = features.split(',');
          //   queryBuilder.whereIn('products.id', function () {
          //     this.select('product_id')
          //       .from('featuresProducts')
          //       .whereIn('feature_id', featuresArray);
          //   });
          // }
          // if (userTypes !== undefined) {
          //   const userTypesArray = userTypes.split(',');
          //   queryBuilder.whereIn('products.id', function () {
          //     this.select('product_id')
          //       .from('userTypesProducts')
          //       .whereIn('userType_id', userTypesArray);
          //   });
          // }
          // if (occasions !== undefined) {
          //   const occasionsArray = occasions.split(',');
          //   queryBuilder.whereIn('products.id', function () {
          //     this.select('product_id')
          //       .from('occasionsProducts')
          //       .whereIn('occasion_id', occasionsArray);
          //   });
          // }
          // if (useCases !== undefined) {
          //   const useCasesArray = useCases.split(',');
          //   queryBuilder.whereIn('products.id', function () {
          //     this.select('product_id')
          //       .from('useCasesProducts')
          //       .whereIn('useCase_id', useCasesArray);
          //   });
          // }
          // if (industries !== undefined) {
          //   const industriesArray = industries.split(',');
          //   queryBuilder.whereIn('products.id', function () {
          //     this.select('product_id')
          //       .from('industriesProducts')
          //       .whereIn('industry_id', industriesArray);
          //   });
          // }
        });
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10);
    // .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

// Get products by id
const getProductById = async (id) => {
  if (!id) {
    throw new HttpError('Id should be a number', 400);
  }
  try {
    const product = await knex('products')
      .select(
        'products.*',
        'categories.title as categoryTitle',
        'categories.slug as categorySlug',
      )
      .join('categories', 'products.category_id', '=', 'categories.id')
      .where({ 'products.slug': id });
    if (product.length === 0) {
      throw new HttpError(`incorrect entry with the id of ${id}`, 404);
    }
    return product;
  } catch (error) {
    return error.message;
  }
};

// post
// const createProducts = async (token, body) => {
//   try {
//     const userUid = token.split(' ')[1];
//     const user = (await knex('users').where({ uid: userUid }))[0];
//     if (!user) {
//       throw new HttpError('User not found', 401);
//     }
//     await knex('products').insert({
//       title: body.title,
//       description: body.description,
//       topic_id: body.topic_id,
//       user_id: user.id,
//     });
//     return {
//       successful: true,
//     };
//   } catch (error) {
//     return error.message;
//   }
// };

const createProductNode = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) throw new HttpError('User not found', 401);

    // === Check for existing products ===

    const existingProduct = await knex('products')
      .where({ asin: body.asin })
      .first();
    if (existingProduct)
      return {
        successful: true,
        existing: true,
        productId: existingProduct.id,
        productTitle: body.title,
        productAsin: existingProduct.asin,
      };

    // === Tags ===
    const promptTags = `Create 3-4 tags for this product: "${body.title}"${
      body.url ? ` with link ${body.url}` : ''
    }. Tag should be without hashtag, multiple words allowed, and not contain 'product'. Return tags separated by comma.`;
    const tagsString = (
      await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: promptTags }],
        temperature: 0.7,
        max_tokens: 3000,
      })
    ).choices[0].message.content.trim();

    const tagsArray = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (body.tag) tagsArray.push(body.tag);

    const tagIds = await Promise.all(
      tagsArray.map(async (tag) => {
        const existingTag = await knex('tags')
          .whereRaw('LOWER(title) = ?', [tag.toLowerCase()])
          .first();
        if (existingTag) return existingTag.id;
        const uniqueSlug = await ensureUniqueSlug(generateSlug(tag));
        const [tagId] = await knex('tags').insert({
          title: tag,
          slug: uniqueSlug,
        });
        return tagId;
      }),
    );

    // === Prepare product info ===

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Write a short, engaging description for product "${
            body.title
          }"${body.url ? ` with link ${body.url}` : ''}.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });
    const description = completion.choices[0].message.content.trim();

    //     // === Pricing + Attributes ===

    //     const [pricingData, attributesData, faqData] = await Promise.all([
    //       useChatGptForData(
    //         `Given the product "${body.title}"${
    //           productUrl ? ` with website ${productUrl}` : ''
    //         }${
    //           description ? ` and description: \"${description}\"` : ''
    //         }, determine its pricing model.

    // Return JSON with keys:
    // {
    //   "pricing_freemium": true/false,
    //   "pricing_subscription": true/false,
    //   "pricing_one_time": true/false,
    //   "pricing_trial_available": true/false,
    //   "pricing_details": "short human-readable text about pricing, e.g. '$9/mo or $89/year'",
    //   "pricing_url": "official pricing page URL if available, otherwise null",
    //   "pricing_free": true/false
    // }

    // Respond ONLY with valid JSON.`,
    //       ),

    //       useChatGptForData(
    //         `Based on the product "${body.title}"${
    //           productUrl ? ` with website ${productUrl}` : ''
    //         }${
    //           description ? ` and description: \"${description}\"` : ''
    //         }, determine if:

    // Return JSON with keys:
    // {
    //   "is_ai_powered": true/false,
    //   "is_open_source": true/false,
    //   "url_chrome_extension": url for browser extension (if available),
    //   "url_google_play_store": url for android product (if available),
    //   "url_windows": url for windows product (if available),
    //   "url_mac": url for mac product (if available),
    //   "url_x": url for X/twitter account (if available),
    //   "url_discord": url for discord account (if available),
    //   "url_fb": url for Facebook account (if available),
    //   "url_linkedin": url for linkedin account (if available),
    //   "e-mail": e-mail (if available, can be support e-mail),
    // }

    // Respond ONLY with valid JSON.`,
    //       ),

    //       useChatGptForData(
    //         `Based on the product "${body.title}"${
    //           productUrl ? ` with website ${productUrl}` : ''
    //         }${
    //           description ? ` and description: \"${description}\"` : ''
    //         }, determine if:

    // - How to create an account in product "${body.title}".
    // - How to delete an account in product "${body.title}".
    // - How to contact support in product "${body.title}".
    // - How to cancel subscription for product "${body.title}".
    // - How to change profile picture in product "${body.title}".
    // - How to log in "${body.title}".
    // - How to log out "${body.title}".
    // - Is product "${body.title}" on Android?
    // - Product "${body.title}" doesn't work? Any common bugs? How to solve them?
    // - Is product "${body.title}" safe to use? Is it legit or scammy?
    // - Can you make money with product "${body.title}"?
    // - Does it make sense to upgrade in product "${
    //           body.title
    //         }"? What are main features of premium version.
    // - Can you use product "${
    //           body.title
    //         }" for free? Any ways to credits/coins for free? Either via promos, invite codes, completing tasks, etc.
    // - How to use "${body.title}"? Longer description.

    // Return JSON with keys:
    // {
    //     "faq_create_account": answer,
    //     "faq_delete_account": answer,
    //     "faq_contact_support": answer,
    //     "faq_cancel_subscription": answer,
    //     "faq_change_profile_picture": answer,
    //     "faq_log_in": answer,
    //     "faq_log_out": answer,
    //     "faq_is_product_on_android": answer,
    //     "faq_product_doesnt_work_bugs": answer,
    //     "faq_is_safe_to_use": answer,
    //     "faq_how_to_make_money": answer,
    //     "faq_should_you_upgrade": answer,
    //     "faq_can_use_for_free": answer,
    //     "description_how_to_use": answer,

    // }

    // Respond ONLY with valid JSON.`,
    //       ),
    //     ]);

    const baseSlug = generateSlug(body.title);
    const uniqueSlug = await ensureUniqueSlugItems(baseSlug, 'products');

    // === Insert product ===
    const [productId] = await knex('products').insert({
      asin: body.asin,
      title: body.title,
      slug: uniqueSlug,
      price: body.price,
      rating: body.rating,
      reviews: body.review,
      category_id: body.category_id,
      url: body.url,
      url_affiliate: body.url_affiliate,
      url_serpapi: body.url_serpapi,
      url_image: body.url_image,
      descriptionChatGpt: description,
    });

    // === Prompt builder ===
    const buildPrompt = (type, title, url, descriptionParam, quantity) => {
      const examples = {
        features:
          'E.g. Task management, Real-time chat, Analytics dashboard, Export to CSV, API access',
        userTypes: 'E.g. Individuals, Teams, Students, Startups, Enterprises',
        occasions: 'E.g. SaaS, Marketplace, Directory, Tool, Plugin, API',
        useCases:
          'E.g. Social media automation, Time tracking, Resume building, Text summarization',
        industries:
          'E.g. Healthcare, Legal, Real Estate, Content Creators, Developers',
      };

      let base = `for this product: \"${title}\"`;
      if (url) base += ` with website ${url}`;
      if (descriptionParam) base += ` and description: \"${descriptionParam}\"`;

      return `Create ${type} ${base}. ${examples[type]}. ${capitalize(
        type,
      )} should be without hashtag, can be multiple words. Maximum ${quantity} ${type}. Return ${type} separated by comma.`;
    };

    // === Features, UserTypes, Occasions, UseCases, Industries ===
    const featuresIds = await createItems(
      buildPrompt('features', body.title, body.url, description, '5'),
      'features',
    );
    const userTypesIds = await createItems(
      buildPrompt('userTypes', body.title, body.url, description, '5'),
      'userTypes',
    );
    const occasionsIds = await createItems(
      buildPrompt('occasions', body.title, body.url, description, '5'),
      'occasions',
    );
    const useCasesIds = await createItems(
      buildPrompt('useCases', body.title, body.url, description, '5'),
      'useCases',
    );
    const industriesIds = await createItems(
      buildPrompt('industries', body.title, body.url, description, '5'),
      'industries',
    );

    // === Relations ===
    const insertRelations = async (table, key, ids) =>
      Promise.all(
        ids.map((id) =>
          knex(table).insert({ product_id: productId, [key]: id }),
        ),
      );
    await insertRelations('tagsProducts', 'tag_id', tagIds);
    await insertRelations('featuresProducts', 'feature_id', featuresIds);
    await insertRelations('userTypesProducts', 'userType_id', userTypesIds);
    await insertRelations('occasionsProducts', 'occasion_id', occasionsIds);
    await insertRelations('useCasesProducts', 'useCase_id', useCasesIds);
    await insertRelations('industriesProducts', 'industry_id', industriesIds);

    return {
      successful: true,
      productId,
      asin: body.asin,
      productTitle: body.title,
      url: body.url,
    };
  } catch (error) {
    return error.message;
  }
};

// edit
const editProduct = async (token, updatedProductId, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    if (!updatedProductId) {
      throw new HttpError('updatedProductId should be a number', 400);
    }

    await knex('products').where({ id: updatedProductId }).update({
      description: body.description,
    });

    return {
      successful: true,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getProducts,
  getProductsPagination,
  getProductsSearch,
  getProductsByCategories,
  getProductsBy,
  getProductsByCategory,
  getProductById,
  getProductsAll,
  // createProducts,
  editProduct,
  createProductNode,
  getProductsByTag,
};
