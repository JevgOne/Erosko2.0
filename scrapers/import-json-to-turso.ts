// Import scraped Eroguide data directly from JSON to Turso
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import * as bcrypt from 'bcryptjs';

const EROGUIDE_JSON = '/Users/zen/Desktop/eroguide-complete.json';
const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://erosko20-jevgone.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3OTM3Nzc2MTYsImlhdCI6MTc2MjI0MTYxNiwiaWQiOiI5MGFkNTVhOC1mMGFhLTRiN2ItOTUxMS03OTNmMjUwM2RiZTMiLCJyaWQiOiI4NzM4NGM0ZC04NmFmLTRiY2ItYTA1Yi0wNDhlYmYzNjc5NjkifQ.wkZTCd5lEu43JGXT-yha08LSaQkez_EuHd-DPJaSAZH25ayspPRkf5GvZPeC5Byeoi5E_Trd0FXUqqxCeLoeDA';

const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function clearDatabase() {
  console.log('🗑️  Clearing Turso database...\n');

  await turso.execute('DELETE FROM Favorite');
  await turso.execute('DELETE FROM ProfileService');
  await turso.execute('DELETE FROM Review');
  await turso.execute('DELETE FROM Photo');
  await turso.execute('DELETE FROM PendingChange');
  await turso.execute('DELETE FROM Profile');
  await turso.execute('DELETE FROM Business');
  await turso.execute('DELETE FROM Service');
  await turso.execute('DELETE FROM VerificationCode');
  await turso.execute('DELETE FROM User');

  console.log('✅ Database cleared\n');
}

async function createAdminUser() {
  console.log('👤 Creating admin user...\n');

  const adminId = 'admin_' + generateId();
  const passwordHash = await bcrypt.hash('admin123', 10);

  await turso.execute({
    sql: `INSERT INTO User (id, phone, email, passwordHash, phoneVerified, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      adminId,
      '+420999999999',
      'admin@erosko.cz',
      passwordHash,
      1,
      'ADMIN',
      new Date().toISOString(),
      new Date().toISOString(),
    ],
  });

  console.log('✅ Admin user created\n');
  return adminId;
}

async function importProfiles(adminId: string) {
  console.log('📋 Importing profiles from JSON...\n');

  const profiles = JSON.parse(readFileSync(EROGUIDE_JSON, 'utf-8'));
  console.log(`Found ${profiles.length} profiles in JSON\n`);

  let imported = 0;
  let skipped = 0;

  for (const profile of profiles) {
    try {
      // Skip invalid profiles
      if (!profile.phone || profile.slug === 'oblibene' || profile.photos.length === 0) {
        skipped++;
        continue;
      }

      const profileId = 'prof_' + generateId();
      const cleanPhone = profile.phone.replace(/\s/g, '');

      // Prepare private contacts
      const privateContacts = JSON.stringify({
        phone: profile.phone,
        email: profile.email || null,
        sourceUrl: profile.sourceUrl,
        sourceSite: 'eroguide.cz',
      });

      // Insert profile
      await turso.execute({
        sql: `INSERT INTO Profile (
          id, name, slug, age, description, phone, email, city, address, location,
          profileType, category, height, weight, bust, hairColor,
          nationality, languages, orientation, tattoos, piercing,
          offersEscort, travels, openingHours, privateContacts,
          approved, verified, isNew, isPopular, isOnline,
          rating, reviewCount, viewCount, createdAt, updatedAt, ownerId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          profileId,
          profile.name,
          profile.slug,
          profile.age || 25,
          profile.description || `Profil ${profile.name} z eroguide.cz`,
          cleanPhone,
          profile.email || null,
          profile.city || 'Praha',
          profile.address || null,
          profile.location || profile.city || 'Praha',
          profile.profileType || 'SOLO',
          profile.category || 'HOLKY_NA_SEX',
          profile.height || null,
          profile.weight || null,
          profile.bust || null,
          profile.hairColor || null,
          profile.nationality || null,
          profile.languages ? JSON.stringify(profile.languages) : null,
          profile.orientation || null,
          profile.tattoos || null,
          profile.piercing || null,
          profile.offersEscort ? 1 : 0,
          profile.travels ? 1 : 0,
          profile.openingHours ? JSON.stringify(profile.openingHours) : null,
          privateContacts,
          1, // approved - AUTO-APPROVE scraped profiles
          1, // verified - AUTO-VERIFY scraped profiles
          1, // isNew
          0, // isPopular
          0, // isOnline
          0.0, // rating
          0, // reviewCount
          0, // viewCount
          new Date().toISOString(),
          new Date().toISOString(),
          adminId,
        ],
      });

      // Insert photos
      for (const photo of profile.photos) {
        const photoId = 'photo_' + generateId();
        await turso.execute({
          sql: `INSERT INTO Photo (id, url, alt, \`order\`, isMain, profileId, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            photoId,
            photo.url,
            photo.alt || profile.name,
            photo.order,
            photo.isMain ? 1 : 0,
            profileId,
            new Date().toISOString(),
          ],
        });
      }

      imported++;
      if (imported % 50 === 0) {
        console.log(`   Progress: ${imported}/${profiles.length} profiles`);
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to import ${profile.name}:`, error.message);
    }
  }

  console.log(`\n✅ Imported ${imported} profiles`);
  console.log(`⏭️  Skipped ${skipped} invalid profiles\n`);

  return imported;
}

async function main() {
  console.log('🚀 IMPORTING EROGUIDE.CZ TO TURSO\n');
  console.log(`📍 Turso: ${TURSO_URL}\n`);
  console.log('='.repeat(60));

  try {
    await clearDatabase();
    const adminId = await createAdminUser();
    const imported = await importProfiles(adminId);

    // Verify
    const profileCountResult = await turso.execute('SELECT COUNT(*) as count FROM Profile');
    const photoCountResult = await turso.execute('SELECT COUNT(*) as count FROM Photo');

    console.log('='.repeat(60));
    console.log('\n✅ IMPORT COMPLETED!\n');
    console.log('📊 Turso Database Stats:');
    console.log(`  - Profiles: ${profileCountResult.rows[0].count}`);
    console.log(`  - Photos: ${photoCountResult.rows[0].count}`);
    console.log('\n🌍 Data is now live on erosko.cz!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n💥 Import failed:', error);
    process.exit(1);
  }
}

main();
