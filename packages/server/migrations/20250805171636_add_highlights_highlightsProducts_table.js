/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('highlights', (table) => {
      table.increments();
      table.string('slug').notNullable();
      table.string('title').notNullable();
      table.text('meta_description').nullable();
    })
    .createTable('highlightsProducts', (table) => {
      table.increments();
      table.integer('product_id').unsigned();
      table.foreign('product_id').references('id').inTable('products');
      table.integer('highlight_id').unsigned();
      table.foreign('highlight_id').references('id').inTable('highlights');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('highlightsProducts').dropTable('highlights');
};
