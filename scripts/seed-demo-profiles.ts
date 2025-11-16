// Create demo profiles for each category
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function seedDemoProfiles() {
  console.log('🌱 Creating demo profiles for each category...\n');

  try {
    // Create demo user (owner of all profiles)
    const passwordHash = await bcrypt.hash('demo123', 10);

    const demoUser = await prisma.user.upsert({
      where: { phone: '+420777888999' },
      update: {},
      create: {
        phone: '+420777888999',
        email: 'demo@erosko.cz',
        passwordHash,
        phoneVerified: true,
        role: 'PROVIDER',
      },
    });

    console.log('✅ Demo user created: +420777888999 / demo123\n');

    // 1. HOLKY NA SEX - SOLO Profile
    const profile1 = await prisma.profile.upsert({
      where: { slug: 'michaela-praha-escort' },
      update: {},
      create: {
        name: 'Michaela',
        slug: 'michaela-praha-escort',
        age: 24,
        description: 'Krásná bruneta s dokonalou postavou. Nabízím příjemné chvíle plné vášně a relaxace. Diskrétnost garantována.',
        phone: '+420777111222',
        email: 'michaela@erosko.cz',
        city: 'Praha',
        address: 'Praha 1 - Staré Město',
        location: 'Praha 1',
        profileType: 'SOLO',
        category: 'HOLKY_NA_SEX',

        photos: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
              alt: 'Michaela - Escort Praha',
              order: 0,
              isMain: true,
            },
          ],
        },

        // Physical attributes
        height: 168,
        weight: 55,
        bust: '3',
        hairColor: 'brunette',
        hairLength: 'long',
        breastType: 'natural',
        bodyType: 'slim',
        ageCategory: '18-25',
        pubicHair: 'shaved',

        // Additional
        role: 'switch',
        nationality: 'czech',
        languages: '["Čeština", "English"]',
        orientation: 'hetero',
        tattoos: 'small',
        piercing: 'ears',

        offersEscort: true,
        travels: true,

        openingHours: {
          monday: '10:00-22:00',
          tuesday: '10:00-22:00',
          wednesday: '10:00-22:00',
          thursday: '10:00-22:00',
          friday: '10:00-23:00',
          saturday: '12:00-23:00',
          sunday: '12:00-20:00',
        },

        approved: true,
        verified: true,
        isNew: true,
        isPopular: true,
        isOnline: true,

        rating: 4.8,
        reviewCount: 12,
        viewCount: 156,

        ownerId: demoUser.id,
      },
    });

    console.log('✅ Created: Michaela (HOLKY NA SEX - SOLO)');

    // 2. EROTICKE MASERKY - SOLO Profile
    const profile2 = await prisma.profile.upsert({
      where: { slug: 'tereza-brno-massage' },
      update: {},
      create: {
        name: 'Tereza',
        slug: 'tereza-brno-massage',
        age: 28,
        description: 'Profesionální masérka s dlouholetou praxí. Nabízím relaxační, erotické a tantra masáže v klidném prostředí.',
        phone: '+420777222333',
        email: 'tereza@erosko.cz',
        city: 'Brno',
        address: 'Brno - střed',
        location: 'Brno centrum',
        profileType: 'SOLO',
        category: 'EROTICKE_MASERKY',

        photos: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
              alt: 'Tereza - Masérka Brno',
              order: 0,
              isMain: true,
            },
          ],
        },

        height: 172,
        weight: 58,
        bust: '2',
        hairColor: 'blonde',
        hairLength: 'medium',
        breastType: 'natural',
        bodyType: 'athletic',
        ageCategory: '26-35',
        pubicHair: 'trimmed',

        role: 'passive',
        nationality: 'czech',
        languages: '["Čeština", "Deutsch"]',
        orientation: 'hetero',
        tattoos: 'none',
        piercing: 'none',

        offersEscort: false,
        travels: false,

        openingHours: {
          monday: '09:00-20:00',
          tuesday: '09:00-20:00',
          wednesday: '09:00-20:00',
          thursday: '09:00-20:00',
          friday: '09:00-21:00',
          saturday: '10:00-18:00',
          sunday: 'Zavřeno',
        },

        approved: true,
        verified: true,
        isNew: false,
        isPopular: true,
        isOnline: false,

        rating: 4.9,
        reviewCount: 28,
        viewCount: 342,

        ownerId: demoUser.id,
      },
    });

    console.log('✅ Created: Tereza (EROTICKE MASERKY - SOLO)');

    // 3. DOMINA - SOLO Profile
    const profile3 = await prisma.profile.upsert({
      where: { slug: 'mistress-karolina-praha-bdsm' },
      update: {},
      create: {
        name: 'Mistress Karolína',
        slug: 'mistress-karolina-praha-bdsm',
        age: 32,
        description: 'Zkušená domina s vlastním vybaveným studiem. Nabízím sessions pro začátečníky i pokročilé. Diskrétnost a bezpečnost na prvním místě.',
        phone: '+420777333444',
        email: 'karolina@erosko.cz',
        city: 'Praha',
        address: 'Praha 3 - Žižkov',
        location: 'Praha 3',
        profileType: 'SOLO',
        category: 'DOMINA',

        photos: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
              alt: 'Mistress Karolína - BDSM Praha',
              order: 0,
              isMain: true,
            },
          ],
        },

        height: 175,
        weight: 62,
        bust: '3',
        hairColor: 'black',
        hairLength: 'long',
        breastType: 'natural',
        bodyType: 'athletic',
        ageCategory: '26-35',
        pubicHair: 'shaved',

        role: 'dominant',
        nationality: 'czech',
        languages: '["Čeština", "English"]',
        orientation: 'bi',
        tattoos: 'medium',
        piercing: 'multiple',

        offersEscort: false,
        travels: false,

        openingHours: {
          monday: '14:00-22:00',
          tuesday: '14:00-22:00',
          wednesday: '14:00-22:00',
          thursday: '14:00-22:00',
          friday: '14:00-23:00',
          saturday: '12:00-23:00',
          sunday: 'Po dohodě',
        },

        approved: true,
        verified: true,
        isNew: false,
        isPopular: true,
        isOnline: true,

        rating: 5.0,
        reviewCount: 15,
        viewCount: 234,

        ownerId: demoUser.id,
      },
    });

    console.log('✅ Created: Mistress Karolína (DOMINA - SOLO)');

    // 4. DIGITALNI SLUZBY - SOLO Profile
    const profile4 = await prisma.profile.upsert({
      where: { slug: 'anicka-online-webcam' },
      update: {},
      create: {
        name: 'Anička',
        slug: 'anicka-online-webcam',
        age: 22,
        description: 'Online služby pro tvoje potěšení. Videochat, telefon sex, custom fotky a videa. Online každý den!',
        phone: '+420777444555',
        email: 'anicka@erosko.cz',
        city: 'Online',
        address: 'Online služby',
        location: 'Online - celá ČR',
        profileType: 'SOLO',
        category: 'DIGITALNI_SLUZBY',

        photos: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
              alt: 'Anička - Online služby',
              order: 0,
              isMain: true,
            },
          ],
        },

        height: 165,
        weight: 52,
        bust: '2',
        hairColor: 'red',
        hairLength: 'long',
        breastType: 'natural',
        bodyType: 'slim',
        ageCategory: '18-25',
        pubicHair: 'shaved',

        role: 'switch',
        nationality: 'czech',
        languages: '["Čeština", "English", "Slovenčina"]',
        orientation: 'bi',
        tattoos: 'small',
        piercing: 'ears',

        offersEscort: false,
        travels: false,

        openingHours: {
          monday: '18:00-02:00',
          tuesday: '18:00-02:00',
          wednesday: '18:00-02:00',
          thursday: '18:00-02:00',
          friday: '18:00-03:00',
          saturday: '14:00-03:00',
          sunday: '14:00-00:00',
        },

        approved: true,
        verified: true,
        isNew: true,
        isPopular: true,
        isOnline: true,

        rating: 4.7,
        reviewCount: 45,
        viewCount: 567,

        ownerId: demoUser.id,
      },
    });

    console.log('✅ Created: Anička (DIGITALNI SLUZBY - SOLO)');

    // 5. EROTICKE PODNIKY - Create a business instead
    const business1 = await prisma.business.upsert({
      where: { slug: 'salon-paradise-ostrava' },
      update: {},
      create: {
        name: 'Salon Paradise',
        slug: 'salon-paradise-ostrava',
        description: 'Luxusní erotický salon v centru Ostravy. Nabízíme širokou škálu služeb v diskrétním a stylově zařízeném prostředí. 8 krásných dívek k dispozici.',
        phone: '+420777555666',
        email: 'info@paradise.cz',
        website: 'www.salon-paradise.cz',
        address: 'Ostrava - Moravská Ostrava',
        city: 'Ostrava',
        profileType: 'MASSAGE_SALON',

        equipment: {
          items: ['Jacuzzi', 'Sauna', 'VIP pokoje', 'Bar', 'Parkování', 'Sprcha'],
        },

        openingHours: {
          monday: '10:00-23:00',
          tuesday: '10:00-23:00',
          wednesday: '10:00-23:00',
          thursday: '10:00-23:00',
          friday: '10:00-02:00',
          saturday: '12:00-02:00',
          sunday: '12:00-22:00',
        },

        approved: true,
        verified: true,
        isNew: false,
        isPopular: true,

        rating: 4.6,
        reviewCount: 34,
        viewCount: 892,

        ownerId: demoUser.id,
      },
    });

    console.log('✅ Created: Salon Paradise (EROTICKE PODNIKY - MASSAGE_SALON)');

    // Create a profile associated with the business
    const profile5 = await prisma.profile.upsert({
      where: { slug: 'lucie-salon-paradise-ostrava' },
      update: {},
      create: {
        name: 'Lucie',
        slug: 'lucie-salon-paradise-ostrava',
        age: 26,
        description: 'Pracuji v salonu Paradise. Nabízím relaxační i erotické masáže v luxusním prostředí.',
        phone: '+420777555666',
        city: 'Ostrava',
        address: 'Ostrava - Moravská Ostrava',
        location: 'Salon Paradise',
        profileType: 'MASSAGE_SALON',
        category: 'EROTICKE_PODNIKY',

        photos: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
              alt: 'Lucie - Salon Paradise Ostrava',
              order: 0,
              isMain: true,
            },
          ],
        },

        height: 170,
        weight: 57,
        bust: '3',
        hairColor: 'blonde',
        hairLength: 'long',
        breastType: 'silicone',
        bodyType: 'curvy',
        ageCategory: '26-35',
        pubicHair: 'shaved',

        role: 'passive',
        nationality: 'slovak',
        languages: '["Slovenčina", "Čeština"]',
        orientation: 'hetero',
        tattoos: 'none',
        piercing: 'ears',

        offersEscort: false,
        travels: false,

        approved: true,
        verified: true,
        isNew: false,
        isPopular: false,
        isOnline: true,

        rating: 4.5,
        reviewCount: 8,
        viewCount: 123,

        ownerId: demoUser.id,
        businessId: business1.id,
      },
    });

    console.log('✅ Created: Lucie (Profile in Salon Paradise)');

    // 6. HOLKY NA SEX - SOLO Profile (druhá pro grid 6)
    const profile6 = await prisma.profile.upsert({
      where: { slug: 'nikola-brno-escort' },
      update: {},
      create: {
        name: 'Nikola',
        slug: 'nikola-brno-escort',
        age: 23,
        description: 'Mladá studentka s andělskou tváří. Nabízím příjemné setkání bez stresu. Diskrétní a kultivovaná.',
        phone: '+420777666777',
        email: 'nikola@erosko.cz',
        city: 'Brno',
        address: 'Brno - Veveří',
        location: 'Brno centrum',
        profileType: 'SOLO',
        category: 'HOLKY_NA_SEX',

        photos: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
              alt: 'Nikola - Escort Brno',
              order: 0,
              isMain: true,
            },
          ],
        },

        height: 170,
        weight: 54,
        bust: '2',
        hairColor: 'blonde',
        hairLength: 'long',
        breastType: 'natural',
        bodyType: 'slim',
        ageCategory: '18-25',
        pubicHair: 'shaved',

        role: 'passive',
        nationality: 'czech',
        languages: '["Čeština", "English"]',
        orientation: 'hetero',
        tattoos: 'none',
        piercing: 'ears',

        offersEscort: true,
        travels: true,

        openingHours: {
          monday: '14:00-22:00',
          tuesday: '14:00-22:00',
          wednesday: '14:00-22:00',
          thursday: '14:00-22:00',
          friday: '14:00-00:00',
          saturday: '16:00-00:00',
          sunday: 'Po dohodě',
        },

        approved: true,
        verified: true,
        isNew: true,
        isPopular: false,
        isOnline: true,

        rating: 4.6,
        reviewCount: 7,
        viewCount: 89,

        ownerId: demoUser.id,
      },
    });

    console.log('✅ Created: Nikola (HOLKY NA SEX - SOLO)');

    console.log('\n📊 Summary:');
    console.log('   - 6 demo profiles created');
    console.log('   - 1 demo business created');
    console.log('   - 1 demo user created');
    console.log('\n🎉 Demo data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding demo profiles:', error);
    throw error;
  }
}

seedDemoProfiles()
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
