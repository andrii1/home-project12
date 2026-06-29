/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-return-await */
/* eslint-disable prefer-template */
// const fetch = require("node-fetch");

require('dotenv').config();
const GhostAdminAPI = require('@tryghost/admin-api');

const OpenAI = require('openai');
const fetchSerpApi = require('../serpApi');
const searchApps = require('../searchApps');
const insertApps = require('../insertApps');
const insertDeals = require('../insertDeals');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

const api = new GhostAdminAPI({
  url: 'https://mrhack.io',
  key: process.env.GHOST_API_KEY, // from Ghost custom integration
  version: 'v4.0', // or whatever version your Ghost install uses
});

const today = new Date();
const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

const allowedDays = [0, 1, 3, 4, 5, 6];

const allowedDaysAppWeek = [0, 3, 5];
const allowedDaysAppDay = [1, 4, 6];
const allowedDaysOtherKeywords = [0, 5];

if (!allowedDays.includes(todayDay)) {
  console.log('Not an allowed day, skipping job.');
  process.exit(0);
}

const seedListAppKeyword = ['app'];
const seedListOtherKeywords = ['error'];

// Credentials (from .env)
const USER_UID = process.env.USER_UID_MAH_PROD;
const API_PATH = process.env.API_PATH_MAH_PROD;
const USER_UID_ERRORS = process.env.USER_UID_ERRORS_LOCAL;
const API_PATH_ERRORS = process.env.API_PATH_ERRORS_LOCAL;

// fetch helpers

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

  const prompt = `Create a blog, based on query ${queryParam}. Treat ${queryParam} as main keyword - it should be spread in the blog. At least 1300 words. Do not include published by [Your Name] or Published on [Date]. Output with html tags, no markdown, to insert in Ghost CMS.`;
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

async function createErrorContent(queryParam) {
  // Generate a short description using OpenAI

  const prompt = `Create a content-solution for this error: "${queryParam}". Try to answer questions like "How to solve ${queryParam}?". Browse recent threads in reddit, forums, support forums, social media threads about error "${queryParam}". Summarize user experience and what are possible solutions for error "${queryParam}". Treat ${queryParam} as main keyword - it should be spread in the blog. At least 1300 words. Do not include published by [Your Name] or Published on [Date]. Do not include title, headline, h1, h2 of the blog, just content of the article. Output with markdown.`;
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
    const post = await api.posts.add(postDataParam);
    console.log('Post created:', post.url);
  } catch (err) {
    console.error('Error creating post:', err);
  }
};

function capitalizeFirstWord(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const createError = async (postDataParam) => {
  try {
    const response = await fetch(`${API_PATH_ERRORS}/errors`, {
      method: 'POST',
      headers: {
        token: `token ${USER_UID_ERRORS}`,
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
  // let queries;
  // if (allowedDaysWeek.includes(todayDay)) {
  //   queries = await fetchSerpApi('7', seedList, true);
  // }

  // if (allowedDaysDay.includes(todayDay)) {
  //   queries = await fetchSerpApi('1', seedList, false);
  // }

  let queries = [];

  // 1. Existing weekly logic
  // if (allowedDaysAppWeek.includes(todayDay)) {
  //   const q = await fetchSerpApi('7', seedListAppKeyword, true, 1);
  //   queries = queries.concat(q);
  // }

  // // 2. Existing daily logic
  // if (allowedDaysAppDay.includes(todayDay)) {
  //   const q = await fetchSerpApi('1', seedListAppKeyword, false, 1);
  //   queries = queries.concat(q);
  // }

  // // 3. NEW: additional queries for special keyword days
  // if (allowedDaysOtherKeywords.includes(todayDay)) {
  const q = await fetchSerpApi('7', seedListOtherKeywords, false, 1);
  queries = queries.concat(q);
  // }

  // const queries = await fetchSerpApi('7', true);
  console.log('queries', queries);
  const dedupedQueries = [];
  for (const query of queries) {
    // const newQuery = await insertQuery(query);

    // if (newQuery.existing) {
    //   console.log('Duplicate query skipped:', query);
    //   continue;
    // }

    if (query.source.includes('app')) {
      dedupedQueries.push(query.title);
    }

    // const blogTitle = capitalizeFirstWord(query.title);
    // const blogContent = await createBlogContent(query.title);

    // const postData = {
    //   title: blogTitle,
    //   mobiledoc: JSON.stringify({
    //     version: '0.3.1',
    //     atoms: [],
    //     cards: [
    //       [
    //         'html',
    //         {
    //           cardName: 'html',
    //           html: blogContent,
    //         },
    //       ],
    //     ],
    //     markups: [],
    //     sections: [[10, 0]],
    //   }),
    //   status: 'published',
    // };

    // await createPost(postData);

    if (query.source.includes('error')) {
      const errorTitle = capitalizeFirstWord(query.title);
      const errorContent = await createErrorContent(query.title);

      const errorData = {
        title: errorTitle,
        content: errorContent,
        status: 'published',
        user_id: '1',
      };

      await createError(errorData);
    }
  }

  // console.log('dedupedQueries', dedupedQueries);
  // const apps = await searchApps(dedupedQueries);
  // await insertApps(apps);
  // await insertDeals(apps);
};

createPostMain().catch(console.error);
