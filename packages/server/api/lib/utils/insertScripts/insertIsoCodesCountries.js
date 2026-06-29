/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
require('dotenv').config();
const knex = require('../../../../config/db');
const generateSlug = require('../generateSlug');

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

const isoCountries = [
  { title: 'Afghanistan', iso: 'AF' },
  { title: 'Albania', iso: 'AL' },
  { title: 'Algeria', iso: 'DZ' },
  { title: 'American Samoa', iso: 'AS' },
  { title: 'Andorra', iso: 'AD' },
  { title: 'Angola', iso: 'AO' },
  { title: 'Anguilla', iso: 'AI' },
  { title: 'Antigua and Barbuda', iso: 'AG' },
  { title: 'Argentina', iso: 'AR' },
  { title: 'Armenia', iso: 'AM' },
  { title: 'Aruba', iso: 'AW' },
  { title: 'Australia', iso: 'AU' },
  { title: 'Austria', iso: 'AT' },
  { title: 'Azerbaijan', iso: 'AZ' },
  { title: 'Bahamas', iso: 'BS' },
  { title: 'Bahrain', iso: 'BH' },
  { title: 'Bangladesh', iso: 'BD' },
  { title: 'Barbados', iso: 'BB' },
  { title: 'Belarus', iso: 'BY' },
  { title: 'Belgium', iso: 'BE' },
  { title: 'Belize', iso: 'BZ' },
  { title: 'Benin', iso: 'BJ' },
  { title: 'Bermuda', iso: 'BM' },
  { title: 'Bhutan', iso: 'BT' },
  { title: 'Bolivia', iso: 'BO' },
  { title: 'Bonaire', iso: 'BQ' },
  { title: 'Bosnia and Herzegovina', iso: 'BA' },
  { title: 'Botswana', iso: 'BW' },
  { title: 'Brazil', iso: 'BR' },
  { title: 'British Indian Ocean Territory', iso: 'IO' },
  { title: 'Brunei', iso: 'BN' },
  { title: 'Bulgaria', iso: 'BG' },
  { title: 'Burkina Faso', iso: 'BF' },
  { title: 'Burundi', iso: 'BI' },
  { title: 'Cabo Verde', iso: 'CV' },
  { title: 'Cambodia', iso: 'KH' },
  { title: 'Cameroon', iso: 'CM' },
  { title: 'Canada', iso: 'CA' },
  { title: 'Cayman Islands', iso: 'KY' },
  { title: 'Central African Republic', iso: 'CF' },
  { title: 'Chad', iso: 'TD' },
  { title: 'Chile', iso: 'CL' },
  { title: 'China', iso: 'CN' },
  { title: 'Christmas Island', iso: 'CX' },
  { title: 'Cocos (Keeling) Islands', iso: 'CC' },
  { title: 'Colombia', iso: 'CO' },
  { title: 'Comoros', iso: 'KM' },
  { title: 'Congo (Congo-Brazzaville)', iso: 'CG' },
  { title: 'Congo (Democratic Republic)', iso: 'CD' },
  { title: 'Cook Islands', iso: 'CK' },
  { title: 'Costa Rica', iso: 'CR' },
  { title: "Côte d'Ivoire", iso: 'CI' },
  { title: 'Croatia', iso: 'HR' },
  { title: 'Cuba', iso: 'CU' },
  { title: 'Curaçao', iso: 'CW' },
  { title: 'Cyprus', iso: 'CY' },
  { title: 'Czechia', iso: 'CZ' },
  { title: 'Denmark', iso: 'DK' },
  { title: 'Djibouti', iso: 'DJ' },
  { title: 'Dominica', iso: 'DM' },
  { title: 'Dominican Republic', iso: 'DO' },
  { title: 'Ecuador', iso: 'EC' },
  { title: 'Egypt', iso: 'EG' },
  { title: 'El Salvador', iso: 'SV' },
  { title: 'Equatorial Guinea', iso: 'GQ' },
  { title: 'Eritrea', iso: 'ER' },
  { title: 'Estonia', iso: 'EE' },
  { title: 'Eswatini', iso: 'SZ' },
  { title: 'Ethiopia', iso: 'ET' },
  { title: 'Falkland Islands', iso: 'FK' },
  { title: 'Faroe Islands', iso: 'FO' },
  { title: 'Fiji', iso: 'FJ' },
  { title: 'Finland', iso: 'FI' },
  { title: 'France', iso: 'FR' },
  { title: 'French Guiana', iso: 'GF' },
  { title: 'French Polynesia', iso: 'PF' },
  { title: 'French Southern Territories', iso: 'TF' },
  { title: 'Gabon', iso: 'GA' },
  { title: 'Gambia', iso: 'GM' },
  { title: 'Georgia', iso: 'GE' },
  { title: 'Germany', iso: 'DE' },
  { title: 'Ghana', iso: 'GH' },
  { title: 'Gibraltar', iso: 'GI' },
  { title: 'Greece', iso: 'GR' },
  { title: 'Greenland', iso: 'GL' },
  { title: 'Grenada', iso: 'GD' },
  { title: 'Guadeloupe', iso: 'GP' },
  { title: 'Guam', iso: 'GU' },
  { title: 'Guatemala', iso: 'GT' },
  { title: 'Guernsey', iso: 'GG' },
  { title: 'Guinea', iso: 'GN' },
  { title: 'Guinea-Bissau', iso: 'GW' },
  { title: 'Guyana', iso: 'GY' },
  { title: 'Haiti', iso: 'HT' },
  { title: 'Heard Island and McDonald Islands', iso: 'HM' },
  { title: 'Holy See', iso: 'VA' },
  { title: 'Honduras', iso: 'HN' },
  { title: 'Hong Kong', iso: 'HK' },
  { title: 'Hungary', iso: 'HU' },
  { title: 'Iceland', iso: 'IS' },
  { title: 'India', iso: 'IN' },
  { title: 'Indonesia', iso: 'ID' },
  { title: 'Iran', iso: 'IR' },
  { title: 'Iraq', iso: 'IQ' },
  { title: 'Ireland', iso: 'IE' },
  { title: 'Isle of Man', iso: 'IM' },
  { title: 'Israel', iso: 'IL' },
  { title: 'Italy', iso: 'IT' },
  { title: 'Jamaica', iso: 'JM' },
  { title: 'Japan', iso: 'JP' },
  { title: 'Jersey', iso: 'JE' },
  { title: 'Jordan', iso: 'JO' },
  { title: 'Kazakhstan', iso: 'KZ' },
  { title: 'Kenya', iso: 'KE' },
  { title: 'Kiribati', iso: 'KI' },
  { title: 'Kuwait', iso: 'KW' },
  { title: 'Kyrgyzstan', iso: 'KG' },
  { title: 'Laos', iso: 'LA' },
  { title: 'Latvia', iso: 'LV' },
  { title: 'Lebanon', iso: 'LB' },
  { title: 'Lesotho', iso: 'LS' },
  { title: 'Liberia', iso: 'LR' },
  { title: 'Libya', iso: 'LY' },
  { title: 'Liechtenstein', iso: 'LI' },
  { title: 'Lithuania', iso: 'LT' },
  { title: 'Luxembourg', iso: 'LU' },
  { title: 'Macau', iso: 'MO' },
  { title: 'Madagascar', iso: 'MG' },
  { title: 'Malawi', iso: 'MW' },
  { title: 'Malaysia', iso: 'MY' },
  { title: 'Maldives', iso: 'MV' },
  { title: 'Mali', iso: 'ML' },
  { title: 'Malta', iso: 'MT' },
  { title: 'Marshall Islands', iso: 'MH' },
  { title: 'Martinique', iso: 'MQ' },
  { title: 'Mauritania', iso: 'MR' },
  { title: 'Mauritius', iso: 'MU' },
  { title: 'Mayotte', iso: 'YT' },
  { title: 'Mexico', iso: 'MX' },
  { title: 'Micronesia', iso: 'FM' },
  { title: 'Moldova', iso: 'MD' },
  { title: 'Monaco', iso: 'MC' },
  { title: 'Mongolia', iso: 'MN' },
  { title: 'Montenegro', iso: 'ME' },
  { title: 'Montserrat', iso: 'MS' },
  { title: 'Morocco', iso: 'MA' },
  { title: 'Mozambique', iso: 'MZ' },
  { title: 'Myanmar', iso: 'MM' },
  { title: 'Namibia', iso: 'NA' },
  { title: 'Nauru', iso: 'NR' },
  { title: 'Nepal', iso: 'NP' },
  { title: 'Netherlands', iso: 'NL' },
  { title: 'New Caledonia', iso: 'NC' },
  { title: 'New Zealand', iso: 'NZ' },
  { title: 'Nicaragua', iso: 'NI' },
  { title: 'Niger', iso: 'NE' },
  { title: 'Nigeria', iso: 'NG' },
  { title: 'Niue', iso: 'NU' },
  { title: 'Norfolk Island', iso: 'NF' },
  { title: 'North Korea', iso: 'KP' },
  { title: 'North Macedonia', iso: 'MK' },
  { title: 'Northern Mariana Islands', iso: 'MP' },
  { title: 'Norway', iso: 'NO' },
  { title: 'Oman', iso: 'OM' },
  { title: 'Pakistan', iso: 'PK' },
  { title: 'Palau', iso: 'PW' },
  { title: 'Palestine', iso: 'PS' },
  { title: 'Panama', iso: 'PA' },
  { title: 'Papua New Guinea', iso: 'PG' },
  { title: 'Paraguay', iso: 'PY' },
  { title: 'Peru', iso: 'PE' },
  { title: 'Philippines', iso: 'PH' },
  { title: 'Pitcairn Islands', iso: 'PN' },
  { title: 'Poland', iso: 'PL' },
  { title: 'Portugal', iso: 'PT' },
  { title: 'Puerto Rico', iso: 'PR' },
  { title: 'Qatar', iso: 'QA' },
  { title: 'Réunion', iso: 'RE' },
  { title: 'Romania', iso: 'RO' },
  { title: 'Russia', iso: 'RU' },
  { title: 'Rwanda', iso: 'RW' },
  { title: 'Saint Barthélemy', iso: 'BL' },
  { title: 'Saint Helena', iso: 'SH' },
  { title: 'Saint Kitts and Nevis', iso: 'KN' },
  { title: 'Saint Lucia', iso: 'LC' },
  { title: 'Saint Martin', iso: 'MF' },
  { title: 'Saint Pierre and Miquelon', iso: 'PM' },
  { title: 'Saint Vincent and the Grenadines', iso: 'VC' },
  { title: 'Samoa', iso: 'WS' },
  { title: 'San Marino', iso: 'SM' },
  { title: 'Sao Tome and Principe', iso: 'ST' },
  { title: 'Saudi Arabia', iso: 'SA' },
  { title: 'Senegal', iso: 'SN' },
  { title: 'Serbia', iso: 'RS' },
  { title: 'Seychelles', iso: 'SC' },
  { title: 'Sierra Leone', iso: 'SL' },
  { title: 'Singapore', iso: 'SG' },
  { title: 'Sint Maarten', iso: 'SX' },
  { title: 'Slovakia', iso: 'SK' },
  { title: 'Slovenia', iso: 'SI' },
  { title: 'Solomon Islands', iso: 'SB' },
  { title: 'Somalia', iso: 'SO' },
  { title: 'South Africa', iso: 'ZA' },
  { title: 'South Georgia and the South Sandwich Islands', iso: 'GS' },
  { title: 'South Korea', iso: 'KR' },
  { title: 'South Sudan', iso: 'SS' },
  { title: 'Spain', iso: 'ES' },
  { title: 'Sri Lanka', iso: 'LK' },
  { title: 'Sudan', iso: 'SD' },
  { title: 'Suriname', iso: 'SR' },
  { title: 'Svalbard and Jan Mayen', iso: 'SJ' },
  { title: 'Sweden', iso: 'SE' },
  { title: 'Switzerland', iso: 'CH' },
  { title: 'Syria', iso: 'SY' },
  { title: 'Taiwan', iso: 'TW' },
  { title: 'Tajikistan', iso: 'TJ' },
  { title: 'Tanzania', iso: 'TZ' },
  { title: 'Thailand', iso: 'TH' },
  { title: 'Timor-Leste', iso: 'TL' },
  { title: 'Togo', iso: 'TG' },
  { title: 'Tokelau', iso: 'TK' },
  { title: 'Tonga', iso: 'TO' },
  { title: 'Trinidad and Tobago', iso: 'TT' },
  { title: 'Tunisia', iso: 'TN' },
  { title: 'Turkey', iso: 'TR' },
  { title: 'Turkmenistan', iso: 'TM' },
  { title: 'Tuvalu', iso: 'TV' },
  { title: 'Uganda', iso: 'UG' },
  { title: 'Ukraine', iso: 'UA' },
  { title: 'United Arab Emirates', iso: 'AE' },
  { title: 'United Kingdom', iso: 'GB' },
  { title: 'United States', iso: 'US' },
  { title: 'Uruguay', iso: 'UY' },
  { title: 'Uzbekistan', iso: 'UZ' },
  { title: 'Vanuatu', iso: 'VU' },
  { title: 'Venezuela', iso: 'VE' },
  { title: 'Vietnam', iso: 'VN' },
  { title: 'Wallis and Futuna', iso: 'WF' },
  { title: 'Western Sahara', iso: 'EH' },
  { title: 'Yemen', iso: 'YE' },
  { title: 'Zambia', iso: 'ZM' },
  { title: 'Zimbabwe', iso: 'ZW' },
];

