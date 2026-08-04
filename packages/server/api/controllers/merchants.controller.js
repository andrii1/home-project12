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

const getMerchants = async () => {
  try {
    const merchants = await knex('merchants')
      .select('merchants.*')
      .distinct('merchants.id')
      .join('products', 'products.merchant_id', '=', 'merchants.id')
      .orderBy('merchants.title');
    return merchants;
  } catch (error) {
    return error.message;
  }
};

const createMerchant = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    // Optional: check for existing merchant

    const slug = generateSlug(body.title);
    const existing = await knex('merchants')
      .where({ slug })
      .andWhere('platform_id', body.platform_id)
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        merchantId: existing.id,
        merchantTitle: body.title,
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

    const normalizedUrl = body.url ? normalizeUrl(body.url) : null;

    const insertData = {
      title: body.title,
      slug,
      url: normalizedUrl,
      description,
      meta_description: metaDescription,
    };

    const [merchantId] = await knex('merchants').insert(insertData);

    return {
      successful: true,
      merchantId,
      merchantTitle: body.title,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getMerchants,
  createMerchant,
};
