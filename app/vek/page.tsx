'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function VekPage() {
  const ageCategories = [
    { label: 'Studentky', value: 'student', count: 89, description: 'Mladé holky 18-23 let', icon: '🎓', color: 'from-pink-500 to-rose-500' },
    { label: 'Holky', value: 'young', count: 178, description: 'Holky ve věku 24-30 let', icon: '💕', color: 'from-purple-500 to-pink-500' },
    { label: 'MILF', value: 'milf', count: 112, description: 'Zralé ženy 31-40 let', icon: '🔥', color: 'from-red-500 to-orange-500' },
    { label: 'Zralé', value: 'mature', count: 34, description: 'Zkušené ženy 40+ let', icon: '💎', color: 'from-amber-500 to-yellow-500' },
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
              <Calendar className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">Filtrování podle věku</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Vyberte věkovou kategorii</span>
            </h1>
            <p className="text-xl text-gray-400">
              Najděte profily podle věku - studentky, holky, MILF nebo zralé ženy
            </p>
          </div>

          {/* Age Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {ageCategories.map((category) => (
              <Link
                key={category.value}
                href={`/holky-na-sex?ageCategory=${category.value}`}
                className="group glass rounded-3xl p-8 hover:border-primary-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-gray-400 mb-4">{category.description}</p>
                  <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${category.color} bg-opacity-20 text-white px-4 py-2 rounded-full`}>
                    <span className="font-semibold">{category.count}</span>
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
            <h2 className="text-3xl font-bold mb-6">Escort podle věkové kategorie</h2>

            <p className="text-gray-300 mb-4">
              Vyberte si escort služby podle věku. Na EROSKO.CZ najdete širokou nabídku od mladých
              studentek přes MILF až po zralé a zkušené ženy.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Studentky na sex</h3>
            <p className="text-gray-300 mb-4">
              Mladé studentky ve věku 18-23 let nabízejí svěží a energický přístup k escort službám.
              Ideální pro ty, kteří hledají mladistvou krásu a nevinný vzhled.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Holky escort</h3>
            <p className="text-gray-300 mb-4">
              Holky ve věku 24-30 let jsou nejoblíbenější kategorií. Kombinují mladistvý vzhled
              se zkušenostmi a profesionalitou. Perfektní rovnováha mezi mládím a zralostí.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">MILF escort</h3>
            <p className="text-gray-300 mb-4">
              MILF kategorie (31-40 let) nabízí zralé a zkušené ženy, které přesně vědí, co chtějí
              a jak uspokojit. Ideální pro náročné klienty, kteří oceňují zkušenosti a profesionalitu.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Zralé ženy</h3>
            <p className="text-gray-300 mb-4">
              Zralé ženy nad 40 let jsou vrcholem elegance a zkušeností. Nabízejí unikátní zážitek
              s důrazem na kvalitu a diskrétnost. Pro ty, kteří oceňují zralou krásu.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
