'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function PostavaPage() {
  const bodyTypes = [
    { label: 'Hubená', value: 'slim', count: 92, description: 'Hubenější holky s malou postavou', icon: '🌸' },
    { label: 'Štíhlá', value: 'fit', count: 145, description: 'Štíhlé a elegantní holky', icon: '✨' },
    { label: 'Sportovní', value: 'athletic', count: 87, description: 'Atletické a sportovní postavy', icon: '💪' },
    { label: 'Krev a mléko', value: 'curvy', count: 64, description: 'Plnoštíhlé a sexy postavy', icon: '🔥' },
  ];

  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4 text-primary-400" fill="currentColor" />
              <span className="text-sm font-medium">Filtrování podle postavy</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Vyberte typ postavy</span>
            </h1>
            <p className="text-xl text-gray-400">
              Najděte profily podle typu postavy - hubená, štíhlá, sportovní nebo krev a mléko
            </p>
          </div>

          {/* Body Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {bodyTypes.map((bodyType) => (
              <Link
                key={bodyType.value}
                href={`/holky-na-sex?bodyType=${bodyType.value}`}
                className="group glass rounded-3xl p-8 hover:border-primary-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{bodyType.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                    {bodyType.label}
                  </h3>
                  <p className="text-gray-400 mb-4">{bodyType.description}</p>
                  <div className="inline-flex items-center space-x-2 bg-primary-500/10 text-primary-400 px-4 py-2 rounded-full">
                    <span className="font-semibold">{bodyType.count}</span>
                    <span className="text-sm">profilů</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-dark-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto prose prose-invert">
            <h2 className="text-3xl font-bold mb-6">Escort podle typu postavy</h2>

            <p className="text-gray-300 mb-4">
              Vyberte si escort holky podle typu postavy. Nabízíme široký výběr od hubených přes
              štíhlé až po plnoštíhlé krásky typu "krev a mléko".
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Hubené holky</h3>
            <p className="text-gray-300 mb-4">
              Preferujete hubenější postavy? Máme široký výběr hubených escort holek s jemnou a elegantní postavou.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Štíhlé escort</h3>
            <p className="text-gray-300 mb-4">
              Štíhlé holky jsou nejoblíbenější kategorií. Elegantní postava s dokonalými proporcemi.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Sportovní holky</h3>
            <p className="text-gray-300 mb-4">
              Atletické a sportovní escort holky s pevným tělem a zdravým vzhledem.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Krev a mléko</h3>
            <p className="text-gray-300 mb-4">
              Pro milovníky plnějších postav nabízíme holky typu "krev a mléko" - plnoštíhlé krásky
              s dokonalými křivkami a smyslnou postavou.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
