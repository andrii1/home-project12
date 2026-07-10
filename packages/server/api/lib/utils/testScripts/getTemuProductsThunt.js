async function fetchPage(date) {
  const url = `https://thunt.ai/api/rank/rank_list?rank_type=0&date=${date}`;

  try {
    const res = await fetch(url);

    const data = await res.json();

    return (data.data?.list || []).map((product) => ({
      id: product.product_id,
      title: product.product_name,
      image: product.logo_url,
      price: product.price_us || product.price_all,
      rating: product.rating,
      reviews: product.review_num,
      category: product.category_backend?.[0]?.cate_name_en || null,
      rank: product.rank_index,
      url: `https://www.temu.com/goods.html?goods_id=${product.product_id}`,
    }));
  } catch (err) {
    console.error(`Error fetching rankings:`, err);
    return [];
  }
}

const products = await fetchPage('2026-07-08');

console.log(products.slice(0, 5));
