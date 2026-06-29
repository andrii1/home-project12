/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */
require('dotenv').config();
const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
const generateSlug = require('../lib/utils/generateSlug');
const { normalizeUrl } = require('../lib/utils/normalizeUrl');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

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
  const existing = await knex('platforms').where({ slug }).first();
  return !!existing;
}

const getPlatforms = async () => {
  try {
    const platforms = await knex('platforms')
      .select('platforms.*')
      .distinct('platforms.id')
      .join('products', 'products.platform_id', '=', 'platforms.id')
      .orderBy('platforms.title');
    return platforms;
  } catch (error) {
    return error.message;
  }
};

const createPlatform = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    // Optional: check for existing platform
    const existing = await knex('platforms')
      .whereRaw('LOWER(title) = ?', [body.title.toLowerCase()])
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        platformId: existing.id,
        platformTitle: body.title,
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Write a short, engaging description for "${body.title}"${
            body.url ? ` with link ${body.url}` : ''
          }.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });
    const description = completion.choices[0].message.content.trim();

    const completionMetaDescription = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Write a short, engaging meta description SEO for "${
            body.title
          }"${
            body.url ? ` with link ${body.url}` : ''
          }. Maximum 150 characters.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });
    const metaDescription =
      completionMetaDescription.choices[0].message.content.trim();

    const baseSlug = generateSlug(body.title);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);
    const normalizedUrl = body.url ? normalizeUrl(body.url) : null;

    const insertData = {
      title: body.title,
      slug: uniqueSlug,
      url: normalizedUrl,
      description,
      meta_description: metaDescription,
    };

    const [platformId] = await knex('platforms').insert(insertData);

    return {
      successful: true,
      platformId,
      platformTitle: body.title,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getPlatforms,
  createPlatform,
};
