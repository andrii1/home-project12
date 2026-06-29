exports.up = function (knex) {
  return knex.schema.createTable('products', (table) => {
    table.increments();
    table.string('external_id', 100).notNullable();
    table.text('title').notNullable();
    table.string('slug').notNullable();

    table.text('description').nullable();
    table.text('description_ai').nullable();

    table.integer('category_id').unsigned();
    table.foreign('category_id').references('id').inTable('categories');

    table.integer('platform_id').unsigned();
    table.foreign('platform_id').references('id').inTable('platforms');

    table.integer('city_id').unsigned();
    table.foreign('city_id').references('id').inTable('cities');

    table.text('url').nullable();
    table.text('url_affiliate').nullable();
    table.text('url_image').nullable();
    table.string('url_icon').nullable();
    table.decimal('rating', 2, 1).unsigned().nullable();
    table.integer('reviews').unsigned().nullable();
    table.decimal('price', 10, 2).unsigned().nullable();
    table.integer('discount_percentage').unsigned().nullable();
    table.string('currency', 10).defaultTo('EUR');
    table.boolean('featured').defaultTo(false);
    table.boolean('sponsored').defaultTo(false);
    table.boolean('top_rated').defaultTo(false);
    table.boolean('bestseller').defaultTo(false);
    table.integer('bought_last_month').unsigned().nullable();
    table.integer('rank').unsigned().nullable();
    table.decimal('duration_hours', 5, 2).nullable();
    table.boolean('instant_confirmation').defaultTo(false);
    table.boolean('free_cancellation').defaultTo(false);
    table.integer('max_group_size').nullable();
    table.string('language').nullable();
    table.string('meeting_point').nullable();
    table.boolean('mobile_ticket').defaultTo(false);
    table.boolean('likely_to_sell_out').defaultTo(false);
    table.text('meta_description').nullable();
    table.datetime('last_checked_at').nullable();
    table
      .enu('status', ['active', 'unavailable', 'deleted'])
      .defaultTo('active');

    table.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
    table.datetime('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));
    // -------------------
    // Unique constraint
    // -------------------
    table.unique(['platform_id', 'external_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('products');
};
