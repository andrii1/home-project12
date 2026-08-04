// YYYYMMDDHHMMSS_create_brands_table.js

exports.up = function (knex) {
  return knex.schema.createTable('brands', (table) => {
    table.increments();

    table.string('title').notNullable();
    table.string('slug').notNullable().unique();
    table.text('logo_url').nullable();

    table.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));

    table.datetime('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('brands');
};
