/* eslint-disable no-restricted-syntax */
require('dotenv').config();
const knex = require('../../../../../config/db');

async function mergeCityDuplicates() {
  try {
    // 1️⃣ Find all cities with "-1" in slug
    const duplicates = await knex('cities')
      .where('slug', 'like', '%-2%')
      .select('*');

    console.log(`Found ${duplicates.length} duplicate city slugs.`);

    for (const dup of duplicates) {
      // original slug without -1
      const originalSlug = dup.slug.replace(/-\d+$/, '');

      // find original city in the same country
      const originalCity = await knex('cities')
        .where('slug', originalSlug)
        .andWhere('country_id', dup.country_id)
        .first();

      if (!originalCity) {
        console.log(
          `Original city not found for duplicate slug ${dup.slug}, skipping`,
        );
        continue;
      }

      // 2️⃣ Update viator_id if missing
      const updates = {};
      // 2️⃣ Update viator_id if missing AND not used in another city
      const existingViator = await knex('cities')
        .where('viator_id', dup.viator_id)
        .andWhereNot('id', originalCity.id)
        .first();

      if (!originalCity.viator_id && dup.viator_id && !existingViator) {
        updates.viator_id = dup.viator_id;
      }

      // 3️⃣ Update area_id if original has none
      // Check if updating area_id would cause a conflict
      if (!originalCity.area_id && dup.area_id) {
        const conflict = await knex('cities')
          .where({
            country_id: originalCity.country_id,
            area_id: dup.area_id,
            title: originalCity.title,
          })
          .first();

        if (!conflict) {
          updates.area_id = dup.area_id;
        } else {
          console.log(
            `Skipping area_id update for city ${originalCity.title} → duplicate would occur`,
          );
        }
      }

      if (Object.keys(updates).length > 0) {
        await knex('cities')
          .where('id', originalCity.id)
          .update({ ...updates, updated_at: knex.fn.now() });
        console.log(
          `Updated original city ${originalCity.slug} from duplicate ${dup.slug}:`,
          updates,
        );
      }

      // 4️⃣ Update all products (or other related tables) pointing to the duplicate
      await knex('products')
        .where('city_id', dup.id)
        .update({ city_id: originalCity.id });
      console.log(
        `Updated products from duplicate city ${dup.slug} → ${originalCity.slug}`,
      );

      // 5️⃣ Delete the duplicate row
      await knex('cities').where('id', dup.id).del();
      console.log(`Deleted duplicate city ${dup.slug}`);
    }

    console.log('✅ Merge complete');
  } catch (err) {
    console.error('Error merging city duplicates:', err);
  } finally {
    await knex.destroy();
  }
}

mergeCityDuplicates();
