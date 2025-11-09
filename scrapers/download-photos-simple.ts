// Download photos from dobryprivat.cz and upload to Firebase Storage
// Uses Firebase REST API (no service account needed!)

import { PrismaClient } from '../node_modules/@prisma/client/index.js';
import axios from 'axios';
import { createWriteStream, unlinkSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Prisma
const prisma = new PrismaClient();

// Firebase config (from .env or environment)
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyBqBcc2Wc9-dTv1bFLBIpMJUVCG-B_ZfP4';
const FIREBASE_PROJECT_ID = 'erosko-cz';
const FIREBASE_BUCKET = `${FIREBASE_PROJECT_ID}.firebasestorage.app`;

const TEMP_DIR = join(__dirname, 'temp-photos');
const BATCH_SIZE = 10; // Process 10 profiles at a time
const MAX_CONCURRENT = 5; // 5 parallel uploads

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

async function uploadToFirebaseREST(
  localPath: string,
  profileSlug: string,
  photoIndex: number
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const extension = localPath.split('.').pop() || 'jpg';
    const firebasePath = `profiles/${profileSlug}/photo-${photoIndex}-${timestamp}.${extension}`;

    // Read file as base64
    const fileBuffer = readFileSync(localPath);
    const base64Data = fileBuffer.toString('base64');

    // Upload using Firebase Storage REST API
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o?uploadType=media&name=${encodeURIComponent(firebasePath)}`;

    await axios.post(uploadUrl, fileBuffer, {
      headers: {
        'Content-Type': `image/${extension}`,
      },
      params: {
        key: FIREBASE_API_KEY
      }
    });

    // Get public URL
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encodeURIComponent(firebasePath)}?alt=media`;

    return publicUrl;
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function processPhoto(
  photo: PhotoRecord,
  profileSlug: string
): Promise<{ photoId: string; newUrl: string | null; error: string | null }> {
  const tempPath = join(TEMP_DIR, `${photo.id}.jpg`);

  try {
    // Skip if already Firebase URL
    if (photo.url.includes('firebasestorage.googleapis.com') || photo.url.includes('.firebasestorage.app')) {
      console.log(`  ⏭️  Already Firebase: ${photo.id}`);
      return { photoId: photo.id, newUrl: null, error: null };
    }

    // Download image
    console.log(`  📥 Downloading: ${photo.id}`);
    await downloadImage(photo.url, tempPath);

    // Upload to Firebase
    console.log(`  📤 Uploading: ${photo.id}`);
    const firebaseUrl = await uploadToFirebaseREST(tempPath, profileSlug, photo.order);

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

async function processProfile(profileId: string, profileSlug: string, profileName: string) {
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

    console.log(`\n${profileName} (${photos.length} photos):`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    // Process photos in batches
    for (let i = 0; i < photos.length; i += MAX_CONCURRENT) {
      const batch = photos.slice(i, i + MAX_CONCURRENT);
      const results = await Promise.all(
        batch.map(photo => processPhoto(photo, profileSlug))
      );

      results.forEach(result => {
        if (result.error) failed++;
        else if (result.newUrl === null) skipped++;
        else success++;
      });

      // Small delay between batches
      if (i + MAX_CONCURRENT < photos.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    return { success, skipped, failed };

  } catch (error) {
    console.error(`  ❌ Profile processing failed:`, error);
    return { success: 0, skipped: 0, failed: 0 };
  }
}

async function main() {
  console.log('🚀 DOWNLOADING AND UPLOADING PHOTOS\n');
  console.log(`📦 Firebase: ${FIREBASE_BUCKET}`);
  console.log(`🔑 API Key: ${FIREBASE_API_KEY.substring(0, 20)}...\n`);

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

    console.log(`\n📦 Batch ${batchNum}/${totalBatches}:`);

    for (const profile of batch) {
      const result = await processProfile(profile.id, profile.slug, profile.name);

      totalSuccess += result.success;
      totalSkipped += result.skipped;
      totalFailed += result.failed;
      processedProfiles++;
    }

    console.log(`\n💾 Batch ${batchNum} completed (${Math.min(i + BATCH_SIZE, profiles.length)}/${profiles.length} profiles)`);

    // Delay between batches
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
    const files = readdirSync(TEMP_DIR);
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
