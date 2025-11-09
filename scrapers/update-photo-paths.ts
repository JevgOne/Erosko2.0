// Update photo URLs from /photos/ to /uploads/profiles/
import { PrismaClient } from '../node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating photo URLs...\n');

  // Update all photos from /photos/ to /uploads/profiles/
  const result = await prisma.$executeRaw`
    UPDATE Photo
    SET url = REPLACE(url, '/photos/', '/uploads/profiles/')
    WHERE url LIKE '/photos/%'
  `;

  console.log(`✅ Updated ${result} photo URLs`);
  console.log('   /photos/ → /uploads/profiles/\n');

  // Verify
  const samplePhotos = await prisma.photo.findMany({
    where: {
      url: {
        startsWith: '/uploads/profiles/'
      }
    },
    take: 5,
    select: {
      url: true,
      profile: {
        select: {
          slug: true
        }
      }
    }
  });

  console.log('📸 Sample updated URLs:');
  samplePhotos.forEach(p => {
    console.log(`   ${p.profile.slug}: ${p.url}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
