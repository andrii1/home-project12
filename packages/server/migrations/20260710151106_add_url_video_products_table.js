/* eslint-disable prefer-arrow-callback */
exports.up = function (knex) {
  return knex.schema.alterTable('products', function (table) {
    table.text('url_video').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('products', function (table) {
    table.dropColumn('url_video');
  });
};
