/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getOccasions = async () => {
  try {
    const occasions = await knex('occasions');

    return occasions;
  } catch (error) {
    return error.message;
  }
};

const getOccasionsByProduct = async (product) => {
  try {
    const occasions = await knex('occasions')
      .select('occasions.*')
      .join(
        'occasionsProducts',
        'occasionsProducts.occasion_id',
        '=',
        'occasions.id',
      )
      .join('products', 'occasionsProducts.product_id', '=', 'products.id')
      .where({ product_id: product });
    return occasions;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getOccasions,
  getOccasionsByProduct,
};
