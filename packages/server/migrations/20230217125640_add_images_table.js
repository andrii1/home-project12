exports.up = function (knex) {
  return knex.schema.createTable('images', (table) => {
    table.increments('id').primary();

    table.integer('product_id').unsigned().notNullable();
    table
      .foreign('product_id')
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');

    table.text('url').notNullable(); // main image URL
    table.text('url_small').nullable(); // optional smaller version
    table.text('url_large').nullable(); // optional larger version

    table.string('alt_text').nullable();
    table.string('caption').nullable();

    table.integer('position').unsigned().defaultTo(0); // ordering of images
    table.boolean('is_cover').defaultTo(false); // main product image

    table.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
    table.datetime('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));

    table.index(['product_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('images');
};
