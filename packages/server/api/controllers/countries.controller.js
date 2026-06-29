/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
const generateSlug = require('../lib/utils/generateSlug');

// Helper: ensure the slug is unique by checking the DB
async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await slugExists(slug)) {
    const suffix = `-${counter}`;
    const maxBaseLength = 200 - suffix.length;
    slug = `${baseSlug.slice(0, maxBaseLength)}${suffix}`;
    counter += 1;
  }

  return slug;
}

// Helper: check if a slug already exists in the database
async function slugExists(slug) {
  const existing = await knex('countries').where({ slug }).first();
  return !!existing;
}

// Normalize a country name for DB and duplicates
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

const getCountries = async () => {
  try {
    const countries = await knex('countries')
      .select('countries.*')
      .orderBy('countries.title');
    return countries;
  } catch (error) {
    return error.message;
  }
};

const createCountry = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    // Optional: check for existing country
    const existing = await knex('countries')
      .whereRaw('LOWER(title) = ?', [normalizeCountry(body.title)])
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        countryId: existing.id,
        countryTitle: body.title,
      };
    }

    const baseSlug = generateSlug(body.title);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    const insertData = {
      title: body.title,
      slug: uniqueSlug,
    };

    const [countryId] = await knex('countries').insert(insertData);

    return {
      successful: true,
      countryId,
      countryTitle: body.title,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getCountries,
  createCountry,
};
