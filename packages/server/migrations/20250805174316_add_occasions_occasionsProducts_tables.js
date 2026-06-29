/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('occasions', (table) => {
      table.increments();
      table.string('slug').notNullable();
      table.string('title').notNullable();
      table.text('meta_description').nullable();
    })
    .createTable('occasionsProducts', (table) => {
      table.increments();
      table.integer('product_id').unsigned();
      table.foreign('product_id').references('id').inTable('products');
      table.integer('occasion_id').unsigned();
      table.foreign('occasion_id').references('id').inTable('occasions');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('occasionsProducts').dropTable('occasions');
};
