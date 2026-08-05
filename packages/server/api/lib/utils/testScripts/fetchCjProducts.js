/* eslint-disable no-await-in-loop */
require('dotenv').config();

const { CJ_TOKEN } = process.env;

const partners = [
  // '5357356', // Rexing
  '7889430', // Abracadabra NYC
];

async function fetchProducts(partnerIds, page = null) {
  const pageArg = page ? `, page: "${page}"` : '';

  //   const query = `{
  //   __type(name: "Product") {
  //     fields {
  //       name
  //     }
  //   }
  // }`;

  const query = `
    query {
      products(
        companyId: "7802776",
        partnerIds: ${JSON.stringify(partnerIds)},
        limit: 2,
        availability: IN_STOCK,
        ${pageArg}
      ) {
        resultList {
          id
          title
          description
          brand
          imageLink
          link
          linkCode(pid: "101851090") {
            clickUrl
          }
          price {
            amount
            currency
          }
          salePrice {
            amount
            currency
          }
          discountPercentage
        }
        totalCount
        count
        nextPage
      }
    }
  `;

  const response = await fetch('https://ads.api.cj.com/query', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CJ_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  console.log(JSON.stringify(data, null, 2));

  return data.data.products;
}

async function fetchAllProducts(partnerIds) {
  let allProducts = [];
  let nextPage = null;

  do {
    const result = await fetchProducts(partnerIds, nextPage);

    allProducts.push(...result.resultList);

    console.log(`Fetched ${allProducts.length}/${result.totalCount}`);

    nextPage = result.nextPage;
  } while (nextPage);

  return allProducts;
}

function mapCJProducts(products) {
  return products.map((product) => ({
    external_id: product.id,

    title: product.title,

    description: product.description,

    // temporary values until you resolve them
    brand: product.brand || null,
    merchant: {
      external_id: product.advertiserId,
      title: product.advertiserName,
    },

    url: product.link,
    url_affiliate: product.linkCode?.clickUrl,
    url_image: product.imageLink,

    price: product.salePrice?.amount || product.price?.amount || null,

    currency: product.salePrice?.currency || product.price?.currency || 'USD',

    discount_percentage: product.discountPercentage || null,

    status: 'active',
  }));
}

(async () => {
  // const products = await fetchAllProducts(partners);

  // const mappedProducts = mapCJProducts(products);

  // console.log(`Finished: ${products.length} products`);

  //  await insertProducts(mappedProducts);

  const productsSmall = await fetchProducts(partners);
  console.log(productsSmall);

  // const mappedProductsSmall = mapCJProducts(productsSmall.resultList);

  // console.log(JSON.stringify(mappedProductsSmall, null, 2));
})();
