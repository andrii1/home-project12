// migrations/20260317_add_viator_id_columns.js

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // Add viator_id to countries
  await knex.schema.alterTable('countries', (table) => {
    table.integer('viator_id').nullable().unique();
  });

  // Add viator_id to areas
  await knex.schema.alterTable('areas', (table) => {
    table.integer('viator_id').nullable().unique();
  });

  // Add viator_id to cities
  await knex.schema.alterTable('cities', (table) => {
    table.integer('viator_id').nullable().unique();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('cities', (table) => {
    table.dropColumn('viator_id');
  });

  await knex.schema.alterTable('areas', (table) => {
    table.dropColumn('viator_id');
  });

  await knex.schema.alterTable('countries', (table) => {
    table.dropColumn('viator_id');
  });
};
