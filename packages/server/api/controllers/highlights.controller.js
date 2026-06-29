/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getHighlights = async () => {
  try {
    const highlights = await knex('highlights');

    return highlights;
  } catch (error) {
    return error.message;
  }
};

const getHighlightsByProduct = async (product) => {
  try {
    const highlights = await knex('highlights')
      .select('highlights.*')
      .join(
        'highlightsProducts',
        'highlightsProducts.highlight_id',
        '=',
        'highlights.id',
      )
      .join('products', 'highlightsProducts.product_id', '=', 'products.id')
      .where({ product_id: product });
    return highlights;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getHighlights,
  getHighlightsByProduct,
};
