/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('tagsProducts', (table) => {
    table.increments();
    table.integer('product_id').unsigned();
    table.foreign('product_id').references('id').inTable('products');
    table.integer('tag_id').unsigned();
    table.foreign('tag_id').references('id').inTable('tags');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('tagsProducts');
};
