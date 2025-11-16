import prisma from '../lib/prisma';

async function addBusinessPhotos() {
  console.log('📸 Adding photos to demo businesses...\n');

  const businesses = await prisma.business.findMany({
    where: {
      slug: {
        in: ['studio-paradise', 'tantra-massage-prague', 'club-relax-brno', 'swingers-club-fantasy', 'golden-touch-ostrava']
      }
    }
  });

  const photoUrls: Record<string, string[]> = {
    'studio-paradise': [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
    ],
    'tantra-massage-prague': [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
    ],
    'club-relax-brno': [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1519671845924-1fd18db430b8?w=800',
    ],
    'swingers-club-fantasy': [
      'https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    ],
    'golden-touch-ostrava': [
      'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=800',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    ],
  };

  for (const business of businesses) {
    const urls = photoUrls[business.slug];
    if (!urls) continue;

    // Delete existing photos
    await prisma.photo.deleteMany({
      where: { businessId: business.id }
    });

    // Add new photos
    for (let i = 0; i < urls.length; i++) {
      await prisma.photo.create({
        data: {
          url: urls[i],
          alt: `${business.name} - foto ${i + 1}`,
          order: i,
          isMain: i === 0,
          businessId: business.id,
        }
      });
    }

    console.log(`✅ Added ${urls.length} photos to ${business.name}`);
  }

  console.log('\n✅ Done!');
  await prisma.$disconnect();
}

addBusinessPhotos();
