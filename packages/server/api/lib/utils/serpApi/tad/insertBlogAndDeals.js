/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-return-await */
/* eslint-disable prefer-template */
// const fetch = require("node-fetch");

require('dotenv').config();

const fetchSerpApi = require('../serpApiAmazon');
const searchApps = require('../searchApps');
const insertDeals = require('../insertDeals');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

const today = new Date();
const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

const allowedDays = [0, 1, 3, 5];
// const allowedDaysWeek = [0, 3, 5];
const allowedDaysWeek = [0, 5];
const allowedDaysDay = [1];

if (!allowedDays.includes(todayDay)) {
  console.log('Not an allowed day, skipping job.');
  process.exit(0);
}

// Credentials (from .env)
const USER_UID_DEALS = process.env.USER_UID_DEALS_PROD;
const API_PATH_DEALS = process.env.API_PATH_DEALS_PROD;
const USER_UID = process.env.USER_UID_MAH_PROD;
const API_PATH = process.env.API_PATH_MAH_PROD;

const seedList = ['invite code', 'referral code', 'promo code'];

// const queries = [
//   { title: 'emochi ai promo code' },
//   { title: 'meta viewpoints referral codes' },
// ];

// fetch helpers

function capitalizeFirstWord(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function insertQuery(queryObj) {
  const res = await fetch(`${API_PATH}/queries`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryObj),
  });
  return await res.json(); // assume it returns { id, title }
}

async function createBlogContent(queryParam) {
  // Generate a short description using OpenAI

  const prompt = `Create a blog, based on query ${queryParam}. Treat ${queryParam} as main keyword - it should be spread in the blog. Also, you should mention and link to topappdeals.com - as a source of promo codes, referral codes. At least 1300 words. Do not include published by [Your Name] or Published on [Date]. Do not include title, headline, h1, h2 of the blog, just content of the article. Output with markdown.`;
  // console.log(prompt);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const reply = completion.choices[0].message.content.trim();
  return reply;
}

const createPost = async (postDataParam) => {
  try {
    const response = await fetch(`${API_PATH_DEALS}/blogs`, {
      method: 'POST',
      headers: {
        token: `token ${USER_UID_DEALS}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postDataParam),
    });

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();
    console.log('Post created successfully:', data);
  } catch (error) {
    console.error('Error creating post:', error);
  }
};

const createPostMain = async () => {
  // const queries = await fetchSerpApi('7');

  let queries;
  if (allowedDaysWeek.includes(todayDay)) {
    queries = await fetchSerpApi('7', seedList, false, 3);
  }

  if (allowedDaysDay.includes(todayDay)) {
    queries = await fetchSerpApi('1', seedList, false, 3);
  }

  console.log('queries', queries);
  const dedupedQueries = [];
  for (const query of queries) {
    try {
      const newQuery = await insertQuery(query);

      if (newQuery.existing) {
        console.log('Duplicate query skipped:', query.title);
        continue;
      }

      dedupedQueries.push(query.title);

      // CREATE BLOG

      const blogTitle = capitalizeFirstWord(query.title);
      const blogContent = await createBlogContent(query.title);

      const postData = {
        title: blogTitle,
        content: blogContent,
        status: 'published',
        user_id: '1',
      };

      await createPost(postData);
    } catch (err) {
      console.error(`Error processing query "${query.title}":`, err);
    }
  }

  const apps = await searchApps(dedupedQueries);
  await insertDeals(apps);
};

createPostMain().catch(console.error);
