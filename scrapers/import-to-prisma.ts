// Import scraped profiles to Prisma database
// Handles: profiles, photos, private contacts

// @ts-ignore - Using parent project's Prisma client
import { PrismaClient, ProfileType, Category } from '../node_modules/@prisma/client/index.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use parent project's database
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:../prisma/dev.db';
const prisma = new PrismaClient();
const FINAL_JSON = join(__dirname, 'output/dobryprivat-FINAL.json');
const BATCH_SIZE = 50; // Import in batches to avoid memory issues

interface ScrapedProfile {
  name: string;
  slug: string;
  age?: number;
  description?: string;
  phone: string; // Public phone
  email?: string;
  city: string;
  location: string;
  profileType: string;
  category: string;
  photos: Array<{
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
  }>;
  offersEscort: boolean;
  travels: boolean;
  sourceUrl: string;
  private_contacts?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    telegram?: string;
  };
  [key: string]: any;
}

async function getOrCreateAdminUser() {
  console.log('🔑 Getting/creating admin user...');

  // Try to find existing admin
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    // Create admin user for scraped profiles
    const passwordHash = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        phone: '+420999999999', // Dummy phone for scraped profiles owner
        email: 'scraped@erosko.cz',
        passwordHash,
        phoneVerified: true,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Created admin user: ${admin.id}`);
  } else {
    console.log(`✅ Using existing admin: ${admin.id}`);
  }

  return admin;
}

async function importProfile(profile: ScrapedProfile, ownerId: string) {
  try {
    // Check if already exists
    const existing = await prisma.profile.findUnique({
      where: { slug: profile.slug },
    });

    if (existing) {
      console.log(`  ⏭️  Already exists: ${profile.name}`);
      return existing;
    }

    // Map category and profileType to Prisma enums
    const category = profile.category as Category;
    const profileType = profile.profileType as ProfileType;

    // Create profile
    const createdProfile = await prisma.profile.create({
      data: {
        name: profile.name,
        slug: profile.slug,
        age: profile.age || 25, // Default age if missing
        description: profile.description || `Profil ${profile.name} z dobryprivat.cz`,
        phone: profile.phone || '', // Public phone (empty for most)
        email: profile.email || null,
        city: profile.city,
        location: profile.location,
        profileType,
        category,
        offersEscort: profile.offersEscort,
        travels: profile.travels,
        ownerId,
        approved: false, // Needs admin review
        verified: false,
        isNew: true,

        // PRIVATE CONTACTS (admin only)
        privateContacts: profile.private_contacts || null,

        // Create photos
        photos: {
          create: profile.photos.map(photo => ({
            url: photo.url,
            alt: photo.alt || profile.name,
            order: photo.order,
            isMain: photo.isMain,
          })),
        },
      },
      include: {
        photos: true,
      },
    });

    console.log(`  ✅ ${profile.name} (${createdProfile.photos.length} photos)`);
    return createdProfile;
  } catch (error) {
    console.error(`  ❌ Failed to import ${profile.name}:`, error);
    return null;
  }
}

async function importBatch(profiles: ScrapedProfile[], startIndex: number, ownerId: string) {
  const batch = profiles.slice(startIndex, startIndex + BATCH_SIZE);

  console.log(`\n📦 Batch ${Math.floor(startIndex / BATCH_SIZE) + 1}: Importing ${batch.length} profiles...`);

  for (const profile of batch) {
    await importProfile(profile, ownerId);
  }

  console.log(`💾 Batch completed (${Math.min(startIndex + BATCH_SIZE, profiles.length)}/${profiles.length})`);
}

async function main() {
  console.log('🚀 IMPORTING TO PRISMA DATABASE\n');

  // Load scraped data
  console.log(`📂 Loading: ${FINAL_JSON}`);
  const profiles: ScrapedProfile[] = JSON.parse(readFileSync(FINAL_JSON, 'utf-8'));
  console.log(`✅ Loaded ${profiles.length} profiles\n`);

  // Get admin user
  const admin = await getOrCreateAdminUser();

  // Import in batches
  const totalBatches = Math.ceil(profiles.length / BATCH_SIZE);
  console.log(`\n📊 Will import ${totalBatches} batches of ${BATCH_SIZE} profiles each\n`);

  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    await importBatch(profiles, i, admin.id);

    // Small delay between batches
    if (i + BATCH_SIZE < profiles.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Final stats
  const totalProfiles = await prisma.profile.count();
  const totalPhotos = await prisma.photo.count();
  const withPrivateContacts = await prisma.profile.count({
    where: {
      privateContacts: { not: null },
    },
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ IMPORT COMPLETED!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Database Stats:`);
  console.log(`  - Total profiles: ${totalProfiles}`);
  console.log(`  - Total photos: ${totalPhotos}`);
  console.log(`  - With private contacts: ${withPrivateContacts}`);
  console.log(`\n🔒 Private contacts stored in 'privateContacts' JSON field (admin only)`);
  console.log(`📸 Photos stored as external URLs (dobryprivat.cz)`);
  console.log(`\n⏭️  NEXT STEP: Download and upload photos to Firebase Storage`);
  console.log(`${'='.repeat(60)}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('💥 Import failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
