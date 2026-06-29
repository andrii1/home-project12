const { create } = require('xmlbuilder2');

const knex = require('../../config/db');

const getFile = async () => {
  try {
    const products = await knex('products')
      .whereNotNull('title')
      .whereNotNull('price')
      .whereNotNull('url_image')
      .where('currency', 'USD')
      .limit(1000); // start small

    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('rss', {
      version: '2.0',
      'xmlns:g': 'http://base.google.com/ns/1.0',
    });

    const channel = root.ele('channel');

    channel.ele('title').txt('Book Travel Activities');
    channel.ele('link').txt('https://www.booktravelactivities.com');
    channel.ele('description').txt('Tours and activities');

    products.forEach((p) => {
      const item = channel.ele('item');

      item.ele('g:id').txt(p.id);
      item.ele('g:title').dat(p.title);
      item.ele('g:description').dat(p.description || '');

      item
        .ele('g:link')
        .txt(`https://www.booktravelactivities.com/products/${p.slug}`);

      item.ele('g:image_link').txt(p.url_image);

      item.ele('g:availability').txt('in_stock');

      item.ele('g:price').txt(`${p.price} ${p.currency}`);

      item.ele('g:condition').txt('new');
      item.ele('g:brand').txt('Book Travel Activities');
      item.ele('g:identifier_exists').txt('no');

      // ✅ Optional reviews
      if (p.reviews && p.rating) {
        const review = item.ele('g:review');
        review.ele('g:review_rating').txt(p.rating); // e.g. 4.8
        review.ele('g:review_count').txt(p.reviews);
      }

      item.ele('g:google_product_category').txt('499969');

      const shipping = item.ele('g:shipping');
      shipping.ele('g:country').txt('US');
      shipping.ele('g:service').txt('Digital Delivery');
      shipping.ele('g:price').txt('0 USD');
    });

    const xml = root.end({ prettyPrint: true });
    return xml;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = {
  getFile,
};
