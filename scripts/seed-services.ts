import prisma from '../lib/prisma';
import { ServiceCategory } from '@prisma/client';

async function seedServices() {
  console.log('🌱 Seeding services...\n');

  // PRAKTIKY - Pro holky na sex
  const praktiky = [
    { name: 'Klasický sex', icon: 'Heart', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Orální sex (aktivní)', icon: 'Lips', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Orální sex (pasivní)', icon: 'Lips', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Anální sex', icon: 'Circle', category: 'PRAKTIKY' as ServiceCategory },
    { name: '69', icon: 'Infinity', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Squirting', icon: 'Droplet', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Francouzský polibek', icon: 'Kiss', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Girlfriend Experience (GFE)', icon: 'HeartHandshake', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Striptýz', icon: 'Sparkles', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Lesbické hry', icon: 'Users', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Sex ve dvojici', icon: 'Users2', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Přirozený sex', icon: 'ShieldOff', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Sexuální hračky', icon: 'Zap', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Oblečení v latexu', icon: 'Shirt', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Role-play', icon: 'Drama', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Prstování', icon: 'Hand', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'CIM (Cum in Mouth)', icon: 'Droplets', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'COF (Cum on Face)', icon: 'Droplets', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Footjob', icon: 'Footprints', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Handjob', icon: 'Hand', category: 'PRAKTIKY' as ServiceCategory },
    { name: 'Dobré mrdy', icon: 'Sparkles', category: 'PRAKTIKY' as ServiceCategory },
  ];

  // DRUHY MASÁŽÍ - Pro erotické masérky
  const druhyMasazi = [
    { name: 'Tantra masáž', icon: 'Wind', category: 'DRUHY_MASAZI' as ServiceCategory },
    { name: 'Erotická masáž', icon: 'Hand', category: 'DRUHY_MASAZI' as ServiceCategory },
    { name: 'Nuru masáž', icon: 'Droplets', category: 'DRUHY_MASAZI' as ServiceCategory },
    { name: 'Thajská masáž', icon: 'Palmtree', category: 'DRUHY_MASAZI' as ServiceCategory },
    { name: 'Masáž prostaty', icon: 'Target', category: 'DRUHY_MASAZI' as ServiceCategory },
    { name: 'Body to body', icon: 'Users', category: 'DRUHY_MASAZI' as ServiceCategory },
    { name: 'Masáž 4 rukami', icon: 'Hands', category: 'DRUHY_MASAZI' as ServiceCategory },
    { name: 'Lingam masáž', icon: 'Wand', category: 'DRUHY_MASAZI' as ServiceCategory },
    { name: 'Královská masáž', icon: 'Crown', category: 'DRUHY_MASAZI' as ServiceCategory },
    { name: 'Relaxační masáž', icon: 'Sparkles', category: 'DRUHY_MASAZI' as ServiceCategory },
  ];

  // EXTRA SLUŽBY - Pro masérky (doplňkové služby)
  const extraSluzby = [
    { name: 'Happy end', icon: 'Smile', category: 'EXTRA_SLUZBY' as ServiceCategory },
    { name: 'Orální sex', icon: 'Lips', category: 'EXTRA_SLUZBY' as ServiceCategory },
    { name: 'Klasický sex', icon: 'Heart', category: 'EXTRA_SLUZBY' as ServiceCategory },
    { name: 'Sprcha společně', icon: 'Droplets', category: 'EXTRA_SLUZBY' as ServiceCategory },
    { name: 'Striptýz', icon: 'Sparkles', category: 'EXTRA_SLUZBY' as ServiceCategory },
  ];

  // BDSM PRAKTIKY - Pro dominy
  const bdsmPraktiky = [
    { name: 'Bondage', icon: 'Link', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Spanking', icon: 'Hand', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Wax play', icon: 'Flame', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Footworship', icon: 'Footprints', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Femdom', icon: 'Crown', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Strap-on', icon: 'Zap', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'CBT (Cock & Ball Torture)', icon: 'Zap', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Trampling', icon: 'Footprints', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Nipple play', icon: 'Circle', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Electro stimulation', icon: 'Zap', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Facesitting', icon: 'Circle', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Sissy training', icon: 'Shirt', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Humiliation', icon: 'Frown', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Golden shower', icon: 'Droplets', category: 'BDSM_PRAKTIKY' as ServiceCategory },
    { name: 'Breathplay', icon: 'Wind', category: 'BDSM_PRAKTIKY' as ServiceCategory },
  ];

  const allServices = [...praktiky, ...druhyMasazi, ...extraSluzby, ...bdsmPraktiky];

  let created = 0;
  let skipped = 0;

  for (const service of allServices) {
    try {
      await prisma.service.upsert({
        where: { name: service.name },
        update: {},
        create: service,
      });
      created++;
      console.log(`✅ ${service.name} (${service.category})`);
    } catch (error) {
      skipped++;
      console.log(`⏭️  ${service.name} - already exists`);
    }
  }

  console.log(`\n✅ Created ${created} services, skipped ${skipped}`);
  await prisma.$disconnect();
}

seedServices();
