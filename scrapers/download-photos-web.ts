// Download photos using simple file copy (no Firebase for now)
// Saves photos locally, then we can batch upload to Firebase later

import { PrismaClient } from '../node_modules/@prisma/client/index.js';
import axios from 'axios';
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

const PHOTOS_DIR = join(__dirname, '../public/photos');
const BATCH_SIZE = 10;
const MAX_CONCURRENT = 10;

// Ensure photos directory exists
if (!existsSync(PHOTOS_DIR)) {
  mkdirSync(PHOTOS_DIR, { recursive: true });
}

interface PhotoRecord {
  id: string;
  url: string;
  profileId: string;
  order: number;
  isMain: boolean;
}

async function downloadImage(url: string, localPath: string): Promise<void> {
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

    const writer = createWriteStream(localPath);
    await pipeline(response.data, writer);
  } catch (error: any) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

async function processPhoto(
  photo: PhotoRecord,
  profileSlug: string
): Promise<{ photoId: string; localPath: string | null; error: string | null }> {
  try {
    // Skip if already local
    if (photo.url.startsWith('/photos/') || photo.url.startsWith('http://localhost')) {
      console.log(`  ⏭️  Already local: ${photo.id}`);
      return { photoId: photo.id, localPath: null, error: null };
    }

    // Generate local filename
    const extension = photo.url.split('.').pop()?.split('?')[0] || 'jpg';
    const filename = `${profileSlug}-${photo.order}-${Date.now()}.${extension}`;
    const localPath = join(PHOTOS_DIR, filename);
    const publicUrl = `/photos/${filename}`;

    // Download
    await downloadImage(photo.url, localPath);

    // Update database
    await prisma.photo.update({
      where: { id: photo.id },
      data: { url: publicUrl }
    });

    console.log(`  ✅ ${photo.id} → ${filename}`);
    return { photoId: photo.id, localPath, error: null };

  } catch (error: any) {
    console.error(`  ❌ ${photo.id}: ${error.message}`);
    return { photoId: photo.id, localPath: null, error: error.message };
  }
}

async function processProfile(profileId: string, profileSlug: string, profileName: string) {
  try {
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

    // Process in batches
    for (let i = 0; i < photos.length; i += MAX_CONCURRENT) {
      const batch = photos.slice(i, i + MAX_CONCURRENT);
      const results = await Promise.all(
        batch.map(photo => processPhoto(photo, profileSlug))
      );

      results.forEach(result => {
        if (result.error) failed++;
        else if (result.localPath === null) skipped++;
        else success++;
      });
    }

    return { success, skipped, failed };

  } catch (error) {
    console.error(`  ❌ Profile failed:`, error);
    return { success: 0, skipped: 0, failed: 0 };
  }
}

async function main() {
  console.log('🚀 DOWNLOADING PHOTOS TO LOCAL STORAGE\n');
  console.log(`📁 Saving to: ${PHOTOS_DIR}\n`);

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
    }

    console.log(`\n💾 Batch ${batchNum} completed (${Math.min(i + BATCH_SIZE, profiles.length)}/${profiles.length})`);

    if (i + BATCH_SIZE < profiles.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ DOWNLOAD COMPLETED!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Stats:`);
  console.log(`  - ✅ Downloaded: ${totalSuccess}`);
  console.log(`  - ⏭️  Skipped: ${totalSkipped}`);
  console.log(`  - ❌ Failed: ${totalFailed}`);
  console.log(`\n📁 Photos saved to: ${PHOTOS_DIR}`);
  console.log(`🔥 Ready to upload to Firebase Storage!`);
  console.log(`${'='.repeat(60)}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('💥 Download failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
