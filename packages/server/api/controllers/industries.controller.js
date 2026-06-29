/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getIndustries = async () => {
  try {
    const industries = await knex('industries');
    return industries;
  } catch (error) {
    return error.message;
  }
};

const getIndustriesByProduct = async (product) => {
  try {
    const industries = await knex('industries')
      .select('industries.*')
      .join(
        'industriesProducts',
        'industriesProducts.industry_id',
        '=',
        'industries.id',
      )
      .join('products', 'industriesProducts.product_id', '=', 'products.id')
      .where({ product_id: product });
    return industries;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getIndustries,
  getIndustriesByProduct,
};
