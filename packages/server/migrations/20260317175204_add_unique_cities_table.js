// migrations/20260317180000_add_country_title_unique_to_cities.js
exports.up = async function (knex) {
  // Add new unique index on country_id + title
  await knex.schema.alterTable('cities', (table) => {
    table.unique(['country_id', 'title'], 'cities_country_id_title_unique');
  });
};

exports.down = async function (knex) {
  // Remove the unique index if rolling back
  await knex.schema.alterTable('cities', (table) => {
    table.dropUnique(['country_id', 'title'], 'cities_country_id_title_unique');
  });
};
