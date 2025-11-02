'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Header from '@/components/Header';
import { Building2, User, Settings, LogOut, Plus, Eye, Edit, Trash2, LayoutDashboard, CreditCard, Users, CheckCircle, Clock, Star } from 'lucide-react';

type MenuItem = 'dashboard' | 'business' | 'profiles';

export default function InzerentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<MenuItem>('dashboard');

  // Profile limits
  const PROFILE_LIMIT = 10; // Free tier limit
  const totalProfiles = profiles.length + businesses.length;
  const remainingProfiles = PROFILE_LIMIT - totalProfiles;
  const canAddMore = totalProfiles < PROFILE_LIMIT;

  // Calculate statistics
  const totalViews = profiles.reduce((sum, p) => sum + (p.viewCount || 0), 0) +
                     businesses.reduce((sum, b) => sum + (b.viewCount || 0), 0);

  const totalReviews = profiles.reduce((sum, p) => sum + (p.reviewCount || 0), 0) +
                       businesses.reduce((sum, b) => sum + (b.reviewCount || 0), 0);

  const avgRating = totalProfiles > 0
    ? (profiles.reduce((sum, p) => sum + (p.rating || 0), 0) +
       businesses.reduce((sum, b) => sum + (b.rating || 0), 0)) / totalProfiles
    : 0;

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

  if (loading || status === 'loading') {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-400">Načítám dashboard...</p>
        </div>
      </main>
    );
  }

  const menuItems = [
    { id: 'dashboard' as MenuItem, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'business' as MenuItem, label: 'Informace o podniku', icon: Building2 },
    { id: 'profiles' as MenuItem, label: 'Profily', icon: Users },
  ];

  return (
    <main className="min-h-screen bg-dark-900">
      <Header />

      <div className="pt-20">
        <div className="flex min-h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <aside className="hidden md:block w-64 glass border-r border-white/5 p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Admin Panel</h2>
              <p className="text-sm text-gray-400 truncate">{session?.user?.email}</p>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                      activeSection === item.id
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Odhlásit se</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">

              {/* Dashboard Overview */}
              {activeSection === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                    <p className="text-gray-400">Přehled vašich profilů a statistik</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Aktivní profily</h3>
                        <Users className="w-6 h-6 text-primary-400" />
                      </div>
                      <p className="text-3xl font-bold">
                        {totalProfiles}/{PROFILE_LIMIT}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {profiles.length} solo • {businesses.length} podniků
                      </p>
                      <p className={`text-sm font-medium mt-2 ${remainingProfiles > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {remainingProfiles > 0 ? `Zbývá ${remainingProfiles} ${remainingProfiles === 1 ? 'profil' : remainingProfiles < 5 ? 'profily' : 'profilů'}` : 'Limit dosažen'}
                      </p>
                    </div>

                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Zobrazení</h3>
                        <Eye className="w-6 h-6 text-primary-400" />
                      </div>
                      <p className="text-3xl font-bold">{totalViews.toLocaleString('cs-CZ')}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {totalViews === 0 ? 'Zatím bez zobrazení' : 'Celkem zobrazení'}
                      </p>
                    </div>

                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Hodnocení</h3>
                        <Star className="w-6 h-6 text-yellow-400" />
                      </div>
                      <p className="text-3xl font-bold">
                        {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {totalReviews > 0 ? `Z ${totalReviews} hodnocení` : 'Zatím bez hodnocení'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="glass rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">Rychlé akce</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setActiveSection('business')}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-white/10 text-left"
                      >
                        <Building2 className="w-8 h-8 text-primary-400" />
                        <div>
                          <h3 className="font-semibold">Upravit podnik</h3>
                          <p className="text-sm text-gray-400">Změnit informace o podniku</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveSection('profiles')}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-white/10 text-left"
                      >
                        <Users className="w-8 h-8 text-primary-400" />
                        <div>
                          <h3 className="font-semibold">Spravovat profily</h3>
                          <p className="text-sm text-gray-400">Přidat nebo upravit profily</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Info */}
              {activeSection === 'business' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Informace o podniku</h1>
                    <p className="text-gray-400">Upravte údaje o vašem podniku</p>
                  </div>

                  {businesses.length > 0 ? (
                    businesses.map((business) => (
                      <div key={business.id} className="glass rounded-xl p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h2 className="text-2xl font-bold mb-2">{business.name}</h2>
                            <div className="flex items-center gap-2">
                              {business.verified ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">
                                  <CheckCircle className="w-4 h-4" />
                                  Ověřeno
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm">
                                  <Clock className="w-4 h-4" />
                                  Čeká na schválení
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors">
                            <Edit className="w-4 h-4" />
                            Upravit
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Telefon</p>
                            <p className="font-medium">{business.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Město</p>
                            <p className="font-medium">{business.city}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-400 mb-1">Adresa</p>
                            <p className="font-medium">{business.address || '—'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-400 mb-1">Popis</p>
                            <p className="text-gray-300">{business.description || '—'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass rounded-xl p-12 text-center">
                      <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <h3 className="text-xl font-semibold mb-2">Žádný podnik</h3>
                      <p className="text-gray-400 mb-6">Nemáte ještě žádný registrovaný podnik</p>
                    </div>
                  )}
                </div>
              )}

              {/* Profiles */}
              {activeSection === 'profiles' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Profily</h1>
                      <p className="text-gray-400">
                        Spravujte profily vašich dívek •
                        <span className={`ml-2 font-semibold ${remainingProfiles > 0 ? 'text-primary-400' : 'text-red-400'}`}>
                          {totalProfiles}/{PROFILE_LIMIT} použito
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          canAddMore
                            ? 'gradient-primary hover:opacity-90'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!canAddMore}
                      >
                        <Plus className="w-5 h-5" />
                        Přidat profil
                      </button>
                      {!canAddMore && (
                        <p className="text-xs text-red-400">Dosažen limit profilů</p>
                      )}
                      {canAddMore && remainingProfiles <= 3 && (
                        <p className="text-xs text-yellow-400">Zbývá {remainingProfiles} {remainingProfiles === 1 ? 'profil' : 'profily'}</p>
                      )}
                    </div>
                  </div>

                  {profiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profiles.map((profile) => (
                        <div key={profile.id} className="glass rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold">{profile.name}</h3>
                              <p className="text-sm text-gray-400">{profile.city}</p>
                            </div>
                            {profile.verified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Ověřeno
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs">
                                <Clock className="w-3 h-3" />
                                Čeká
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mb-4">{profile.description?.substring(0, 100)}...</p>
                          <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors">
                              <Edit className="w-4 h-4" />
                              Upravit
                            </button>
                            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass rounded-xl p-12 text-center">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <h3 className="text-xl font-semibold mb-2">Žádné profily</h3>
                      <p className="text-gray-400 mb-6">Přidejte první profil své dívky</p>
                      <button className="inline-flex items-center gap-2 px-6 py-3 gradient-primary rounded-lg hover:opacity-90 transition-opacity">
                        <Plus className="w-5 h-5" />
                        Přidat první profil
                      </button>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
