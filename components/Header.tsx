'use client';

import { useState, useEffect } from 'react';
import { Menu, X, User, Heart, Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useDomainName } from '@/hooks/useDomain';

const FAVORITES_KEY = 'erosko_favorites';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const logoText = useDomainName();

  // Auto-sync localStorage favorites when user logs in
  useEffect(() => {
    const syncFavorites = async () => {
      if (session?.user && typeof window !== 'undefined') {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) {
          try {
            const profileIds = JSON.parse(stored);
            if (profileIds.length > 0) {
              const response = await fetch('/api/favorites/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileIds }),
              });

              if (response.ok) {
                // Clear localStorage after successful sync
                localStorage.removeItem(FAVORITES_KEY);
                console.log('Favorites synced successfully');
              }
            }
          } catch (error) {
            console.error('Error syncing favorites:', error);
          }
        }
      }
    };

    syncFavorites();
  }, [session]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <Heart className="w-8 h-8 text-primary-400 relative z-10" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold gradient-text">{logoText}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/holky-na-sex" className="text-gray-300 hover:text-white transition-colors">
              Holky na sex
            </Link>
            <Link href="/eroticke-masaze" className="text-gray-300 hover:text-white transition-colors">
              Erotické masáže
            </Link>
            <Link href="/online-sex" className="text-gray-300 hover:text-white transition-colors">
              Online sex
            </Link>
            <Link href="/bdsm" className="text-gray-300 hover:text-white transition-colors">
              BDSM
            </Link>
            <Link href="/eroticke-podniky" className="text-gray-300 hover:text-white transition-colors">
              Erotické podniky
            </Link>
            <Link href="/oblibene" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
              Oblíbené
            </Link>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'authenticated' && session?.user ? (
              <>
                <Link
                  href="/inzerent_dashboard"
                  className="px-6 py-2.5 gradient-primary rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/50 transition-all"
                >
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>{session.user.email}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass border border-white/10 rounded-lg shadow-xl z-50">
                      <Link
                        href="/inzerent_dashboard"
                        className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Můj dashboard</span>
                      </Link>
                      <div className="border-t border-white/5"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-white/5 transition-colors text-left text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Odhlásit se</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/prihlaseni"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Přihlásit</span>
                </Link>
                <Link
                  href="/registrace"
                  className="px-6 py-2.5 gradient-primary rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/50 transition-all"
                >
                  Registrace
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/5">
            <Link href="/holky-na-sex" className="block px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
              Holky na sex
            </Link>
            <Link href="/eroticke-masaze" className="block px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
              Erotické masáže
            </Link>
            <Link href="/online-sex" className="block px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
              Online sex
            </Link>
            <Link href="/bdsm" className="block px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
              BDSM
            </Link>
            <Link href="/eroticke-podniky" className="block px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
              Erotické podniky
            </Link>
            <Link
              href="/oblibene"
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="w-4 h-4" />
              <span>Oblíbené</span>
            </Link>
            <div className="border-t border-white/5 pt-2 mt-2 space-y-2">
              {status === 'authenticated' && session?.user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-400">
                    {session.user.email}
                  </div>
                  <Link
                    href="/inzerent_dashboard"
                    className="block px-4 py-2 gradient-primary rounded-lg font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Odhlásit se</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/prihlaseni" className="block px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
                    Přihlásit se
                  </Link>
                  <Link href="/registrace" className="block px-4 py-2 gradient-primary rounded-lg font-medium text-center">
                    Registrace
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
