'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function NarodnostPage() {
  const nationalities = [
    { label: 'České holky', value: 'czech', count: 156, description: 'Krásné české krásky', icon: '🇨🇿' },
    { label: 'Slovenky', value: 'slovak', count: 89, description: 'Slovenské escort služby', icon: '🇸🇰' },
    { label: 'Rusky', value: 'russian', count: 67, description: 'Ruské krásky', icon: '🇷🇺' },
    { label: 'Ukrajinky', value: 'ukrainian', count: 54, description: 'Ukrajinské holky', icon: '🇺🇦' },
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
              <Globe className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">Filtrování podle národnosti</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Vyberte národnost</span>
            </h1>
            <p className="text-xl text-gray-400">
              Najděte profily podle národnosti - české, slovenky, rusky a další
            </p>
          </div>

          {/* Nationality Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {nationalities.map((nationality) => (
              <Link
                key={nationality.value}
                href={`/holky-na-sex?nationality=${nationality.value}`}
                className="group glass rounded-3xl p-8 hover:border-primary-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{nationality.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                    {nationality.label}
                  </h3>
                  <p className="text-gray-400 mb-4">{nationality.description}</p>
                  <div className="inline-flex items-center space-x-2 bg-primary-500/10 text-primary-400 px-4 py-2 rounded-full">
                    <span className="font-semibold">{nationality.count}</span>
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
            <h2 className="text-3xl font-bold mb-6">Escort podle národnosti</h2>

            <p className="text-gray-300 mb-4">
              Vyberte si escort služby podle národnosti. Na EROSKO.CZ najdete širokou nabídku českých,
              slovenských, ruských a ukrajinských krásek.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">České holky na sex</h3>
            <p className="text-gray-300 mb-4">
              Preferujete české krásky? Máme největší výběr českých escort holek v Praze, Brně a dalších městech.
              České holky jsou známé svou krásou, diskrétností a profesionálním přístupem.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Slovenské escort</h3>
            <p className="text-gray-300 mb-4">
              Slovenky nabízejí profesionální escort služby s důrazem na kvalitu a diskrétnost.
              Najdete je v Praze, Brně a dalších velkých městech ČR.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Ruské a ukrajinské krásky</h3>
            <p className="text-gray-300 mb-4">
              Hledáte exotičtější zážitek? Ruské a ukrajinské holky nabízejí unikátní escort služby
              s důrazem na luxus a profesionalitu.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
