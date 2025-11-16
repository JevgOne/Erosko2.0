import prisma from '../lib/prisma';
import { ProfileType } from '@prisma/client';

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seedDemoBusinesses() {
  console.log('🏢 Seeding demo businesses...\n');

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.error('❌ No admin user found! Run create-admin.ts first.');
    await prisma.$disconnect();
    return;
  }

  const businesses = [
    {
      name: 'Studio Paradise',
      description: 'Luxusní erotický salon v centru Prahy. Nabízíme diskrétní prostředí a profesionální služby.',
      phone: '+420777111222',
      email: 'info@studioparadise.cz',
      website: 'www.studioparadise.cz',
      address: 'Václavské náměstí 10',
      city: 'Praha',
      profileType: 'PRIVAT' as ProfileType,
      approved: true,
      verified: true,
      isNew: true,
      rating: 4.8,
      reviewCount: 23,
      openingHours: {
        monday: '10:00-22:00',
        tuesday: '10:00-22:00',
        wednesday: '10:00-22:00',
        thursday: '10:00-22:00',
        friday: '10:00-02:00',
        saturday: '12:00-02:00',
        sunday: '12:00-22:00'
      },
      equipment: ['Jacuzzi', 'Sauna', 'Bar', 'VIP místnosti', 'Parkování']
    },
    {
      name: 'Tantra Massage Prague',
      description: 'Profesionální tantra a erotické masáže. Relaxujte v klidném prostředí našeho salonu.',
      phone: '+420777222333',
      email: 'booking@tantramassage.cz',
      website: 'www.tantramassage-prague.cz',
      address: 'Vinohradská 45',
      city: 'Praha',
      profileType: 'MASSAGE_SALON' as ProfileType,
      approved: true,
      verified: true,
      isNew: false,
      rating: 4.9,
      reviewCount: 47,
      openingHours: {
        monday: '09:00-21:00',
        tuesday: '09:00-21:00',
        wednesday: '09:00-21:00',
        thursday: '09:00-21:00',
        friday: '09:00-21:00',
        saturday: '10:00-20:00',
        sunday: 'Zavřeno'
      },
      equipment: ['Sprcha', 'Masážní stůl', 'Aromaterapie', 'Hudba', 'Klimatizace']
    },
    {
      name: 'Club Relax Brno',
      description: 'Nejlepší noční klub v Brně. Krásné dívky, skvělá atmosféra, privátní kabinky.',
      phone: '+420777333444',
      email: 'info@clubrelax.cz',
      website: 'www.clubrelax-brno.cz',
      address: 'Masarykova 15',
      city: 'Brno',
      profileType: 'NIGHT_CLUB' as ProfileType,
      approved: true,
      verified: false,
      isNew: true,
      rating: 4.5,
      reviewCount: 12,
      openingHours: {
        monday: 'Zavřeno',
        tuesday: 'Zavřeno',
        wednesday: '20:00-04:00',
        thursday: '20:00-04:00',
        friday: '20:00-06:00',
        saturday: '20:00-06:00',
        sunday: 'Zavřeno'
      },
      equipment: ['Bar', 'VIP zóna', 'Privátní kabinky', 'Taneční podium', 'Parkování']
    },
    {
      name: 'Swingers Club Fantasy',
      description: 'Exkluzivní swingers klub pro páry a singles. Moderní prostory, diskrétní prostředí.',
      phone: '+420777444555',
      email: 'info@fantasy-club.cz',
      website: 'www.fantasy-swingersclub.cz',
      address: 'Žižkova 88',
      city: 'Praha',
      profileType: 'SWINGERS_CLUB' as ProfileType,
      approved: true,
      verified: true,
      isNew: false,
      rating: 4.7,
      reviewCount: 34,
      openingHours: {
        monday: 'Zavřeno',
        tuesday: 'Zavřeno',
        wednesday: 'Zavřeno',
        thursday: '20:00-02:00',
        friday: '20:00-04:00',
        saturday: '20:00-04:00',
        sunday: 'Zavřeno'
      },
      equipment: ['Jacuzzi', 'Sauna', 'Bar', 'Tematické místnosti', 'Šatna', 'Sprchy']
    },
    {
      name: 'Golden Touch Ostrava',
      description: 'Erotický privát v centru Ostravy. Nabízíme širokou škálu služeb v luxusním prostředí.',
      phone: '+420777555666',
      email: 'contact@goldentouch.cz',
      address: 'Stodolní 24',
      city: 'Ostrava',
      profileType: 'PRIVAT' as ProfileType,
      approved: true,
      verified: false,
      isNew: true,
      rating: 4.3,
      reviewCount: 8,
      openingHours: {
        monday: '12:00-22:00',
        tuesday: '12:00-22:00',
        wednesday: '12:00-22:00',
        thursday: '12:00-22:00',
        friday: '12:00-02:00',
        saturday: '14:00-02:00',
        sunday: '14:00-22:00'
      },
      equipment: ['Sprcha', 'WiFi', 'Parkování', 'Diskrétní vchod']
    }
  ];

  let created = 0;
  let skipped = 0;

  for (const business of businesses) {
    const slug = createSlug(business.name);

    try {
      await prisma.business.upsert({
        where: { slug },
        update: {},
        create: {
          ...business,
          slug,
          ownerId: admin.id,
        }
      });
      created++;
      console.log(`✅ ${business.name} (${business.city})`);
    } catch (error) {
      skipped++;
      console.log(`⏭️  ${business.name} - already exists`);
    }
  }

  console.log(`\n✅ Created ${created} businesses, skipped ${skipped}`);
  await prisma.$disconnect();
}

seedDemoBusinesses();
