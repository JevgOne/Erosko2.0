// Download photos from dobryprivat.cz and upload to Firebase Storage
// Handles: downloading images, uploading to Firebase, updating database URLs

import { PrismaClient } from '../node_modules/@prisma/client/index.js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import axios from 'axios';
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT ||
  require('fs').readFileSync(join(__dirname, '../firebase-service-account.json'), 'utf-8')
);

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'erosko-cz.firebasestorage.app'
});

const bucket = getStorage().bucket();
const TEMP_DIR = join(__dirname, 'temp-photos');
const BATCH_SIZE = 10; // Process 10 profiles at a time
const MAX_CONCURRENT_DOWNLOADS = 5; // 5 parallel downloads

// Ensure temp directory exists
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

interface PhotoRecord {
  id: string;
  url: string;
  profileId: string;
  order: number;
  isMain: boolean;
}

async function downloadImage(url: string, tempPath: string): Promise<void> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const writer = createWriteStream(tempPath);
    await pipeline(response.data, writer);
  } catch (error: any) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

async function uploadToFirebase(
  localPath: string,
  profileSlug: string,
  photoIndex: number
): Promise<string> {
  try {
    // Generate unique filename: profiles/{slug}/photo-{index}-{timestamp}.jpg
    const timestamp = Date.now();
    const extension = localPath.split('.').pop() || 'jpg';
    const firebasePath = `profiles/${profileSlug}/photo-${photoIndex}-${timestamp}.${extension}`;

    // Upload to Firebase Storage
    await bucket.upload(localPath, {
      destination: firebasePath,
      metadata: {
        contentType: `image/${extension}`,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    // Make file publicly accessible
    const file = bucket.file(firebasePath);
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebasePath}`;
    return publicUrl;
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function processPhoto(
  photo: PhotoRecord,
  profileSlug: string
): Promise<{ photoId: string; newUrl: string | null; error: string | null }> {
  const tempPath = join(TEMP_DIR, `${photo.id}.jpg`);

  try {
    // Skip if already Firebase URL
    if (photo.url.includes('firebasestorage.app') || photo.url.includes('storage.googleapis.com')) {
      console.log(`  ⏭️  Already Firebase: ${photo.id}`);
      return { photoId: photo.id, newUrl: null, error: null };
    }

    // Download image
    await downloadImage(photo.url, tempPath);

    // Upload to Firebase
    const firebaseUrl = await uploadToFirebase(tempPath, profileSlug, photo.order);

    // Update database
    await prisma.photo.update({
      where: { id: photo.id },
      data: { url: firebaseUrl }
    });

    // Cleanup temp file
    if (existsSync(tempPath)) {
      unlinkSync(tempPath);
    }

    console.log(`  ✅ ${photo.id} → Firebase`);
    return { photoId: photo.id, newUrl: firebaseUrl, error: null };

  } catch (error: any) {
    console.error(`  ❌ ${photo.id}: ${error.message}`);

    // Cleanup temp file on error
    if (existsSync(tempPath)) {
      unlinkSync(tempPath);
    }

    return { photoId: photo.id, newUrl: null, error: error.message };
  }
}

async function processProfile(profileId: string, profileSlug: string) {
  try {
    // Get all photos for this profile
    const photos = await prisma.photo.findMany({
      where: { profileId },
      orderBy: { order: 'asc' }
    });

    if (photos.length === 0) {
      console.log(`  ⏭️  No photos`);
      return { success: 0, skipped: 0, failed: 0 };
    }

    let success = 0;
    let skipped = 0;
    let failed = 0;

    // Process photos in batches
    for (let i = 0; i < photos.length; i += MAX_CONCURRENT_DOWNLOADS) {
      const batch = photos.slice(i, i + MAX_CONCURRENT_DOWNLOADS);
      const results = await Promise.all(
        batch.map(photo => processPhoto(photo, profileSlug))
      );

      results.forEach(result => {
        if (result.error) failed++;
        else if (result.newUrl === null) skipped++;
        else success++;
      });
    }

    return { success, skipped, failed };

  } catch (error) {
    console.error(`  ❌ Profile processing failed:`, error);
    return { success: 0, skipped: 0, failed: 0 };
  }
}

async function main() {
  console.log('🚀 DOWNLOADING AND UPLOADING PHOTOS\n');

  // Get all profiles with external photo URLs (dobryprivat.cz)
  const profiles = await prisma.profile.findMany({
    where: {
      photos: {
        some: {
          url: {
            contains: 'dobryprivat.cz'
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { photos: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`📊 Found ${profiles.length} profiles with external photos\n`);

  let totalSuccess = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let processedProfiles = 0;

  // Process in batches
  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(profiles.length / BATCH_SIZE);

    console.log(`\n📦 Batch ${batchNum}/${totalBatches}: Processing ${batch.length} profiles...`);

    for (const profile of batch) {
      console.log(`\n${profile.name} (${profile._count.photos} photos):`);
      const result = await processProfile(profile.id, profile.slug);

      totalSuccess += result.success;
      totalSkipped += result.skipped;
      totalFailed += result.failed;
      processedProfiles++;
    }

    console.log(`\n💾 Batch ${batchNum} completed (${Math.min(i + BATCH_SIZE, profiles.length)}/${profiles.length} profiles)`);

    // Small delay between batches
    if (i + BATCH_SIZE < profiles.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Final stats
  const totalPhotos = totalSuccess + totalSkipped + totalFailed;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ PHOTO UPLOAD COMPLETED!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Stats:`);
  console.log(`  - Processed profiles: ${processedProfiles}`);
  console.log(`  - Total photos: ${totalPhotos}`);
  console.log(`  - ✅ Uploaded to Firebase: ${totalSuccess}`);
  console.log(`  - ⏭️  Already Firebase: ${totalSkipped}`);
  console.log(`  - ❌ Failed: ${totalFailed}`);
  console.log(`\n🔥 All photos now stored in Firebase Storage!`);
  console.log(`${'='.repeat(60)}`);

  // Cleanup temp directory
  if (existsSync(TEMP_DIR)) {
    const files = require('fs').readdirSync(TEMP_DIR);
    files.forEach((file: string) => {
      unlinkSync(join(TEMP_DIR, file));
    });
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('💥 Photo upload failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
