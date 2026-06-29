/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getUserTypes = async () => {
  try {
    const userTypes = await knex('userTypes');

    return userTypes;
  } catch (error) {
    return error.message;
  }
};

const getUserTypesByProduct = async (product) => {
  try {
    const userTypes = await knex('userTypes')
      .select('userTypes.*')
      .join(
        'userTypesProducts',
        'userTypesProducts.userType_id',
        '=',
        'userTypes.id',
      )
      .join('products', 'userTypesProducts.product_id', '=', 'products.id')
      .where({ product_id: product });
    return userTypes;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getUserTypes,
  getUserTypesByProduct,
};
