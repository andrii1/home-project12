require('dotenv').config();

const { CJ_TOKEN } = process.env;

async function fetchProducts(partnerId, page = null) {
  const pageArg = page ? `, page: "${page}"` : '';

  const query = `
    query {
      products(
        companyId: "7802776",
        partnerIds: [${partnerId}],
        limit: 2
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

  return data.data.products;
}

async function fetchAllProducts(partnerId) {
  let allProducts = [];
  let nextPage = null;

  do {
    const result = await fetchProducts(partnerId, nextPage);

    allProducts.push(...result.resultList);

    console.log(`Fetched ${allProducts.length}/${result.totalCount}`);

    nextPage = result.nextPage;
  } while (nextPage);

  return allProducts;
}

(async () => {
  // const products = await fetchAllProducts();

  // console.log(`Finished: ${products.length} products`);

  const productsSmall = await fetchProducts('5357356');

  console.log(JSON.stringify(productsSmall.resultList, null, 2));
})();
