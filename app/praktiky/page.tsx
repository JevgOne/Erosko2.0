'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Heart, Sparkles, Flame, Video } from 'lucide-react';

export default function SluzbyPage() {
  const serviceCategories = [
    {
      title: 'Escort služby',
      description: 'Profesionální doprovod a escort služby',
      icon: Heart,
      color: 'from-primary-500 to-pink-500',
      services: [
        { label: 'Escort', url: '/holky-na-sex?service=escort', description: 'Profesionální doprovod na akce a večírky' },
        { label: 'Girlfriend Experience (GFE)', url: '/holky-na-sex?service=gfe', description: 'Autentický zážitek s partnerkou' },
        { label: 'Dinner Date', url: '/holky-na-sex?service=dinner-date', description: 'Romantická večeře s krásnou společnicí' },
        { label: 'Travel Companion', url: '/holky-na-sex?service=travel-companion', description: 'Doprovod na cestách a výletech' },
        { label: 'Overnight', url: '/holky-na-sex?service=overnight', description: 'Přespání s escort' },
        { label: 'Striptýz', url: '/holky-na-sex?service=striptyz', description: 'Soukromý striptýz' },
        { label: 'Erotický tanec', url: '/holky-na-sex?service=tanec', description: 'Smyslný erotický tanec' },
        { label: 'Společná sprcha', url: '/holky-na-sex?service=sprcha', description: 'Intimní sprchování' },
        { label: 'Foot Fetish', url: '/holky-na-sex?service=foot-fetish', description: 'Služby pro milovníky nohou' },
        { label: 'Roleplay', url: '/holky-na-sex?service=roleplay', description: 'Hraní rolí a fantazie' },
      ],
    },
    {
      title: 'Sexuální praktiky',
      description: 'Základní a speciální sexuální služby',
      icon: Heart,
      color: 'from-pink-500 to-purple-500',
      services: [
        { label: 'Hluboký orál', url: '/holky-na-sex?service=hluboky-oral', description: 'Deep throat orální sex' },
        { label: 'Klasika', url: '/holky-na-sex?service=klasika', description: 'Klasický vaginální sex' },
        { label: 'Orál', url: '/holky-na-sex?service=oral', description: 'Orální sex' },
        { label: 'Anální sex', url: '/holky-na-sex?service=anal', description: 'Anální penetrace' },
        { label: 'Lesbi show', url: '/holky-na-sex?service=lesbi', description: 'Lesbická show pro diváky' },
        { label: 'Polykání', url: '/holky-na-sex?service=polykani', description: 'Polykání spermatu' },
        { label: '69', url: '/holky-na-sex?service=69', description: 'Vzájemný orální sex' },
        { label: 'Rimming', url: '/holky-na-sex?service=rimming', description: 'Anální lízání' },
        { label: 'CIM (Cum in Mouth)', url: '/holky-na-sex?service=CIM', description: 'Ejakulace do úst' },
        { label: 'COF (Cum on Face)', url: '/holky-na-sex?service=COF', description: 'Ejakulace na obličej' },
        { label: 'French Kiss', url: '/holky-na-sex?service=french-kiss', description: 'Líbání s jazykem' },
      ],
    },
    {
      title: 'Erotické masáže',
      description: 'Relaxační a smyslné masáže',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      services: [
        { label: 'Klasická masáž', url: '/eroticke-masaze?service=klasicka', description: 'Tradiční relaxační masáž' },
        { label: 'Erotická masáž', url: '/eroticke-masaze?service=eroticka', description: 'Smyslná masáž celého těla' },
        { label: 'Tantrická masáž', url: '/eroticke-masaze?service=tantricka', description: 'Duchovní a smyslná tantric masáž' },
        { label: 'Happy End', url: '/eroticke-masaze?service=happy-end', description: 'Masáž se šťastným koncem' },
        { label: 'Body to Body', url: '/eroticke-masaze?service=body-to-body', description: 'Masáž tělem na tělo' },
        { label: 'Nuru masáž', url: '/eroticke-masaze?service=nuru', description: 'Kluzká japonská masáž' },
        { label: 'Thajská masáž', url: '/eroticke-masaze?service=thajska', description: 'Tradiční thajská masáž' },
        { label: 'Prostatická masáž', url: '/eroticke-masaze?service=prostaticka', description: 'Masáž prostaty' },
        { label: 'Masáž pro páry', url: '/eroticke-masaze?service=parovka', description: 'Romantická masáž pro dva' },
        { label: 'Relaxační masáž', url: '/eroticke-masaze?service=relaxacni', description: 'Uvolňující masáž' },
      ],
    },
    {
      title: 'BDSM & Fetish',
      description: 'BDSM praktiky a fetish služby',
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      services: [
        { label: 'Bondage', url: '/bdsm?service=bondage', description: 'Svazování a fixace' },
        { label: 'Domina služby', url: '/bdsm?service=domina', description: 'Dominantní služby' },
        { label: 'Submisivní služby', url: '/bdsm?service=submisivni', description: 'Poddajné služby' },
        { label: 'Spanking', url: '/bdsm?service=spanking', description: 'Plácání a bičování' },
        { label: 'Roleplay BDSM', url: '/bdsm?service=roleplay-bdsm', description: 'BDSM hraní rolí' },
        { label: 'Fetish služby', url: '/bdsm?service=fetish', description: 'Různé fetish praktiky' },
        { label: 'Wax Play', url: '/bdsm?service=wax-play', description: 'Hra s voskem' },
        { label: 'Humiliation', url: '/bdsm?service=humiliation', description: 'Ponižování' },
      ],
    },
    {
      title: 'Online služby',
      description: 'Virtuální erotické služby',
      icon: Video,
      color: 'from-blue-500 to-cyan-500',
      services: [
        { label: 'Videochat', url: '/online-sex?service=videochat', description: 'Online video hovory' },
        { label: 'Sexting', url: '/online-sex?service=sexting', description: 'Textové erotické zprávy' },
        { label: 'Custom obsah', url: '/online-sex?service=custom-content', description: 'Personalizovaná erotická videa a fotky' },
        { label: 'Cam Show', url: '/online-sex?service=cam-show', description: 'Živé webcam show' },
        { label: 'OnlyFans', url: '/online-sex?service=onlyfans', description: 'Prémiový online obsah' },
      ],
    },
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Erotické služby a praktiky</span>
            </h1>
            <p className="text-xl text-gray-400">
              Kompletní rozcestník všech nabízených služeb a praktik
            </p>
          </div>

          {/* Service Categories */}
          <div className="space-y-12">
            {serviceCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div key={idx} className="glass rounded-3xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{category.title}</h2>
                      <p className="text-gray-400">{category.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.services.map((service, serviceIdx) => (
                      <Link
                        key={serviceIdx}
                        href={service.url}
                        className="group bg-dark-800/50 hover:bg-dark-800 border border-white/10 hover:border-primary-500/50 rounded-xl p-4 transition-all"
                      >
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                          {service.label}
                        </h3>
                        <p className="text-sm text-gray-400">{service.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-dark-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto prose prose-invert">
            <h2 className="text-3xl font-bold mb-6">O erotických službách</h2>

            <p className="text-gray-300 mb-4">
              Vítejte v komplexním rozcestníku erotických služeb a praktik. Na EROSKO.CZ najdete širokou nabídku
              profesionálních služeb od ověřených poskytovatelek a poskytovatelů.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Escort služby</h3>
            <p className="text-gray-300 mb-4">
              Escort služby zahrnují profesionální doprovod na společenské akce, večeře, výlety či jiné příležitosti.
              Naše eskortky poskytují diskrétní a profesionální služby včetně GFE (Girlfriend Experience),
              travel companion a overnight služeb.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Erotické masáže</h3>
            <p className="text-gray-300 mb-4">
              Relaxujte při profesionálních erotických masážích včetně tantrických masáží, masáží body-to-body,
              nuru masáží a klasických masáží s happy endem. Naše masérky jsou zkušené a diskrétní.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">BDSM & Fetish</h3>
            <p className="text-gray-300 mb-4">
              Pro milovníky BDSM nabízíme širokou škálu služeb od bondage přes domina služby až po různé
              fetish praktiky. Vše v bezpečném a kontrolovaném prostředí s respektem k vašim hranicím.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Online služby</h3>
            <p className="text-gray-300 mb-4">
              Preferujete online zábavu? Nabízíme videochat, sexting, cam show a custom obsah.
              Spojte se s našimi modelkami odkudkoliv v bezpečí vašeho domova.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Bezpečnost a diskrétnost</h3>
            <p className="text-gray-300 mb-4">
              Všechny profily na EROSKO.CZ jsou ověřené a důraz klademe na bezpečnost, diskrétnost a vzájemný respekt.
              Naše platformaunabízí bezpečné prostředí pro hledání erotických služeb v České republice.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
