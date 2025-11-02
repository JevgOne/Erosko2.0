'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Building2, User, Settings, LogOut, Plus, Eye, Edit, Trash2 } from 'lucide-react';

export default function InzerentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/prihlaseni');
      return;
    }

    if (session?.user) {
      fetchUserData();
    }
  }, [status, session, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
        setBusinesses(data.businesses || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-400">Načítám dashboard...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Dashboard inzerenta</span>
            </h1>
            <p className="text-xl text-gray-400">
              Vítejte zpět, {session?.user?.email}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-300">Aktivní profily</h3>
                <User className="w-6 h-6 text-primary-400" />
              </div>
              <p className="text-3xl font-bold">{profiles.length + businesses.length}</p>
              <p className="text-sm text-gray-400 mt-1">
                {profiles.length} solo • {businesses.length} podniků
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-300">Zobrazení</h3>
                <Eye className="w-6 h-6 text-primary-400" />
              </div>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-400 mt-1">Za tento měsíc</p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-300">Hodnocení</h3>
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-3xl font-bold">—</p>
              <p className="text-sm text-gray-400 mt-1">Zatím bez hodnocení</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome Card */}
              <div className="glass rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">Vítejte na EROSKO.CZ</h2>
                <p className="text-gray-300 mb-6">
                  Váš účet byl úspěšně vytvořen. Teď můžete začít spravovat své profily a inzeráty.
                </p>

                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3">🎉 Děkujeme za registraci!</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Váš profil byl vytvořen a čeká na schválení. Po schválení bude viditelný na webu.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                      Schválení obvykle trvá 1-24 hodin
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                      Můžete přidávat další profily dívek (pro podniky)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                      Upravujte si informace podle potřeby
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => router.push('/pridat-profil')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Přidat nový profil
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Info */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Můj účet</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{session?.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Typ účtu</p>
                    <p className="font-medium">Poskytovatel</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      Čeká na schválení
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Rychlé akce</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/nastaveni')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span>Nastavení</span>
                  </button>
                  <button
                    onClick={() => router.push('/profily')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    <span>Moje profily</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Odhlásit se</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
