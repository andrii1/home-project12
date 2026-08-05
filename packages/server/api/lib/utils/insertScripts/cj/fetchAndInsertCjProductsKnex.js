/* eslint-disable no-await-in-loop */
require('dotenv').config();

const { CJ_TOKEN } = process.env;

const insertProducts = require('./insertProductsKnex');

const partners = [
  '5357356', // Rexing
  '7889430', // Abracadabra NYC
];

async function fetchProducts(partnerIds, page = null) {
  const pageArg = page ? `, page: "${page}"` : '';

  const query = `
    query {
      products(
        companyId: "7802776",
        partnerIds: ${JSON.stringify(partnerIds)},
        limit: 100,
        availability: IN_STOCK,
        ${pageArg}
      ) {
        resultList {
          id
          title
          description
          advertiserId
          advertiserName
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

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  const data = await response.json();

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

async function fetchAndInsertAllProducts() {
  const products = await fetchAllProducts(partners);

  const mappedProducts = mapCJProducts(products);

  console.log(`Finished: ${products.length} products`);

  await insertProducts(mappedProducts);

  // const productsSmall = await fetchProducts(partners);
  // console.log(productsSmall);

  // const mappedProductsSmall = mapCJProducts(productsSmall.resultList);

  // console.log(JSON.stringify(mappedProductsSmall, null, 2));

  // await insertProducts(mappedProductsSmall);
}

fetchAndInsertAllProducts();
