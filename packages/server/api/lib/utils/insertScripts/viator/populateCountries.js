/* eslint-disable no-restricted-syntax */
// scripts/populateCountriesViatorId.js

require('dotenv').config();
const knex = require('../../../../../config/db'); // adjust path to your knex config
const fetch = require('node-fetch'); // Node 20+ has global fetch, skip require if so
const fs = require('fs');

const apiKey = process.env.VIATOR_API_KEY;

function normalizeCountry(title) {
  if (!title) return '';

  // Custom mappings for alternative names
  const mappings = {
    Britain: 'United Kingdom',
    'Kyrgyz Republic': 'Kyrgyzstan',
    'Czech Republic': 'Czechia',
    Holland: 'Netherlands',
    'The Netherlands': 'Netherlands',
    'United States of America': 'United States',
    'Bolivia, Plurinational State of': 'Bolivia',
    'Viet Nam': 'Vietnam',
    'Iran, Islamic Republic of': 'Iran',
    'Tanzania, United Republic of': 'Tanzania',
    'Micronesia, Federated States of': 'Micronesia',
    'Moldova, Republic of': 'Moldova',
    'Palestine, State of': 'Palestine',
    'Congo, the Democratic Republic of the': 'Democratic Republic of the Congo',
    'Korea, Republic of': 'South Korea',
    "Korea, Democratic People's Republic of": 'North Korea',
    // Additional common variants
    Russia: 'Russian Federation',
    Syria: 'Syrian Arab Republic',
    "Lao People's Democratic Republic": 'Laos',
    Libya: 'Libyan Arab Jamahiriya', // older official name, optional
    Brunei: 'Brunei Darussalam',
    'Cape Verde': 'Cabo Verde',
    'East Timor': 'Timor-Leste',
    'Ivory Coast': "Côte d'Ivoire",
    Macedonia: 'Macedonia, the Former Yugoslav Republic of',
    Burma: 'Myanmar',
    'Saint Kitts & Nevis': 'Saint Kitts and Nevis',
    'Saint Lucia': 'Saint Lucia',
    'Saint Vincent': 'Saint Vincent and the Grenadines',
    Trinidad: 'Trinidad and Tobago',
    Vatican: 'Holy See (Vatican City State)',
    UK: 'United Kingdom',
    USA: 'United States',
    'DR Congo': 'Democratic Republic of the Congo',
    'Republic of Congo': 'Congo',
    'Palau Islands': 'Palau',
    'Réunion Island': 'Réunion',
    Reunion: 'Réunion',
    'Virgin Islands (US)': 'Virgin Islands, U.S.',
    'Virgin Islands (UK)': 'Virgin Islands, British',
    Curacao: 'Curaçao',
    Macao: 'Macao',
    'Hong Kong SAR': 'Hong Kong',
    Samoa: 'American Samoa',
  };

  // Step 1: Remove leading "The" and anything after comma
  let displayTitle = title.replace(/^The /i, '').split(',')[0].trim();

  // Step 2: Apply custom mapping if exists
  if (mappings[displayTitle]) displayTitle = mappings[displayTitle];

  // Step 3: Create DB-friendly normalized string
  const normalized = displayTitle.toLowerCase().trim();

  // const normalized = displayTitle
  //   .normalize('NFD') // split accented chars
  //   .replace(/[\u0300-\u036f]/g, '') // remove accents
  //   .toLowerCase()
  //   .replace(/[^a-z0-9]+/g, '') // remove non-alphanumeric
  //   .trim();

  return normalized;
}

async function populateCountriesViatorId() {
  try {
    // 1️⃣ Fetch all Viator destinations
    const response = await fetch(
      'https://api.viator.com/partner/destinations',
      {
        headers: {
          'Content-Type': 'application/json',
          'exp-api-key': apiKey,
          Accept: 'application/json;version=2.0',
          'Accept-Language': 'en-US',
        },
      },
    );

    const data = await response.json();
    if (!data.destinations || data.destinations.length === 0) {
      console.log('No destinations returned from Viator API');
      return;
    }

    // 2️⃣ Filter countries
    const viatorCountries = data.destinations.filter(
      (d) => d.type === 'COUNTRY',
    );

    fs.writeFileSync(
      './viator-countries.json',
      JSON.stringify(viatorCountries, null, 2),
    );

    // // 3️⃣ Fetch all countries from your DB
    // const dbCountries = await knex('countries').select('id', 'title');

    // // 4️⃣ Match and update
    // for (const dbCountry of dbCountries) {
    //   const match = viatorCountries.find(
    //     (v) => normalizeCountry(v.name) === dbCountry.title.toLowerCase(),
    //   );

    //   if (match) {
    //     await knex('countries')
    //       .where('id', dbCountry.id)
    //       .update({ viator_id: match.destinationId });

    //     console.log(
    //       `Updated: ${dbCountry.title} → Viator ID ${match.destinationId}`,
    //     );
    //   } else {
    //     console.log(`No Viator match found for: ${dbCountry.title}`);
    //   }
    // }

    console.log('Finished updating countries with Viator IDs');
  } catch (err) {
    console.error('Error populating countries Viator ID:', err);
  } finally {
    await knex.destroy();
  }
}

// Run the script
populateCountriesViatorId();
