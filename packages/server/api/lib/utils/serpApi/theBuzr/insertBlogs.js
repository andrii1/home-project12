/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-return-await */
/* eslint-disable prefer-template */
// const fetch = require("node-fetch");

require('dotenv').config();

const fetchSerpApi = require('../serpApiAmazon');
const fetchSerpApiTrendingNow = require('../serpApiTrendingNow');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

const today = new Date();
const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

const allowedDays = [0, 1, 3];
const allowedDaysEng = [0];
const allowedDaysUa = [3];
const allowedDaysTrendingNow = [1];

if (!allowedDays.includes(todayDay)) {
  console.log('Not an allowed day, skipping job.');
  process.exit(0);
}

// Credentials (from .env)
const USER_UID_BLOG = process.env.USER_UID_BLOG_PROD;
const API_PATH_BLOG = process.env.API_PATH_BLOG_PROD;
// Credentials (from .env)
const USER_UID = process.env.USER_UID_MAH_PROD;
const API_PATH = process.env.API_PATH_MAH_PROD;

const seedList = [
  'how to use',
  'how to delete',
  'how to withdraw',
  'review',
  'reviews',
  'tutorial',
  'application',
  'stop',
  'how to fix',
  'how to earn',
  'how to get free',
  'for free',
  'stock',
  'price',
  'challenge',
  'ai',
  'courses',
  'best course for',
  'learn',
  'online class',
  'online training',
  'lessons',
  'best tool for',
  'printable',
  'notion template',
  'canva template',
  'best gear',
  'gear for',
  'list',
  'travel',
  'travel gear',
  'essentials',
  'best toys',
  'gifts for',
  'books for',
  'ideas',
  'best product for',
  'product for',
  'kitchen',
  'finance',
  'remote',
  'remote work',
  'creator',
  'fitness',
  'wellness',
  'buy cheap',
  'buy amazon',
  'amazon',
  'buy',
  'shop',
  'buy whatnot',
  'buy tiktok',
  'supplies for',
  'hobby',
  'kits',
  'presentation',
  'decor',
  'budget',
  'solutions',
  'organize',
  'solve',
  'cheap',
  'itinerary',
  'games',
  'meditation',
  'digital',
  'jobs',
  'how to find job',
  'online store',
  'alernative to',
  'amazon alternatives',
  'food',
  'best rated',
  'top list',
  'apps similar to',
  'best service for',
  'for students',
  'for teenagers',
  'gen z',
  'gen alpha',
  'carpathians',
  'travel ukraine',
  'ukraine',
  'outdoor',
  'buy temu',
  'buy shein',
  'discounts',
  'what to do if',
  't shirt',
  'cap with',
  'sticker with',
  'affiliate',
  'affiliate links',
  'near me',
  'how long',
  'top 10',
  'startup',
  'funding',
  'banned',
  'unable',
  `can't`,
  'problem',
  'turn off',
  'visit',
  'tickets',
  'book tickets',
  'tour',
  'sales',
];

const seedListUa = [
  'додаток',
  'сайт',
  'ціна',
  'огляд',
  'безплатно',
  'подорож',
  'купити',
  'купити україна',
  'дешево',
];

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

  const prompt = `Create a blog, based on query ${queryParam}. Treat ${queryParam} as main keyword - it should be spread in the blog. At least 1300 words. Do not include published by [Your Name] or Published on [Date]. Do not include title, headline, h1, h2 of the blog, just content of the article. Output with markdown.`;
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
    const response = await fetch(`${API_PATH_BLOG}/blogs`, {
      method: 'POST',
      headers: {
        token: `token ${USER_UID_BLOG}`,
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
  // const queries = await fetchSerpApi('7', seedList, false, 4);

  let queries;
  if (allowedDaysEng.includes(todayDay)) {
    queries = await fetchSerpApi('7', seedList, false, 4);
  }

  if (allowedDaysUa.includes(todayDay)) {
    queries = await fetchSerpApi('7', seedListUa, false, 4, 'uk', '');
  }

  if (allowedDaysTrendingNow.includes(todayDay)) {
    queries = await fetchSerpApiTrendingNow('24', 4, 'googleTrendingNow');
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

  // const apps = await searchBlogs(dedupedQueries);
  // await insertBlogs(apps);
};

createPostMain().catch(console.error);
