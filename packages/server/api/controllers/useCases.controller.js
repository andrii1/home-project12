/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getUseCases = async () => {
  try {
    const useCases = await knex('useCases');
    return useCases;
  } catch (error) {
    return error.message;
  }
};

const getUseCasesByProduct = async (product) => {
  try {
    const useCases = await knex('useCases')
      .select('useCases.*')
      .join(
        'useCasesProducts',
        'useCasesProducts.useCase_id',
        '=',
        'useCases.id',
      )
      .join('products', 'useCasesProducts.product_id', '=', 'products.id')
      .where({ product_id: product });
    return useCases;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getUseCases,
  getUseCasesByProduct,
};
