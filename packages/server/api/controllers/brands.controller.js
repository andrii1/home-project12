/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */
require('dotenv').config();
const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
const generateSlug = require('../lib/utils/generateSlug');
const { normalizeUrl } = require('../lib/utils/normalizeUrl');

const getBrands = async () => {
  try {
    const brands = await knex('brands')
      .select('brands.*')
      .distinct('brands.id')
      .join('products', 'products.brand_id', '=', 'brands.id')
      .orderBy('brands.title');
    return brands;
  } catch (error) {
    return error.message;
  }
};

const createBrand = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    // Optional: check for existing brand
    const slug = generateSlug(body.title);
    const existing = await knex('brands').where({ slug }).first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        brandId: existing.id,
        brandTitle: body.title,
      };
    }

    const insertData = {
      title: body.title,
      slug,
      logo_url: body.logo_url,
    };

    const [brandId] = await knex('brands').insert(insertData);

    return {
      successful: true,
      brandId,
      brandTitle: body.title,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getBrands,
  createBrand,
};
