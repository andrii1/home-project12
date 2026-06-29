require('dotenv').config();

const apiKey = process.env.VIATOR_API_KEY;

async function getViatorProducts() {
  try {
    const response = await fetch(
      'https://api.viator.com/partner/products/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'exp-api-key': apiKey,
          Accept: 'application/json;version=2.0',
          'Accept-Language': 'en-US',
        },
        body: JSON.stringify({
          filtering: {
            destination: 4772,
          },
          currency: 'USD',
          pagination: {
            start: 1,
            count: 10,
          },
        }),
      },
    );

    const data = await response.json();

    console.log('data', data);

    return data;
  } catch (err) {
    console.error(err);
  }
}

// Usage example

getViatorProducts();

module.exports = getViatorProducts;
