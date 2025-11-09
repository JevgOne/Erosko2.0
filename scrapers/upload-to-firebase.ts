// Upload photos to Firebase Storage
import { PrismaClient } from '../node_modules/@prisma/client/index.js';
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();
const PHOTOS_DIR = join(__dirname, '../public/photos');
const BATCH_SIZE = 10;
const MAX_CONCURRENT = 5;

// Initialize Firebase Admin
// Service account bude potřeba stáhnout z Firebase Console
// Project Settings > Service Accounts > Generate new private key
const serviceAccountPath = join(__dirname, '../firebase-service-account.json');

if (!existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account not found!');
  console.error('📝 Download it from Firebase Console:');
  console.error('   1. Go to Project Settings > Service Accounts');
  console.error('   2. Click "Generate new private key"');
  console.error(`   3. Save as: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const bucket = admin.storage().bucket();

interface PhotoRecord {
  id: string;
  url: string;
  order: number;
}

async function uploadPhoto(
  photo: PhotoRecord,
  profileSlug: string
): Promise<{ photoId: string; firebaseUrl: string | null; error: string | null }> {
  try {
    // Skip if already Firebase URL
    if (photo.url.includes('firebasestorage.googleapis.com')) {
      console.log(`⏭️  ${photo.id}: Already in Firebase`);
      return { photoId: photo.id, firebaseUrl: null, error: null };
    }

    // Skip if not local file
    if (!photo.url.startsWith('/photos/')) {
      console.log(`⏭️  ${photo.id}: Not local file (${photo.url})`);
      return { photoId: photo.id, firebaseUrl: null, error: null };
    }

    // Get local file path
    const filename = photo.url.replace('/photos/', '');
    const localPath = join(PHOTOS_DIR, filename);

    if (!existsSync(localPath)) {
      console.error(`❌ ${photo.id}: Local file not found: ${localPath}`);
      return { photoId: photo.id, firebaseUrl: null, error: 'File not found' };
    }

    // Upload to Firebase Storage
    const firebasePath = `profiles/${profileSlug}/${filename}`;
    const file = bucket.file(firebasePath);

    await file.save(readFileSync(localPath), {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          profileSlug,
          photoOrder: photo.order.toString(),
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebasePath}`;

    // Update database
    await prisma.photo.update({
      where: { id: photo.id },
      data: { url: publicUrl }
    });

    console.log(`✅ ${photo.id}: Uploaded to ${firebasePath}`);
    return { photoId: photo.id, firebaseUrl: publicUrl, error: null };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${photo.id}: Upload failed: ${errorMsg}`);
    return { photoId: photo.id, firebaseUrl: null, error: errorMsg };
  }
}

async function processBatch(
  profiles: Array<{ id: string; slug: string; photos: PhotoRecord[] }>
): Promise<void> {
  console.log(`\n🔄 Processing batch of ${profiles.length} profiles...`);

  for (const profile of profiles) {
    if (profile.photos.length === 0) {
      console.log(`⏭️  ${profile.slug}: No photos to upload`);
      continue;
    }

    console.log(`\n📸 ${profile.slug}: Uploading ${profile.photos.length} photos...`);

    // Upload photos in parallel (max MAX_CONCURRENT at a time)
    const chunks: PhotoRecord[][] = [];
    for (let i = 0; i < profile.photos.length; i += MAX_CONCURRENT) {
      chunks.push(profile.photos.slice(i, i + MAX_CONCURRENT));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(photo => uploadPhoto(photo, profile.slug))
      );
    }
  }
}

async function main() {
  console.log('🚀 Starting Firebase upload...\n');

  try {
    // Get total count
    const totalProfiles = await prisma.profile.count();
    console.log(`📊 Total profiles in database: ${totalProfiles}`);

    // Count photos to upload
    const photosToUpload = await prisma.photo.count({
      where: {
        url: {
          startsWith: '/photos/'
        }
      }
    });
    console.log(`📸 Photos to upload: ${photosToUpload}\n`);

    if (photosToUpload === 0) {
      console.log('✅ All photos already uploaded!');
      return;
    }

    let processed = 0;

    while (processed < totalProfiles) {
      const profiles = await prisma.profile.findMany({
        skip: processed,
        take: BATCH_SIZE,
        select: {
          id: true,
          slug: true,
          photos: {
            where: {
              url: {
                startsWith: '/photos/'
              }
            },
            select: {
              id: true,
              url: true,
              order: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      });

      if (profiles.length === 0) break;

      await processBatch(profiles);
      processed += profiles.length;

      console.log(`\n✅ Progress: ${processed}/${totalProfiles} profiles processed`);
    }

    // Final stats
    const remainingPhotos = await prisma.photo.count({
      where: {
        url: {
          startsWith: '/photos/'
        }
      }
    });

    console.log('\n✅ Upload complete!');
    console.log(`📊 Remaining local photos: ${remainingPhotos}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
