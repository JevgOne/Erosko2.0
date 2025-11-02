'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function VlasyPage() {
  const hairColors = [
    { label: 'Blondýnky', value: 'blonde', count: 134, description: 'Krásné blonďaté krásky', icon: '👱‍♀️', color: 'from-yellow-500 to-orange-500' },
    { label: 'Brunety', value: 'brunette', count: 156, description: 'Půvabné hnědovlasé holky', icon: '👩', color: 'from-amber-700 to-orange-900' },
    { label: 'Zrzky', value: 'redhead', count: 45, description: 'Vzrušující rudovlasé krásky', icon: '👩‍🦰', color: 'from-red-500 to-pink-500' },
    { label: 'Černovlásky', value: 'black', count: 78, description: 'Exotické černovlasé holky', icon: '👩‍🦱', color: 'from-gray-700 to-gray-900' },
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
              <span className="text-sm font-medium">Filtrování podle barvy vlasů</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Vyberte barvu vlasů</span>
            </h1>
            <p className="text-xl text-gray-400">
              Najděte profily podle barvy vlasů - blondýnky, brunety, zrzky a černovlásky
            </p>
          </div>

          {/* Hair Color Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {hairColors.map((hairColor) => (
              <Link
                key={hairColor.value}
                href={`/holky-na-sex?hairColor=${hairColor.value}`}
                className="group glass rounded-3xl p-8 hover:border-primary-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{hairColor.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                    {hairColor.label}
                  </h3>
                  <p className="text-gray-400 mb-4">{hairColor.description}</p>
                  <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${hairColor.color} bg-opacity-20 text-white px-4 py-2 rounded-full`}>
                    <span className="font-semibold">{hairColor.count}</span>
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
            <h2 className="text-3xl font-bold mb-6">Escort podle barvy vlasů</h2>

            <p className="text-gray-300 mb-4">
              Vyberte si escort služby podle barvy vlasů. Na EROSKO.CZ najdete širokou nabídku blondýnek,
              brunet, zrzek a černovlásek.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Blondýnky na sex</h3>
            <p className="text-gray-300 mb-4">
              Blondýnky jsou tradiční favoritkou mezi muži. Naše blonďaté escort holky nabízejí
              profesionální služby v Praze, Brně a dalších městech ČR. Najdete u nás přirozené i
              barvené blondýnky všech odstínů.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Brunety escort</h3>
            <p className="text-gray-300 mb-4">
              Hnědovlasé krásky nabízejí smyslné a profesionální escort služby. Brunety jsou
              často vnímány jako mysteriózní a elegantní. Máme největší výběr brunet v ČR.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Zrzky na sex</h3>
            <p className="text-gray-300 mb-4">
              Rudovlasé krásky jsou vzácné a výjimečné. Zrzky jsou známé svou vášní a temperamentem.
              Najdete u nás přirozené i barvené zrzky.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Černovlásky</h3>
            <p className="text-gray-300 mb-4">
              Černovlasé holky působí exoticky a smyslně. Najdete u nás černovlásky různých
              národností - od českých přes asijské až po latinas.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