function normalize(title) {
  if (!title) return title;

  return title
    .replace(/^The /i, '')
    .split(',')[0]
    .replace('Britain', 'United Kingdom')
    .replace('Kyrgyz Republic', 'Kyrgyzstan')
    .replace('Czech Republic', 'Czechia')
    .replace('The Netherlands', 'Netherlands')
    .trim();
}

async function syncCountries() {
  try {
    console.log('Syncing countries...');

    const existing = await knex('countries').select('*');

    const existingNormalized = new Set(existing.map((c) => normalize(c.title)));

    // update iso codes
    for (const row of existing) {
      const normalized = normalize(row.title);
      const match = isoCountries.find((c) => c.title === normalized);

      if (!match) continue;

      const iso = match.iso;
      console.log('iso', iso);

      // check if iso already exists on another row
      const existingIso = await knex('countries')
        .where({ iso_code: iso })
        .andWhereNot({ id: row.id })
        .first();

      if (existingIso) {
        console.log(
          `Skipping ${row.title} → ${iso} (already used by id ${existingIso.id})`,
        );
        continue;
      }

      await knex('countries').where({ id: row.id }).update({ iso_code: iso });

      console.log(`Updated ${row.title} → ${iso}`);
    }

    // insert missing countries
    for (const country of isoCountries) {
      if (!existingNormalized.has(country.title)) {
        const baseSlug = generateSlug(country.title);
        const uniqueSlug = await ensureUniqueSlug(baseSlug);
        await knex('countries').insert({
          title: country.title,
          iso_code: country.iso,
          slug: uniqueSlug,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        });

        console.log(`Inserted ${country.title}`);
      }
    }

    console.log('Done ✅');
  } catch (err) {
    console.error(err);
  } finally {
    await knex.destroy();
  }
}

syncCountries();
