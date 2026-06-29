/* eslint-disable no-restricted-syntax */
require('dotenv').config();
const knex = require('../../../../../config/db');
const generateSlug = require('../../generateSlug');

const apiKey = process.env.VIATOR_API_KEY;

function normalizeCity(title) {
  if (!title) return '';
  return title.toLowerCase().trim();
}

// Helper: ensure slug is unique in a table
async function ensureUniqueSlug(baseSlug, table = 'cities') {
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await slugExists(slug, table)) {
    const suffix = `-${counter}`;
    const maxBaseLength = 200 - suffix.length;
    slug = `${baseSlug.slice(0, maxBaseLength)}${suffix}`;
    counter += 1;
  }

  return slug;
}

// Helper: check if slug exists in a table
async function slugExists(slug, table = 'cities') {
  const existing = await knex(table).where({ slug }).first();
  return !!existing;
}

async function populateCitiesViatorId() {
  try {
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
    const destinations = data.destinations || [];

    // 1️⃣ Build a map for fast lookup by destinationId
    const destinationMap = new Map();
    destinations.forEach((d) => destinationMap.set(d.destinationId, d));

    const viatorCities = destinations.filter((d) => d.type === 'CITY');
    console.log(`Found ${viatorCities.length} cities from Viator`);

    for (const city of viatorCities) {
      const cityName = city.name?.trim();
      const cityViatorId = city.destinationId;

      if (!cityName) continue;

      // 2️⃣ Find parent area and country using hierarchy map
      let areaDest = null;
      let countryDest = null;

      if (city.parentDestinationId) {
        const parent = destinationMap.get(city.parentDestinationId);
        if (parent) {
          if (parent.type === 'COUNTRY') {
            countryDest = parent;
          } else if (parent.type === 'REGION') {
            areaDest = parent;
            if (parent.parentDestinationId) {
              const grandParent = destinationMap.get(
                parent.parentDestinationId,
              );
              if (grandParent?.type === 'COUNTRY') countryDest = grandParent;
            }
          }
        }
      }

      if (!countryDest) {
        console.log(`Skipping city "${cityName}" → no country found`);
        continue;
      }

      // 3️⃣ Lookup country in DB
      const country = await knex('countries')
        .where('viator_id', countryDest.destinationId)
        .first();

      if (!country) {
        console.log(`Skipping city "${cityName}" → country not in DB`);
        continue;
      }

      // 4️⃣ Lookup area in DB if exists
      let areaId = null;
      if (areaDest) {
        const area = await knex('areas')
          .where('viator_id', areaDest.destinationId)
          .andWhere('country_id', country.id)
          .first();
        if (area) areaId = area.id;
      }

      // 5️⃣ Check if city exists
      const existingCity = await knex('cities')
        .whereRaw('LOWER(title) = ?', [normalizeCity(cityName)])
        .andWhere('country_id', country.id)
        .first();

      if (existingCity) {
        if (!existingCity.viator_id) {
          await knex('cities')
            .where('id', existingCity.id)
            .update({ viator_id: cityViatorId });
          console.log(`City updated: ${cityName} → ${cityViatorId}`);
        }
      } else {
        // Insert new city
        const baseSlug = generateSlug(cityName);
        const uniqueSlug = await ensureUniqueSlug(baseSlug, 'cities');

        await knex('cities').insert({
          title: cityName,
          slug: uniqueSlug,
          country_id: country.id,
          area_id: areaId,
          viator_id: cityViatorId,
          latitude: city.center?.latitude,
          longitude: city.center?.longitude,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        });

        console.log(
          `City inserted: ${cityName} (${country.title}${
            areaId ? ', area ' + areaId : ''
          }) → ${cityViatorId}`,
        );
      }
    }

    console.log('✅ Finished cities sync with areas and countries');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await knex.destroy();
  }
}

populateCitiesViatorId();
