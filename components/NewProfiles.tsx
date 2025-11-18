'use client';

import { Sparkles } from 'lucide-react';
import ProfileCard from './ProfileCard';
import { profilesToCards } from '@/lib/profile-card-adapter';

export default function NewProfiles({ profiles }: { profiles: any[] }) {
  if (!profiles || profiles.length === 0) return null;

  // Convert profiles to ProfileCard format
  const cards = profilesToCards(profiles);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-pink-500" />
          <h2 className="text-3xl font-bold">Nové Profily</h2>
          <span className="bg-pink-500 text-white text-sm px-3 py-1 rounded-full">
            Přidáno nedávno
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.slice(0, 8).map((card) => (
            <ProfileCard key={card.id} card={card} />
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="/holky-na-sex?sort=newest"
            className="inline-block bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
          >
            Zobrazit všechny nové profily
          </a>
        </div>
      </div>
    </section>
  );
}
