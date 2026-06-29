/* eslint-disable prefer-arrow-callback */
exports.up = function (knex) {
  return knex.schema.alterTable('products', function (table) {
    table.text('address');
    table.string('postal_code');

    table.text('summary');
    table.text('whats_included');
    table.text('whats_excluded');

    table.time('duration');

    table.boolean('wheelchair_access');
    table.boolean('smartphone_ticket');

    table.decimal('geolocation_lat', 10, 7);
    table.decimal('geolocation_lng', 10, 7);

    table.text('image_alt_text');
    table.string('image_credit');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('products', function (table) {
    table.dropColumn('address');
    table.dropColumn('postal_code');

    table.dropColumn('summary');
    table.dropColumn('whats_included');
    table.dropColumn('whats_excluded');

    table.dropColumn('duration');

    table.dropColumn('wheelchair_access');
    table.dropColumn('smartphone_ticket');

    table.dropColumn('geolocation_lat');
    table.dropColumn('geolocation_lng');

    table.dropColumn('image_alt_text');
    table.dropColumn('image_credit');
  });
};
