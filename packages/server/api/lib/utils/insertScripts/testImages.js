const cheerio = require('cheerio');

const url = 'https://www.getyourguide.com/activity/-t847818';

async function getImages() {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'text/html',
    },
  });

  const html = await res.text(); // ← important

  console.log(html.slice(0, 1000));

  const $ = cheerio.load(html);

  const nextData = $('#__NEXT_DATA__').html();
  const json = JSON.parse(nextData);

  const activity =
    json.props.pageProps.activity || json.props.pageProps.initialActivityData;

  const images = activity.photos.map((p) => p.url);

  console.log(images);
}

getImages();
