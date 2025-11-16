// Update demo profile photos
import prisma from '../lib/prisma';

async function updateDemoPhotos() {
  console.log('🖼️  Updating demo profile photos...\n');

  try {
    // Update Michaela's photo
    const michaela = await prisma.profile.findUnique({
      where: { slug: 'michaela-praha-escort' },
      include: { photos: true },
    });

    if (michaela) {
      if (michaela.photos.length > 0) {
        await prisma.photo.update({
          where: { id: michaela.photos[0].id },
          data: {
            url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            alt: 'Michaela - Escort Praha',
          },
        });
      } else {
        await prisma.photo.create({
          data: {
            profileId: michaela.id,
            url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            alt: 'Michaela - Escort Praha',
            order: 0,
            isMain: true,
          },
        });
      }
      console.log('✅ Updated: Michaela');
    }

    // Update Tereza's photo
    const tereza = await prisma.profile.findUnique({
      where: { slug: 'tereza-brno-massage' },
      include: { photos: true },
    });

    if (tereza) {
      if (tereza.photos.length > 0) {
        await prisma.photo.update({
          where: { id: tereza.photos[0].id },
          data: {
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            alt: 'Tereza - Masérka Brno',
          },
        });
      } else {
        await prisma.photo.create({
          data: {
            profileId: tereza.id,
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            alt: 'Tereza - Masérka Brno',
            order: 0,
            isMain: true,
          },
        });
      }
      console.log('✅ Updated: Tereza');
    }

    // Update Karolína's photo
    const karolina = await prisma.profile.findUnique({
      where: { slug: 'mistress-karolina-praha-bdsm' },
      include: { photos: true },
    });

    if (karolina) {
      if (karolina.photos.length > 0) {
        await prisma.photo.update({
          where: { id: karolina.photos[0].id },
          data: {
            url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
            alt: 'Mistress Karolína - BDSM Praha',
          },
        });
      } else {
        await prisma.photo.create({
          data: {
            profileId: karolina.id,
            url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
            alt: 'Mistress Karolína - BDSM Praha',
            order: 0,
            isMain: true,
          },
        });
      }
      console.log('✅ Updated: Mistress Karolína');
    }

    // Update Anička's photo
    const anicka = await prisma.profile.findUnique({
      where: { slug: 'anicka-online-webcam' },
      include: { photos: true },
    });

    if (anicka) {
      if (anicka.photos.length > 0) {
        await prisma.photo.update({
          where: { id: anicka.photos[0].id },
          data: {
            url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
            alt: 'Anička - Online služby',
          },
        });
      } else {
        await prisma.photo.create({
          data: {
            profileId: anicka.id,
            url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
            alt: 'Anička - Online služby',
            order: 0,
            isMain: true,
          },
        });
      }
      console.log('✅ Updated: Anička');
    }

    // Update Lucie's photo
    const lucie = await prisma.profile.findUnique({
      where: { slug: 'lucie-salon-paradise-ostrava' },
      include: { photos: true },
    });

    if (lucie) {
      if (lucie.photos.length > 0) {
        await prisma.photo.update({
          where: { id: lucie.photos[0].id },
          data: {
            url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
            alt: 'Lucie - Salon Paradise Ostrava',
          },
        });
      } else {
        await prisma.photo.create({
          data: {
            profileId: lucie.id,
            url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
            alt: 'Lucie - Salon Paradise Ostrava',
            order: 0,
            isMain: true,
          },
        });
      }
      console.log('✅ Updated: Lucie');
    }

    console.log('\n🎉 All demo photos updated successfully!');

  } catch (error) {
    console.error('❌ Error updating demo photos:', error);
    throw error;
  }
}

updateDemoPhotos()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
