/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
const generateSlug = require('../lib/utils/generateSlug');

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
  const existing = await knex('areas').where({ slug }).first();
  return !!existing;
}

const getAreas = async () => {
  try {
    const areas = await knex('areas')
      .select('areas.*', 'countries.slug as countrySlug')
      .leftJoin('countries', 'areas.country_id', 'countries.id')
      .orderBy('areas.title');
    return areas;
  } catch (error) {
    return error.message;
  }
};

const createArea = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    if (!body.title) {
      return {
        successful: false,
        areaId: null,
        message: 'Area title missing',
      };
    }

    // Optional: check for existing area
    const existing = await knex('areas')
      .whereRaw('LOWER(title) = ?', [body.title.toLowerCase()])
      .andWhere('country_id', body.country_id)
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        areaId: existing.id,
        areaTitle: body.title,
      };
    }

    const baseSlug = generateSlug(body.title);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    const insertData = {
      title: body.title,
      country_id: body.country_id,
      slug: uniqueSlug,
    };

    const [areaId] = await knex('areas').insert(insertData);

    return {
      successful: true,
      areaId,
      areaTitle: body.title,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getAreas,
  createArea,
};
