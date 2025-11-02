'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Users, Sparkles, Heart, Globe } from 'lucide-react';

export default function OblibeneVyhledavaniPage() {
  const categories = [
    {
      title: 'Podle věku',
      description: 'Najděte profily podle věkové kategorie',
      icon: Users,
      color: 'from-primary-500 to-pink-500',
      items: [
        { label: 'Studentky na sex', url: '/holky-na-sex?age=student', description: 'Mladé studentky 18-22 let', seo: 'studentky na sex' },
        { label: 'Mladé holky', url: '/holky-na-sex?age=young', description: 'Holky do 25 let', seo: 'mladé holky na sex' },
        { label: 'Holky 25-30 let', url: '/holky-na-sex?age=25-30', description: 'Zkušené holky v nejlepším věku', seo: 'holky 25-30 let' },
        { label: 'Zralé ženy', url: '/holky-na-sex?age=mature', description: 'Ženy 30-40 let', seo: 'zralé ženy na sex' },
        { label: 'MILF', url: '/holky-na-sex?age=milf', description: 'Zralé sexy mámy 40+', seo: 'MILF escort' },
        { label: 'Cougar', url: '/holky-na-sex?age=cougar', description: 'Starší ženy preferující mladší muže', seo: 'cougar sex' },
      ],
    },
    {
      title: 'Podle barvy vlasů',
      description: 'Vyberte si podle barvy vlasů',
      icon: Sparkles,
      color: 'from-pink-500 to-purple-500',
      items: [
        { label: 'Blondýnky na sex', url: '/holky-na-sex?hair=blonde', description: 'Krásné blondýnky', seo: 'blondýnky na sex' },
        { label: 'Brunety na sex', url: '/holky-na-sex?hair=brunette', description: 'Půvabné brunetky', seo: 'brunety escort' },
        { label: 'Zrzky na sex', url: '/holky-na-sex?hair=redhead', description: 'Vzrušující zrzky', seo: 'zrzky na sex' },
        { label: 'Černovlásky', url: '/holky-na-sex?hair=black', description: 'Exotické černovlásky', seo: 'černovlásky escort' },
      ],
    },
    {
      title: 'Podle vzhledu a těla',
      description: 'Najděte profil podle typu postavy',
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      items: [
        { label: 'Holky se silikony', url: '/holky-na-sex?body=silicone', description: 'Holky s umělými prsy', seo: 'holky se silikony' },
        { label: 'Přírodní prsa', url: '/holky-na-sex?body=natural', description: 'Holky s přírodními prsy', seo: 'přírodní prsa' },
        { label: 'Velká prsa', url: '/holky-na-sex?body=big-boobs', description: 'Holky s velkými prsy', seo: 'velká prsa sex' },
        { label: 'Malá prsa', url: '/holky-na-sex?body=small-boobs', description: 'Holky s malými prsy', seo: 'malá prsa escort' },
        { label: 'Atletické holky', url: '/holky-na-sex?body=athletic', description: 'Sportovní a atletické postavy', seo: 'atletické holky' },
        { label: 'Štíhlé holky', url: '/holky-na-sex?body=slim', description: 'Štíhlé a elegantní', seo: 'štíhlé escort' },
        { label: 'BBW', url: '/holky-na-sex?body=bbw', description: 'Big Beautiful Women', seo: 'BBW sex' },
        { label: 'Holky s tetováním', url: '/holky-na-sex?body=tattoo', description: 'Tetované krásky', seo: 'tetované holky' },
        { label: 'Holky s piercingem', url: '/holky-na-sex?body=piercing', description: 'S piercingem', seo: 'piercing sex' },
      ],
    },
    {
      title: 'Podle národnosti',
      description: 'Vyberte si podle národnosti',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      items: [
        { label: 'České holky', url: '/holky-na-sex?nationality=czech', description: 'České krásky', seo: 'české holky na sex' },
        { label: 'Slovenky', url: '/holky-na-sex?nationality=slovak', description: 'Slovenské escort', seo: 'slovenky escort' },
        { label: 'Rusky', url: '/holky-na-sex?nationality=russian', description: 'Ruské krásky', seo: 'rusky na sex' },
        { label: 'Ukrajinky', url: '/holky-na-sex?nationality=ukrainian', description: 'Ukrajinské holky', seo: 'ukrajinky escort' },
        { label: 'Polky', url: '/holky-na-sex?nationality=polish', description: 'Polské escort', seo: 'polky na sex' },
        { label: 'Rumunky', url: '/holky-na-sex?nationality=romanian', description: 'Rumunské holky', seo: 'rumunky sex' },
        { label: 'Latinas', url: '/holky-na-sex?nationality=latina', description: 'Latinsko-americké krásky', seo: 'latina escort' },
        { label: 'Asiatky', url: '/holky-na-sex?nationality=asian', description: 'Asijské krásky', seo: 'asiatky na sex' },
        { label: 'Černošky', url: '/holky-na-sex?nationality=black', description: 'Africké a afroamerické krásky', seo: 'černošky escort' },
      ],
    },
    {
      title: 'Speciální kategorie',
      description: 'Unikátní a speciální profily',
      icon: Sparkles,
      color: 'from-red-500 to-orange-500',
      items: [
        { label: 'VIP Escort', url: '/holky-na-sex?type=vip', description: 'Prémiové VIP escort služby', seo: 'VIP escort Praha' },
        { label: 'Amatérky', url: '/holky-na-sex?type=amateur', description: 'Nezkušené amatérské holky', seo: 'amatérky na sex' },
        { label: 'Pornohvězdy', url: '/holky-na-sex?type=pornstar', description: 'Známé pornohvězdy', seo: 'pornohvězdy escort' },
        { label: 'Squirting', url: '/holky-na-sex?special=squirting', description: 'Holky co stříkají', seo: 'squirting sex' },
        { label: 'Bisexuální', url: '/holky-na-sex?orientation=bi', description: 'Bisexuální holky', seo: 'bisexuální escort' },
        { label: 'Lesbičky', url: '/holky-na-sex?orientation=lesbian', description: 'Lesbické holky', seo: 'lesbičky show' },
        { label: 'Trans', url: '/holky-na-sex?type=trans', description: 'Transgender escort', seo: 'trans escort' },
        { label: 'Páry', url: '/holky-na-sex?type=couple', description: 'Páry nabízející služby', seo: 'páry sex' },
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
              <span className="gradient-text">Oblíbené vyhledávání</span>
            </h1>
            <p className="text-xl text-gray-400">
              Nejčastěji vyhledávané kategorie - studentky, blondýnky, MILF a další
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-12">
            {categories.map((category, idx) => {
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
                    {category.items.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        href={item.url}
                        className="group bg-dark-800/50 hover:bg-dark-800 border border-white/10 hover:border-primary-500/50 rounded-xl p-4 transition-all"
                      >
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                        <p className="text-xs text-primary-500/70">KW: {item.seo}</p>
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
            <h2 className="text-3xl font-bold mb-6">Kategorie escort profilů v ČR</h2>

            <p className="text-gray-300 mb-4">
              Najděte přesně to, co hledáte! Naše platforma EROSKO.CZ nabízí rozsáhlý výběr profilů
              rozdělených do kategorií podle věku, vzhledu, národnosti a dalších specifických požadavků.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Studentky a mladé holky na sex</h3>
            <p className="text-gray-300 mb-4">
              Vyhledávejte mladé studentky a holky do 25 let. Naše kategorie mladých holek zahrnuje studentky,
              začínající escort holky a mladé krásky, které nabízejí diskrétní služby v Praze, Brně a dalších městech ČR.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Blondýnky, brunety a zrzky</h3>
            <p className="text-gray-300 mb-4">
              Máte preferenci barvy vlasů? U nás najdete blondýnky na sex, půvabné brunety, vzrušující zrzky
              i exotické černovlásky. Každá barva vlasů má své kouzlo a my máme širokou nabídku všech typů.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Podle typu postavy</h3>
            <p className="text-gray-300 mb-4">
              Vyberte si podle typu těla - holky se silikony, s přírodními prsy, atletické, štíhlé nebo BBW.
              Najdete u nás také holky s tetováním, piercingem a dalšími specifickými atributy.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">České a zahraniční krásky</h3>
            <p className="text-gray-300 mb-4">
              Preferujete české holky nebo vás láká něco exotičtějšího? Máme široký výběr českých krásek,
              slovenek, rusek, ukrajinek, latinas, asiátek a mnoho dalších národností.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Speciální kategorie</h3>
            <p className="text-gray-300 mb-4">
              Hledáte něco specifického? Prozkoumejte naše speciální kategorie jako VIP escort, pornohvězdy,
              trans escort, páry a další unikátní nabídky.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Bezpečné a diskrétní</h3>
            <p className="text-gray-300 mb-4">
              Všechny profily jsou ověřené a důraz klademe na bezpečnost, diskrétnost a kvalitu služeb.
              EROSKO.CZ je vaše důvěryhodná platforma pro hledání escort služeb v České republice.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
