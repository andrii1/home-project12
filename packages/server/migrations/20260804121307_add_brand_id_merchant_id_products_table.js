// YYYYMMDDHHMMSS_add_brand_and_merchant_to_products.js

exports.up = function (knex) {
  return knex.schema.table('products', (table) => {
    table.integer('brand_id').unsigned().nullable();

    table
      .foreign('brand_id')
      .references('id')
      .inTable('brands')
      .onDelete('SET NULL');

    table.integer('merchant_id').unsigned().nullable();

    table
      .foreign('merchant_id')
      .references('id')
      .inTable('merchants')
      .onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.table('products', (table) => {
    table.dropForeign('brand_id');
    table.dropForeign('merchant_id');

    table.dropColumn('brand_id');
    table.dropColumn('merchant_id');
  });
};
