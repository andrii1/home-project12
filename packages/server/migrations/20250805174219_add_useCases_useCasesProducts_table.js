/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('useCases', (table) => {
      table.increments();
      table.string('slug').notNullable();
      table.string('title').notNullable();
      table.text('meta_description').nullable();
    })
    .createTable('useCasesProducts', (table) => {
      table.increments();
      table.integer('product_id').unsigned();
      table.foreign('product_id').references('id').inTable('products');
      table.integer('useCase_id').unsigned();
      table.foreign('useCase_id').references('id').inTable('useCases');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('useCasesProducts').dropTable('useCases');
};
