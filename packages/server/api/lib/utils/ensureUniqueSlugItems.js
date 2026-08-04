const knex = require('../../../config/db');

const ensureUniqueSlugItems = async (baseSlug, table) => {
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await slugExists(slug, table)) {
    const suffix = `-${counter}`;
    const maxBaseLength = 200 - suffix.length;
    slug = `${baseSlug.slice(0, maxBaseLength)}${suffix}`;
    counter += 1;
  }

  return slug;
};

// Helper: check if a slug already exists in the database
async function slugExists(slug, table) {
  const existing = await knex(table).where({ slug }).first();
  return !!existing;
}

module.exports = ensureUniqueSlugItems;
