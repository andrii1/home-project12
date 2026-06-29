// 20260305_create_locations.js

exports.up = function (knex) {
  return (
    knex.schema
      // -------------------
      // Countries table
      // -------------------
      .createTable('countries', (table) => {
        table.increments('id').primary();
        table.string('title', 100).notNullable().unique(); // Country name
        table.string('iso_code', 10).nullable().unique(); // e.g., IT, ES, US
        table.string('slug', 100).notNullable().unique(); // SEO-friendly
        table.boolean('active').defaultTo(true);
        table.datetime('created_at').defaultTo(knex.fn.now());
        table.datetime('updated_at').defaultTo(knex.fn.now());
      })

      // -------------------
      // Areas / States table
      // -------------------
      .createTable('areas', (table) => {
        table.increments('id').primary();
        table.integer('country_id').unsigned().notNullable();
        table
          .foreign('country_id')
          .references('id')
          .inTable('countries')
          .onDelete('CASCADE');
        table.string('title', 100).notNullable();
        table.string('slug', 100).notNullable();
        table.boolean('active').defaultTo(true);
        table.datetime('created_at').defaultTo(knex.fn.now());
        table.datetime('updated_at').defaultTo(knex.fn.now());

        table.unique(['country_id', 'title']); // prevent duplicate area in same country
      })

      // -------------------
      // Cities table
      // -------------------
      .createTable('cities', (table) => {
        table.increments('id').primary();
        table.integer('country_id').unsigned().notNullable();
        table
          .foreign('country_id')
          .references('id')
          .inTable('countries')
          .onDelete('CASCADE');
        table.integer('area_id').unsigned().nullable();
        table
          .foreign('area_id')
          .references('id')
          .inTable('areas')
          .onDelete('SET NULL');
        table.string('title', 100).notNullable();
        table.string('slug', 100).notNullable();
        table.decimal('latitude', 9, 6).nullable();
        table.decimal('longitude', 9, 6).nullable();
        table.boolean('active').defaultTo(true);
        table.datetime('created_at').defaultTo(knex.fn.now());
        table.datetime('updated_at').defaultTo(knex.fn.now());

        table.unique(['country_id', 'area_id', 'title']); // unique within area & country
      })
  );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('cities')
    .dropTableIfExists('areas')
    .dropTableIfExists('countries');
};
