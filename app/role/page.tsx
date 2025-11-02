'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function RolePage() {
  const roles = [
    { label: 'Studentka', value: 'student', count: 145, description: 'Nevinná studentka', icon: '👩‍🎓' },
    { label: 'Učitelka', value: 'teacher', count: 98, description: 'Přísná učitelka', icon: '👩‍🏫' },
    { label: 'Zdravotní sestra', value: 'nurse', count: 112, description: 'Sexy zdravotní sestra', icon: '👩‍⚕️' },
    { label: 'Sekretářka', value: 'secretary', count: 87, description: 'Elegantní sekretářka', icon: '👩‍💼' },
    { label: 'Policistka', value: 'police', count: 76, description: 'Přísná policistka', icon: '👮‍♀️' },
    { label: 'Šéfová', value: 'boss', count: 65, description: 'Dominantní šéfová', icon: '💼' },
    { label: 'Servírka', value: 'waitress', count: 54, description: 'Sexy servírka', icon: '👩‍🍳' },
    { label: 'Domina', value: 'domina', count: 89, description: 'BDSM domina', icon: '👑' },
    { label: 'Sousedka', value: 'neighbor', count: 102, description: 'Sexy sousedka', icon: '🏠' },
    { label: 'Fitneska', value: 'fitness', count: 78, description: 'Sportovní trenérka', icon: '💪' },
    { label: 'Kočička', value: 'catgirl', count: 43, description: 'Roztomilá kočička', icon: '🐱' },
    { label: 'Cosplay', value: 'cosplay', count: 67, description: 'Anime cosplay', icon: '🎭' },
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
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">Filtrování podle role</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Jaké má ráda role?</span>
            </h1>
            <p className="text-xl text-gray-400">
              Vyberte si oblíbené role a fantazie - studentka, učitelka, zdravotní sestra a další
            </p>
          </div>

          {/* Roles Grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {roles.map((role) => (
              <Link
                key={role.value}
                href={`/holky-na-sex?role=${role.value}`}
                className="group glass rounded-3xl p-6 hover:border-primary-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{role.icon}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                    {role.label}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{role.description}</p>
                  <div className="inline-flex items-center space-x-2 bg-primary-500/10 text-primary-400 px-3 py-1.5 rounded-full text-sm">
                    <span className="font-semibold">{role.count}</span>
                    <span>profilů</span>
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
            <h2 className="text-3xl font-bold mb-6">Escort s oblíbenými rolemi</h2>

            <p className="text-gray-300 mb-4">
              Objevte escort holky, které milují role-play. Od klasických rolí jako studentka
              nebo zdravotní sestra až po pokročilé fantazie jako domina nebo cosplay.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Role-play escort služby</h3>
            <p className="text-gray-300 mb-4">
              Role-play je oblíbená forma escort služeb, která přináší vzrušení a fantazii
              do vašeho setkání. Naše holky jsou zkušené v různých rolích a scénářích.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Populární role</h3>
            <p className="text-gray-300 mb-4">
              Nejoblíbenější role zahrnují studentku, učitelku, zdravotní sestru, sekretářku
              a policistku. Tyto klasické role jsou oblíbené pro svou univerzální přitažlivost.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Dominantní role</h3>
            <p className="text-gray-300 mb-4">
              Pro ty, kteří preferují dominantní ženy, nabízíme holky v rolích šéfové, dominy
              nebo policistky. Ideální pro submisivní klienty.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Cosplay a speciální role</h3>
            <p className="text-gray-300 mb-4">
              Milujete anime a cosplay? Naše holky nabízejí také speciální role jako kočička
              (catgirl), anime postavy a další kreativní cosplay možnosti.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
