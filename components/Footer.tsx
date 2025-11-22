'use client';

import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';
import { useDomainName } from '@/hooks/useDomain';

export default function Footer() {
  const logoText = useDomainName();

  return (
    <footer className="relative border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <Heart className="w-8 h-8 text-primary-400" fill="currentColor" />
              <span className="text-2xl font-bold gradient-text">{logoText}</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Prémiová platforma pro erotické služby v České republice. Bezpečně, diskrétně a profesionálně.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="glass w-10 h-10 rounded-full flex items-center justify-center glass-hover">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="glass w-10 h-10 rounded-full flex items-center justify-center glass-hover">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="glass w-10 h-10 rounded-full flex items-center justify-center glass-hover">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Kategorie */}
          <div>
            <h3 className="text-lg font-bold mb-4">Kategorie</h3>
            <ul className="space-y-3">
              <li><Link href="/masaze" className="text-gray-400 hover:text-primary-400 transition-colors">Erotické masáže</Link></li>
              <li><Link href="/escort" className="text-gray-400 hover:text-primary-400 transition-colors">Escort & Sex</Link></li>
              <li><Link href="/privaty" className="text-gray-400 hover:text-primary-400 transition-colors">Priváty</Link></li>
              <li><Link href="/podniky" className="text-gray-400 hover:text-primary-400 transition-colors">Podniky & Kluby</Link></li>
              <li><Link href="/bdsm" className="text-gray-400 hover:text-primary-400 transition-colors">BDSM & Speciální</Link></li>
              <li><Link href="/digital" className="text-gray-400 hover:text-primary-400 transition-colors">Digitální služby</Link></li>
            </ul>
          </div>

          {/* Pro inzerenty */}
          <div>
            <h3 className="text-lg font-bold mb-4">Pro inzerenty</h3>
            <ul className="space-y-3">
              <li><Link href="/pridat-inzerat" className="text-gray-400 hover:text-primary-400 transition-colors">Přidat inzerát</Link></li>
              <li><Link href="/ceniky" className="text-gray-400 hover:text-primary-400 transition-colors">Ceníky</Link></li>
              <li><Link href="/vip" className="text-gray-400 hover:text-primary-400 transition-colors">VIP členství</Link></li>
              <li><Link href="/napoveda" className="text-gray-400 hover:text-primary-400 transition-colors">Nápověda</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-primary-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-lg font-bold mb-4">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:info@erosko.cz" className="hover:text-primary-400 transition-colors">
                  info@erosko.cz
                </a>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+420123456789" className="hover:text-primary-400 transition-colors">
                  +420 123 456 789
                </a>
              </li>
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                <span>Praha, Česká republika</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/5 pt-8 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              {logoText} funguje jako inzertní platforma, kde za pravdivost a aktuálnost jednotlivých inzerátů odpovídá výhradně jejich autor.
              Naše stránky slouží pouze pro prezentaci reklamních sdělení a nezabýváme se poskytováním eskortních ani jiných služeb.
              Pokud narazíte na podezřelý či nevhodný obsah, prosíme o jeho nahlášení.
              Neneseme odpovědnost za obsah externích webů nebo jednání třetích stran, které mohou být z našeho portálu odkazovány.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 {logoText}. Všechna práva vyhrazena.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/podminky" className="text-gray-400 hover:text-primary-400 transition-colors">
                Podmínky použití
              </Link>
              <Link href="/soukromi" className="text-gray-400 hover:text-primary-400 transition-colors">
                Ochrana soukromí
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-primary-400 transition-colors">
                Cookies
              </Link>
              <Link href="/gdpr" className="text-gray-400 hover:text-primary-400 transition-colors">
                GDPR
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
