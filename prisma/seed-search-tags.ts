import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const searchTags = [
  // Podle věku
  { slug: 'studentky-na-sex', label: 'Studentky na sex', description: 'Mladé studentky 18-22 let', category: 'age', order: 1 },
  { slug: 'mladé-holky', label: 'Mladé holky', description: 'Holky do 25 let', category: 'age', order: 2 },
  { slug: 'holky-25-30-let', label: 'Holky 25-30 let', description: 'Zkušené holky v nejlepším věku', category: 'age', order: 3 },
  { slug: 'zralé-ženy', label: 'Zralé ženy', description: 'Ženy 30-40 let', category: 'age', order: 4 },
  { slug: 'milf', label: 'MILF', description: 'Zralé sexy mámy 40+', category: 'age', order: 5 },
  { slug: 'cougar', label: 'Cougar', description: 'Starší ženy preferující mladší muže', category: 'age', order: 6 },

  // Podle barvy vlasů
  { slug: 'blondýnky-na-sex', label: 'Blondýnky na sex', description: 'Krásné blondýnky', category: 'hair', order: 1 },
  { slug: 'brunety-na-sex', label: 'Brunety na sex', description: 'Půvabné brunetky', category: 'hair', order: 2 },
  { slug: 'zrzky-na-sex', label: 'Zrzky na sex', description: 'Vzrušující zrzky', category: 'hair', order: 3 },
  { slug: 'černovlásky', label: 'Černovlásky', description: 'Exotické černovlásky', category: 'hair', order: 4 },

  // Podle vzhledu a těla
  { slug: 'holky-se-silikony', label: 'Holky se silikony', description: 'Holky s umělými prsy', category: 'body', order: 1 },
  { slug: 'přírodní-prsa', label: 'Přírodní prsa', description: 'Holky s přírodními prsy', category: 'body', order: 2 },
  { slug: 'velká-prsa', label: 'Velká prsa', description: 'Holky s velkými prsy', category: 'body', order: 3 },
  { slug: 'malá-prsa', label: 'Malá prsa', description: 'Holky s malými prsy', category: 'body', order: 4 },
  { slug: 'atletické-holky', label: 'Atletické holky', description: 'Sportovní a atletické postavy', category: 'body', order: 5 },
  { slug: 'štíhlé-holky', label: 'Štíhlé holky', description: 'Štíhlé a elegantní', category: 'body', order: 6 },
  { slug: 'bbw', label: 'BBW', description: 'Big Beautiful Women', category: 'body', order: 7 },
  { slug: 'holky-s-tetováním', label: 'Holky s tetováním', description: 'Tetované krásky', category: 'body', order: 8 },
  { slug: 'holky-s-piercingem', label: 'Holky s piercingem', description: 'S piercingem', category: 'body', order: 9 },

  // Podle národnosti
  { slug: 'české-holky', label: 'České holky', description: 'České krásky', category: 'nationality', order: 1 },
  { slug: 'slovenky', label: 'Slovenky', description: 'Slovenské escort', category: 'nationality', order: 2 },
  { slug: 'rusky', label: 'Rusky', description: 'Ruské krásky', category: 'nationality', order: 3 },
  { slug: 'ukrajinky', label: 'Ukrajinky', description: 'Ukrajinské holky', category: 'nationality', order: 4 },
  { slug: 'polky', label: 'Polky', description: 'Polské escort', category: 'nationality', order: 5 },
  { slug: 'rumunky', label: 'Rumunky', description: 'Rumunské holky', category: 'nationality', order: 6 },
  { slug: 'latinas', label: 'Latinas', description: 'Latinsko-americké krásky', category: 'nationality', order: 7 },
  { slug: 'asiatky', label: 'Asiatky', description: 'Asijské krásky', category: 'nationality', order: 8 },
  { slug: 'černošky', label: 'Černošky', description: 'Africké a afroamerické krásky', category: 'nationality', order: 9 },

  // Speciální kategorie
  { slug: 'vip-escort', label: 'VIP Escort', description: 'Prémiové VIP escort služby', category: 'special', order: 1 },
  { slug: 'amatérky', label: 'Amatérky', description: 'Nezkušené amatérské holky', category: 'special', order: 2 },
  { slug: 'pornohvězdy', label: 'Pornohvězdy', description: 'Známé pornohvězdy', category: 'special', order: 3 },
  { slug: 'squirting', label: 'Squirting', description: 'Holky co stříkají', category: 'special', order: 4 },
  { slug: 'bisexuální', label: 'Bisexuální', description: 'Bisexuální holky', category: 'special', order: 5 },
  { slug: 'lesbičky', label: 'Lesbičky', description: 'Lesbické holky', category: 'special', order: 6 },
  { slug: 'trans', label: 'Trans', description: 'Transgender escort', category: 'special', order: 7 },
  { slug: 'páry', label: 'Páry', description: 'Páry nabízející služby', category: 'special', order: 8 },
];

async function main() {
  console.log('🌱 Seeding search tags...');

  for (const tag of searchTags) {
    await prisma.searchTag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }

  console.log(`✅ Created/updated ${searchTags.length} search tags`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
