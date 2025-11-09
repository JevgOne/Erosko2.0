// Upload photos to Firebase Storage using OAuth token (no service account needed)
import { PrismaClient } from '../node_modules/@prisma/client/index.js';
import axios from 'axios';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();
const PHOTOS_DIR = join(__dirname, '../public/photos');
const BATCH_SIZE = 10;
const MAX_CONCURRENT = 5;

// Read OAuth token from Firebase CLI config
const firebaseConfig = JSON.parse(
  readFileSync('/Users/Radim/.config/configstore/firebase-tools.json', 'utf-8')
);

const ACCESS_TOKEN = firebaseConfig.tokens.access_token;
const PROJECT_ID = 'erosko-cz';
const STORAGE_BUCKET = `${PROJECT_ID}.appspot.com`;

if (!ACCESS_TOKEN) {
  console.error('❌ No OAuth token found in Firebase CLI config!');
  process.exit(1);
}

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
    if (photo.url.includes('firebasestorage.googleapis.com') || photo.url.includes('storage.googleapis.com')) {
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

    // Read file
    const fileBuffer = readFileSync(localPath);
    const extension = filename.split('.').pop() || 'jpg';

    // Firebase Storage path
    const firebasePath = `profiles/${profileSlug}/${filename}`;

    // Upload using Storage API
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodeURIComponent(firebasePath)}`;

    const response = await axios.post(uploadUrl, fileBuffer, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': `image/${extension}`,
      },
      timeout: 30000
    });

    // Make file publicly accessible
    const makePublicUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(firebasePath)}`;

    await axios.patch(makePublicUrl, {
      metadata: {
        cacheControl: 'public, max-age=31536000',
      }
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${STORAGE_BUCKET}/${firebasePath}`;

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
    if (axios.isAxiosError(error) && error.response) {
      console.error(`   Response:`, error.response.data);
    }
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
  console.log('🚀 Starting Firebase upload with OAuth...\n');

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
