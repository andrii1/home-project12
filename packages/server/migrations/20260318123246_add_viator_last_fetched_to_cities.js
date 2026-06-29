// migrations/20260318_add_viator_last_fetched_to_cities.js
exports.up = async function (knex) {
  await knex.schema.alterTable('cities', (table) => {
    table.timestamp('viator_last_fetched').nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('cities', (table) => {
    table.dropColumn('viator_last_fetched');
  });
};
