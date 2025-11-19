import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    console.log('🌱 Starting service seed...');

    // Delete existing services
    await prisma.profileService.deleteMany();
    await prisma.service.deleteMany();

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
      prisma.service.create({ data: { name: 'Sprcha', description: 'Sprcha k dispozici', icon: 'Droplet', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Soukromá sprcha', description: 'Soukromá sprcha', icon: 'Droplet', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Jacuzzi', description: 'Vířivka', icon: 'Waves', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Sauna', description: 'Sauna k dispozici', icon: 'Flame', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Welcome drink', description: 'Uvítací nápoj', icon: 'Wine', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Občerstvení', description: 'Občerstvení zdarma', icon: 'Coffee', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Klimatizace', description: 'Klimatizované prostory', icon: 'Wind', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'WiFi', description: 'Bezplatné WiFi', icon: 'Wifi', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Diskrétní prostředí', description: 'Diskrétní a soukromé', icon: 'EyeOff', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Soukromý vchod', description: 'Diskrétní vstup', icon: 'DoorOpen', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Parkování', description: 'Parkování k dispozici', icon: 'Car', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Soukromé parkování', description: 'Soukromé parkoviště', icon: 'Car', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Bezbariérový přístup', description: 'Přístup pro vozíčkáře', icon: 'Accessibility', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Platba kartou', description: 'Přijímáme karty', icon: 'CreditCard', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Hotovost', description: 'Platba v hotovosti', icon: 'Banknote', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Čtyřruční masáž', description: 'Masáž dvěma masérkami', icon: 'Users', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Párová masáž', description: 'Masáž pro páry', icon: 'Heart', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'VIP místnost', description: 'Luxusní VIP pokoj', icon: 'Crown', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Ručníky zdarma', description: 'Čisté ručníky', icon: 'Shirt', category: 'EXTRA_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Hygienické potřeby', description: 'Kosmetika a hygiena', icon: 'Sparkles', category: 'EXTRA_SLUZBY' } }),
    ]);

    // ONLINE SLUŽBY
    const onlineServices = await Promise.all([
      prisma.service.create({ data: { name: 'Webka/video', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Webcam show', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Live cam show', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Video call sex', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Custom videa', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Video na míru', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Sex po telefonu', description: 'Kategorie: Online', icon: 'Phone', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Phone sex', description: 'Kategorie: Online', icon: 'Phone', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Audio call', description: 'Kategorie: Online', icon: 'Phone', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Custom fotky', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Sexy fotky', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Nahé fotky', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Feet pics', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Sexting', description: 'Kategorie: Online', icon: 'MessageCircle', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Online chat', description: 'Kategorie: Online', icon: 'MessagesSquare', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Dirty talk', description: 'Kategorie: Online', icon: 'MessageCircle', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'OnlyFans', description: 'Kategorie: Online', icon: 'Star', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Premium Snapchat', description: 'Kategorie: Online', icon: 'Camera', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Soukromý Instagram', description: 'Kategorie: Online', icon: 'Instagram', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Telegram premium', description: 'Kategorie: Online', icon: 'Send', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Dick rating', description: 'Kategorie: Online', icon: 'Star', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Hodnocení penisu', description: 'Kategorie: Online', icon: 'Star', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Virtual girlfriend', description: 'Kategorie: Online', icon: 'Heart', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Virtuální přítelkyně', description: 'Kategorie: Online', icon: 'Heart', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Dominance online', description: 'Kategorie: Online', icon: 'Crown', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'JOI (Jerk Off Instructions)', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'CEI (Cum Eating Instructions)', description: 'Kategorie: Online', icon: 'Video', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Použité prádlo', description: 'Kategorie: Online', icon: 'ShoppingBag', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Používané ponožky', description: 'Kategorie: Online', icon: 'ShoppingBag', category: 'ONLINE_SLUZBY' } }),
      prisma.service.create({ data: { name: 'Selling worn items', description: 'Kategorie: Online', icon: 'ShoppingBag', category: 'ONLINE_SLUZBY' } }),
    ]);

    const totalServices = escortServices.length + massageServices.length + extraServices.length + bdsmServices.length + onlineServices.length;

    console.log(`✅ Created ${totalServices} services`);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${totalServices} services`,
      breakdown: {
        escort: escortServices.length,
        massage: massageServices.length,
        extra: extraServices.length,
        bdsm: bdsmServices.length,
        online: onlineServices.length,
        total: totalServices
      }
    });

  } catch (error) {
    console.error('Error seeding services:', error);
    return NextResponse.json(
      { error: 'Failed to seed services', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
