exports.up = async function (knex) {
  await knex.schema.alterTable('products', (table) => {
    table.boolean('private_tour').defaultTo(false);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('products', (table) => {
    table.dropColumn('private_tour');
  });
};
