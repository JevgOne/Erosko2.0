import { PrismaClient, ProfileType, Category, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.profileService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Cleared existing data');

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      phone: '+420000000000',
      email: 'admin@erosko.cz',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
    },
  });

  console.log('👤 Created admin user (admin@erosko.cz / admin123)');

  // Create Services - podle skutečných escort webů

  // ESCORT/SEX SLUŽBY (hlavní kategorie)
  const escortServices = await Promise.all([
    // Základní služby
    prisma.service.create({ data: { name: 'Klasika', description: 'Kategorie: Escort', icon: 'Heart', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Orál', description: 'Kategorie: Escort', icon: 'Smile', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Orál bez', description: 'Kategorie: Escort', icon: 'AlertCircle', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Hluboký orál', description: 'Kategorie: Escort', icon: 'Circle', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Anální sex', description: 'Kategorie: Escort', icon: 'Circle', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: '69', description: 'Kategorie: Escort', icon: 'Infinity', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Líbání', description: 'Kategorie: Escort', icon: 'HeartHandshake', category: 'PRAKTIKY' } }),

    // Speciální služby
    prisma.service.create({ data: { name: 'GFE', description: 'Kategorie: Escort', icon: 'Sparkles', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Escort', description: 'Kategorie: Escort', icon: 'Users', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Doprovod do společnosti', description: 'Kategorie: Escort', icon: 'Users2', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Striptýz', description: 'Kategorie: Escort', icon: 'Music', category: 'PRAKTIKY' } }),

    // Skupinové a speciální
    prisma.service.create({ data: { name: 'Trojka', description: 'Kategorie: Escort', icon: 'Users', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Čtyřka', description: 'Kategorie: Escort', icon: 'Users', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Grupáč', description: 'Kategorie: Escort', icon: 'Users', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Lesbi show', description: 'Kategorie: Escort', icon: 'Users2', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Tvrdý sex', description: 'Kategorie: Escort', icon: 'Zap', category: 'PRAKTIKY' } }),

    // Další praktiky
    prisma.service.create({ data: { name: 'Polykání semene', description: 'Kategorie: Escort', icon: 'Droplet', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Výstřik do pusy', description: 'Kategorie: Escort', icon: 'Droplet', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Fingering', description: 'Kategorie: Escort', icon: 'Hand', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Handjob', description: 'Kategorie: Escort', icon: 'Hand', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Rimming', description: 'Kategorie: Escort', icon: 'Circle', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Lízání análu', description: 'Kategorie: Escort', icon: 'Circle', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Pánský anál', description: 'Kategorie: Escort', icon: 'Circle', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Squirt', description: 'Kategorie: Escort', icon: 'Droplet', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Sex v autě', description: 'Kategorie: Escort', icon: 'Car', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Autoerotika', description: 'Kategorie: Escort', icon: 'Sparkles', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Společnice', description: 'Kategorie: Escort', icon: 'Users', category: 'PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Milencký azyl', description: 'Kategorie: Escort', icon: 'Heart', category: 'PRAKTIKY' } }),
  ]);

  // MASÁŽNÍ SLUŽBY
  const massageServices = await Promise.all([
    prisma.service.create({ data: { name: 'Erotická masáž', description: 'Kategorie: Masáže', icon: 'Sparkles', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Tantrická masáž', description: 'Kategorie: Masáže', icon: 'Flame', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Masáž prostaty', description: 'Kategorie: Masáže', icon: 'Target', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Nuru masáž', description: 'Kategorie: Masáže', icon: 'Droplet', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Body-to-body masáž', description: 'Kategorie: Masáže', icon: 'Users', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Masáž pro páry', description: 'Kategorie: Masáže', icon: 'Heart', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Masáž penisu', description: 'Kategorie: Masáže', icon: 'Hand', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Pussycat masáž', description: 'Kategorie: Masáže', icon: 'Hand', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Mydlová masáž', description: 'Kategorie: Masáže', icon: 'Droplet', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Relaxační masáž', description: 'Kategorie: Masáže', icon: 'Wind', category: 'DRUHY_MASAZI' } }),
    prisma.service.create({ data: { name: 'Klasická masáž', description: 'Kategorie: Masáže', icon: 'Hand', category: 'DRUHY_MASAZI' } }),
  ]);

  // BDSM SLUŽBY
  const bdsmServices = await Promise.all([
    prisma.service.create({ data: { name: 'BDSM', description: 'Kategorie: BDSM', icon: 'Zap', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Dominance', description: 'Kategorie: BDSM', icon: 'Crown', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Domina', description: 'Kategorie: BDSM', icon: 'Crown', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Bondáž', description: 'Kategorie: BDSM', icon: 'Link', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Footjob', description: 'Kategorie: BDSM', icon: 'Footprints', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Fisting', description: 'Kategorie: BDSM', icon: 'Hand', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Facesitting', description: 'Kategorie: BDSM', icon: 'User', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Femdom', description: 'Kategorie: BDSM', icon: 'Crown', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Feminizace', description: 'Kategorie: BDSM', icon: 'Sparkles', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'S/M', description: 'Kategorie: BDSM', icon: 'Zap', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Strap-on', description: 'Kategorie: BDSM', icon: 'Circle', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Připínák', description: 'Kategorie: BDSM', icon: 'Circle', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Piss', description: 'Kategorie: BDSM', icon: 'Droplet', category: 'BDSM_PRAKTIKY' } }),
    prisma.service.create({ data: { name: 'Pissing', description: 'Kategorie: BDSM', icon: 'Droplet', category: 'BDSM_PRAKTIKY' } }),
  ]);

  // EXTRA SLUŽBY PRO MASÉRKY
  const extraServices = await Promise.all([
    // Základní vybavení a služby
    prisma.service.create({ data: { name: 'Sprcha', description: 'Sprcha k dispozici', icon: 'Droplet', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Soukromá sprcha', description: 'Soukromá sprcha', icon: 'Droplet', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Jacuzzi', description: 'Vířivka', icon: 'Waves', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Sauna', description: 'Sauna k dispozici', icon: 'Flame', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Welcome drink', description: 'Uvítací nápoj', icon: 'Wine', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Občerstvení', description: 'Občerstvení zdarma', icon: 'Coffee', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Klimatizace', description: 'Klimatizované prostory', icon: 'Wind', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'WiFi', description: 'Bezplatné WiFi', icon: 'Wifi', category: 'EXTRA_SLUZBY' } }),

    // Prostředí
    prisma.service.create({ data: { name: 'Diskrétní prostředí', description: 'Diskrétní a soukromé', icon: 'EyeOff', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Soukromý vchod', description: 'Diskrétní vstup', icon: 'DoorOpen', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Parkování', description: 'Parkování k dispozici', icon: 'Car', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Soukromé parkování', description: 'Soukromé parkoviště', icon: 'Car', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Bezbariérový přístup', description: 'Přístup pro vozíčkáře', icon: 'Accessibility', category: 'EXTRA_SLUZBY' } }),

    // Platební možnosti
    prisma.service.create({ data: { name: 'Platba kartou', description: 'Přijímáme karty', icon: 'CreditCard', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Hotovost', description: 'Platba v hotovosti', icon: 'Banknote', category: 'EXTRA_SLUZBY' } }),

    // Speciální služby
    prisma.service.create({ data: { name: 'Čtyřruční masáž', description: 'Masáž dvěma masérkami', icon: 'Users', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Párová masáž', description: 'Masáž pro páry', icon: 'Heart', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'VIP místnost', description: 'Luxusní VIP pokoj', icon: 'Crown', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Ručníky zdarma', description: 'Čisté ručníky', icon: 'Shirt', category: 'EXTRA_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Hygienické potřeby', description: 'Kosmetika a hygiena', icon: 'Sparkles', category: 'EXTRA_SLUZBY' } }),
  ]);

  // ONLINE SLUŽBY
  const onlineServices = await Promise.all([
    // Video služby
    prisma.service.create({ data: { name: 'Webka/video', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Webcam show', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Live cam show', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Video call sex', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Custom videa', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Video na míru', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),

    // Telefonní služby
    prisma.service.create({ data: { name: 'Sex po telefonu', description: 'Kategorie: Online', icon: 'Phone', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Phone sex', description: 'Kategorie: Online', icon: 'Phone', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Audio call', description: 'Kategorie: Online', icon: 'Phone', category: 'ONLINE_SLUZBY' } }),

    // Fotografie
    prisma.service.create({ data: { name: 'Custom fotky', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Sexy fotky', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Nahé fotky', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Feet pics', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),

    // Chat a textové služby
    prisma.service.create({ data: { name: 'Sexting', description: 'Kategorie: Online', icon: 'MessageCircle', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Online chat', description: 'Kategorie: Online', icon: 'MessagesSquare', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Dirty talk', description: 'Kategorie: Online', icon: 'MessageCircle', category: 'ONLINE_SLUZBY' } }),

    // Platformy a předplatné
    prisma.service.create({ data: { name: 'OnlyFans', description: 'Kategorie: Online', icon: 'Star', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Premium Snapchat', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Soukromý Instagram', description: 'Kategorie: Online', icon: 'Instagram', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Telegram premium', description: 'Kategorie: Online', icon: 'Send', category: 'ONLINE_SLUZBY' } }),

    // Speciální online služby
    prisma.service.create({ data: { name: 'Dick rating', description: 'Kategorie: Online', icon: 'Star', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Hodnocení penisu', description: 'Kategorie: Online', icon: 'Star', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Virtual girlfriend', description: 'Kategorie: Online', icon: 'Heart', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Virtuální přítelkyně', description: 'Kategorie: Online', icon: 'Heart', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Dominance online', description: 'Kategorie: Online', icon: 'Crown', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'JOI (Jerk Off Instructions)', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'CEI (Cum Eating Instructions)', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),

    // Prodej
    prisma.service.create({ data: { name: 'Použité prádlo', description: 'Kategorie: Online', icon: 'ShoppingBag', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Používané ponožky', description: 'Kategorie: Online', icon: 'ShoppingBag', category: 'ONLINE_SLUZBY' } }),
    prisma.service.create({ data: { name: 'Selling worn items', description: 'Kategorie: Online', icon: 'ShoppingBag', category: 'ONLINE_SLUZBY' } }),
  ]);

  const services = [...escortServices, ...massageServices, ...extraServices, ...bdsmServices, ...onlineServices];

  console.log(`✅ Created ${services.length} services (${escortServices.length} escort, ${massageServices.length} masáže, ${extraServices.length} extra, ${bdsmServices.length} BDSM, ${onlineServices.length} online)`);

  console.log('🎉 Seed completed successfully!');
  console.log('📝 Note: No demo data created. Register users to add businesses and profiles.');
  return; // Don't create demo data

  // Czech cities
  const cities = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'České Budějovice', 'Hradec Králové'];
  const names = ['Nikola', 'Petra', 'Kateřina', 'Veronika', 'Michaela', 'Tereza', 'Lucie', 'Barbora', 'Anna', 'Lenka'];

  // Create Profiles
  const profiles = [];
  for (let i = 0; i < 30; i++) {
    const city = cities[i % cities.length];
    const name = names[i % names.length];
    const categories = [Category.HOLKY_NA_SEX, Category.EROTICKE_MASERKY, Category.DOMINA, Category.DIGITALNI_SLUZBY];
    const category = categories[i % categories.length];
    const profileTypes = [ProfileType.SOLO, ProfileType.PRIVAT];
    const profileType = profileTypes[i % 2];

    const profile = await prisma.profile.create({
      data: {
        name,
        slug: `${name.toLowerCase()}-${city.toLowerCase()}-${i}`,
        age: 20 + (i % 15),
        description: `Profesionální ${category === Category.HOLKY_NA_SEX ? 'escort' : category === Category.EROTICKE_MASERKY ? 'masérka' : category === Category.DOMINA ? 'domina' : 'poskytovatelka online služeb'} v ${city}. Diskrétní a profesionální služby.`,
        phone: `+420 ${700 + i} ${String(i).padStart(3, '0')} ${String(i * 10).padStart(3, '0')}`,
        email: `${name.toLowerCase()}${i}@example.com`,
        city,
        location: `${city}, centrum`,
        profileType,
        category,
        height: 160 + (i % 20),
        weight: 50 + (i % 20),
        bust: ['85B', '90C', '75A', '95D'][i % 4],
        offersEscort: i % 3 === 0,
        travels: i % 2 === 0,
        verified: i % 2 === 0,
        isNew: i < 5,
        isPopular: i % 4 === 0,
        isOnline: i % 3 === 0,
        rating: 3 + Math.random() * 2,
        reviewCount: Math.floor(Math.random() * 50),
        viewCount: Math.floor(Math.random() * 1000),
        ownerId: adminUser.id,
      },
    });

    profiles.push(profile);

    // Add services to profile
    const profileServices = services.slice(0, 3 + (i % 3));
    for (const service of profileServices) {
      await prisma.profileService.create({
        data: {
          profileId: profile.id,
          serviceId: service.id,
        },
      });
    }
  }

  console.log(`✅ Created ${profiles.length} profiles`);

  // Create Businesses
  const businessNames = [
    'Salon Paradise',
    'Privát Venus',
    'Escort Elite',
    'Masáže Relax',
    'Studio Passion',
    'Privát Diamond'
  ];

  for (let i = 0; i < businessNames.length; i++) {
    const city = cities[i % cities.length];
    const name = businessNames[i];
    const profileTypes = [ProfileType.MASSAGE_SALON, ProfileType.PRIVAT, ProfileType.ESCORT_AGENCY];
    const profileType = profileTypes[i % 3];

    const business = await prisma.business.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `${name} nabízí prémiové služby v ${city}. Moderní prostředí, diskrétní přístup a profesionální personál.`,
        phone: `+420 ${600 + i} ${String(i).padStart(3, '0')} ${String(i * 11).padStart(3, '0')}`,
        email: `info@${name.toLowerCase().replace(/\s+/g, '')}.cz`,
        website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.cz`,
        address: `Ulice ${i+1}, ${city}`,
        city,
        profileType,
        verified: i % 2 === 0,
        isNew: i < 2,
        isPopular: i % 3 === 0,
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 100),
        viewCount: Math.floor(Math.random() * 2000),
        ownerId: adminUser.id,
      },
    });

    // Create profiles for each business
    for (let j = 0; j < 3; j++) {
      const profileName = names[(i * 3 + j) % names.length];
      await prisma.profile.create({
        data: {
          name: profileName,
          slug: `${profileName.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}-${j}`,
          age: 21 + (j % 10),
          description: `${profileName} pracuje v ${name}. Profesionální přístup a diskrétnost zaručena.`,
          phone: business.phone,
          email: `${profileName.toLowerCase()}@${name.toLowerCase().replace(/\s+/g, '')}.cz`,
          city,
          location: business.address || city,
          profileType: business.profileType,
          category: Category.HOLKY_NA_SEX,
          height: 165 + (j % 15),
          weight: 52 + (j % 15),
          bust: ['85B', '90C', '75A'][j % 3],
          offersEscort: true,
          travels: j % 2 === 0,
          verified: true,
          isNew: i < 2,
          isPopular: i % 2 === 0,
          isOnline: j === 0,
          rating: 4 + Math.random(),
          reviewCount: Math.floor(Math.random() * 30),
          viewCount: Math.floor(Math.random() * 500),
          ownerId: adminUser.id,
          businessId: business.id,
        },
      });
    }
  }

  console.log(`✅ Created ${businessNames.length} businesses with their profiles`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
