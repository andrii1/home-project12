async function getTemuBestSellers() {
  const response = await fetch(
    'https://www.temu.com/api/alexa/homepage/goods_list',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 Chrome/120 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    },
  );

  const json = await response.json();

  const products = json.result.home_goods_list
    .map((item) => item.data)
    .filter(Boolean)
    .map((product) => ({
      id: product.goods_id,

      title: product.title,

      image: product.image?.url,

      price: product.price_info?.price_schema,

      currency: product.price_info?.currency,

      oldPrice: product.price_info?.market_price_str,

      discount: product.price_info?.reduction_text?.join(''),

      url: `https://www.temu.com/${product.link_url}`,
    }));

  return products;
}

getTemuBestSellers()
  .then((products) => {
    console.log('Products:', products.length);
    console.log(products.slice(0, 5));
  })
  .catch(console.error);
