const cheerio = require('cheerio');

async function getDescription(asin) {
  const url = `https://www.amazon.com/dp/${asin}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $('#productTitle').text().trim();

  const bullets = [];
  $('#feature-bullets li span').each((_, el) => {
    const text = $(el).text().trim();
    if (text) bullets.push(text);
  });

  const description = $('#productDescription').text().trim();

  return {
    title,
    bullets,
    description,
  };
}

// Example
getDescription('B0F7PYZ44K').then(console.log).catch(console.error);
