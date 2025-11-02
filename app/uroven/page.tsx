'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Star } from 'lucide-react';

export default function UrovenPage() {
  const experienceLevels = [
    { label: 'Amatérka', value: 'amateur', count: 87, description: 'Nové holky s menšími zkušenostmi', icon: '🌸', color: 'from-pink-500 to-rose-500' },
    { label: 'Profesionálka', value: 'professional', count: 234, description: 'Zkušené escort profesionálky', icon: '💎', color: 'from-purple-500 to-pink-500' },
    { label: 'Porno herečka', value: 'pornstar', count: 45, description: 'Známé porno herečky', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
    { label: 'Premium escort', value: 'premium', count: 67, description: 'Luxusní high-end escort', icon: '👑', color: 'from-amber-500 to-yellow-500' },
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
              <Star className="w-4 h-4 text-primary-400" fill="currentColor" />
              <span className="text-sm font-medium">Filtrování podle úrovně</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Vyberte úroveň zkušenosti</span>
            </h1>
            <p className="text-xl text-gray-400">
              Najděte profily podle úrovně zkušenosti - od amatérek po premium escort
            </p>
          </div>

          {/* Experience Level Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {experienceLevels.map((level) => (
              <Link
                key={level.value}
                href={`/holky-na-sex?experienceLevel=${level.value}`}
                className="group glass rounded-3xl p-8 hover:border-primary-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{level.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                    {level.label}
                  </h3>
                  <p className="text-gray-400 mb-4">{level.description}</p>
                  <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${level.color} bg-opacity-20 text-white px-4 py-2 rounded-full`}>
                    <span className="font-semibold">{level.count}</span>
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
            <h2 className="text-3xl font-bold mb-6">Escort podle úrovně zkušenosti</h2>

            <p className="text-gray-300 mb-4">
              Vyberte si escort služby podle úrovně zkušenosti. Od amatérek až po luxusní
              premium escort a známé porno herečky.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Amatérky</h3>
            <p className="text-gray-300 mb-4">
              Nové holky s menšími zkušenostmi v escort službách. Ideální pro ty, kteří hledají
              svěžest a přirozenost. Amatérky nabízejí autentický zážitek s osobním přístupem.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Profesionálky</h3>
            <p className="text-gray-300 mb-4">
              Zkušené escort profesionálky, které přesně vědí, co dělají. Kombinují krásu,
              eleganci a profesionální přístup. Nejoblíbenější kategorie s největším výběrem.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Porno herečky</h3>
            <p className="text-gray-300 mb-4">
              Známé porno herečky nabízející exkluzivní escort služby. Unikátní příležitost
              setkat se s hvězdami adult průmyslu osobně.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Premium escort</h3>
            <p className="text-gray-300 mb-4">
              Luxusní high-end escort pro náročnou klientelu. Top modely a influencerky nabízející
              exkluzivní služby s nejvyšším standardem kvality a diskrétnosti.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
