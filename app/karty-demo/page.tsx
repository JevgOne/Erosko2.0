import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { profilesToCards } from '@/lib/profile-card-adapter';
import ProfileCardGrid from '@/components/ProfileCardGrid';

export const dynamic = 'force-dynamic';

async function getProfiles() {
  const profiles = await prisma.profile.findMany({
    where: {
      approved: true,
    },
    include: {
      photos: {
        take: 1,
        orderBy: {
          order: 'asc',
        },
      },
      business: true,
    },
    take: 12,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return profilesToCards(profiles);
}

export default async function KartyDemoPage() {
  const cards = await getProfiles();

  return (
    <main className="min-h-screen bg-black">
      <div className="profile-cards-container py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Instagram-Style Karty
          </h1>
          <p className="text-gray-400 text-lg">
            Luxusní design podle zadání · {cards.length} profilů
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center text-white py-20">
            Načítání karet...
          </div>
        }>
          <ProfileCardGrid cards={cards} />
        </Suspense>
      </div>
    </main>
  );
}
