'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function PrsaPage() {
  const breastTypes = [
    { label: 'Silikonová prsa', value: 'silicone', count: 156, description: 'Holky se silikony', icon: '💎', color: 'from-blue-500 to-cyan-500' },
    { label: 'Velká prsa', value: 'large', count: 134, description: 'Velká přírodní prsa', icon: '🔥', color: 'from-red-500 to-pink-500' },
    { label: 'Malá prsa', value: 'small', count: 98, description: 'Malá přirozená prsa', icon: '🌸', color: 'from-pink-500 to-rose-500' },
    { label: 'Přirozená prsa', value: 'natural', count: 201, description: 'Přírodní prsa všech velikostí', icon: '✨', color: 'from-purple-500 to-pink-500' },
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
              <span className="text-sm font-medium">Filtrování podle prsou</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Vyberte typ prsou</span>
            </h1>
            <p className="text-xl text-gray-400">
              Najděte profily podle typu prsou - silikonová, velká, malá nebo přirozená
            </p>
          </div>

          {/* Breast Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {breastTypes.map((breastType) => (
              <Link
                key={breastType.value}
                href={`/holky-na-sex?breastType=${breastType.value}`}
                className="group glass rounded-3xl p-8 hover:border-primary-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{breastType.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                    {breastType.label}
                  </h3>
                  <p className="text-gray-400 mb-4">{breastType.description}</p>
                  <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${breastType.color} bg-opacity-20 text-white px-4 py-2 rounded-full`}>
                    <span className="font-semibold">{breastType.count}</span>
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
            <h2 className="text-3xl font-bold mb-6">Escort podle typu prsou</h2>

            <p className="text-gray-300 mb-4">
              Vyberte si escort holky podle typu a velikosti prsou. Máme široký výběr od malých
              přirozených až po velká silikonová prsa.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Silikonová prsa</h3>
            <p className="text-gray-300 mb-4">
              Holky se silikonovými prsy nabízejí dokonalé křivky a velkolepý vzhled. Ideální
              pro ty, kteří preferují větší a pevnější prsa.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Velká prsa</h3>
            <p className="text-gray-300 mb-4">
              Velká přírodní prsa jsou snem mnoha mužů. Najdete u nás holky s velkými přirozenými
              prsy, které nabízejí nezapomenutelný zážitek.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Malá prsa</h3>
            <p className="text-gray-300 mb-4">
              Malá prsa mají své kouzlo a eleganci. Ideální pro ty, kteří preferují jemnější
              a subtilnější krásu.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Přirozená prsa</h3>
            <p className="text-gray-300 mb-4">
              Přírodní prsa všech velikostí nabízejí autentický a přirozený zážitek. Nejoblíbenější
              kategorie pro ty, kteří oceňují přirozenou krásu.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
