// YYYYMMDDHHMMSS_create_merchants_table.js

exports.up = function (knex) {
  return knex.schema.createTable('merchants', (table) => {
    table.increments();

    table.integer('platform_id').unsigned().notNullable();

    table
      .foreign('platform_id')
      .references('id')
      .inTable('platforms')
      .onDelete('CASCADE');

    // CJ advertiser ID, Amazon seller ID, etc.
    table.string('external_id', 100).notNullable();

    table.string('title').notNullable();
    table.string('slug').notNullable();

    table.text('url').nullable();

    table.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));

    table.datetime('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));

    table.unique(['platform_id', 'external_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('merchants');
};
