/* eslint-disable no-restricted-syntax */
require('dotenv').config();
const knex = require('../../../../../config/db');
const generateSlug = require('../../generateSlug');

const apiKey = process.env.VIATOR_API_KEY;

function normalizeArea(title) {
  if (!title) return '';
  return title.toLowerCase().trim();
}

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
  const existing = await knex('areas').where({ slug }).first();
  return !!existing;
}

async function populateCountriesViatorId() {
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

    const viatorRegions = destinations.filter((d) => d.type === 'REGION');
    console.log(viatorRegions);

    // =========================
    // 2️⃣ HANDLE AREAS
    // =========================

    for (const region of viatorRegions) {
      const areaName = region.name?.trim();
      const areaViatorId = region.destinationId;
      const parentViatorId = region.parentDestinationId; // country viator_id

      if (!areaName || !parentViatorId) continue;

      // Find country by viator_id
      const country = await knex('countries')
        .where('viator_id', parentViatorId)
        .first();

      if (!country) {
        console.log(
          `Skipping region "${areaName}" → no country match for parent ${parentViatorId}`,
        );
        continue;
      }

      // Try to find area
      const existingArea = await knex('areas')
        .whereRaw('LOWER(title) = ?', [normalizeArea(areaName)])
        .andWhere('country_id', country.id)
        .first();

      if (existingArea) {
        // update viator_id if missing
        if (!existingArea.viator_id) {
          await knex('areas')
            .where('id', existingArea.id)
            .update({ viator_id: areaViatorId });

          console.log(`Area updated: ${areaName} → ${areaViatorId}`);
        }
      } else {
        // INSERT NEW AREA ✅
        const baseSlug = generateSlug(areaName);
        const uniqueSlug = await ensureUniqueSlug(baseSlug);
        await knex('areas').insert({
          title: areaName,
          slug: uniqueSlug,
          country_id: country.id,
          viator_id: areaViatorId,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        });

        console.log(
          `Area inserted: ${areaName} (${country.title}) → ${areaViatorId}`,
        );
      }
    }

    console.log('✅ Finished countries + areas sync');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await knex.destroy();
  }
}

populateCountriesViatorId();
