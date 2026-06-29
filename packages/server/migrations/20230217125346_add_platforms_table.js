/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema.createTable('platforms', (table) => {
    table.increments('id').primary();
    table.string('title', 100).notNullable(); // e.g., "Amazon", "eBay"
    table.string('url', 100).nullable(); // e.g., amazon.com, ebay.com
    table.text('description').nullable();
    table.text('meta_description').nullable();
    table.string('slug').notNullable();
    table.boolean('active').defaultTo(true);
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('platforms');
};
