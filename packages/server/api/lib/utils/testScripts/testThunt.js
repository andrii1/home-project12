async function getRanks() {
  const url = 'https://thunt.ai/api/rank/rank_list?rank_type=1&date=2026-07-08';

  const res = await fetch(url);

  const data = await res.json();

  console.log(JSON.stringify(data, null, 2));
}

getRanks();
