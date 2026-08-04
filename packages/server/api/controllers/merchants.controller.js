/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */
require('dotenv').config();
const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
const generateSlug = require('../lib/utils/generateSlug');
const { normalizeUrl } = require('../lib/utils/normalizeUrl');

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

    // Check for existing merchant

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

    const normalizedUrl = body.url ? normalizeUrl(body.url) : null;

    const insertData = {
      title: body.title,
      external_id: body.external_id,
      platform_id_id: body.platform_id,
      slug,
      url: normalizedUrl,
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
