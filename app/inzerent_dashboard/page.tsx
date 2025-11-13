'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Header from '@/components/Header';
import { Building2, User, Settings, LogOut, Plus, Eye, Edit, Trash2, LayoutDashboard, CreditCard, Users, CheckCircle, Clock, Star, TrendingUp, AlertCircle, Image as ImageIcon, Phone, Heart, X } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type MenuItem = 'dashboard' | 'business' | 'profiles' | 'statistics';

export default function InzerentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<MenuItem>('dashboard');
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [addProfileLoading, setAddProfileLoading] = useState(false);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [editBusinessLoading, setEditBusinessLoading] = useState(false);
  const [businessFormData, setBusinessFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    openingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },
  });
  const [businessPhotos, setBusinessPhotos] = useState<File[]>([]);
  const [businessPhotosPreviews, setBusinessPhotosPreviews] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState<'escort' | 'massage' | 'bdsm' | 'online'>('escort');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    description: '',
    height: '',
    weight: '',
    bust: '',
    hairColor: '',
    breastType: '',
    role: '',
    nationality: '',
    languages: [] as string[],
    orientation: '',
    tattoos: '',
    piercing: '',
    offersEscort: false,
    travels: false,
    services: [] as string[],
    photos: [] as File[],
    openingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },
  });

  // Profile limits
  const PROFILE_LIMIT = 10; // Free tier limit
  const totalProfiles = profiles.length; // Only count individual profiles, not businesses
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

    // Redirect admin to admin panel
    if (session?.user && session.user.role === 'ADMIN') {
      router.push('/admin_panel');
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

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      // Fetch all services and categorize them
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setAvailableServices(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  // Filter services by category for tabs
  const getServicesByCategory = (category: string) => {
    return availableServices.filter(s => s.description?.includes(category));
  };

  // Get available tabs based on business type
  const getAvailableTabs = () => {
    if (businesses.length === 0) return [];

    const businessType = businesses[0].profileType;

    if (businessType === 'PRIVAT' || businessType === 'ESCORT_AGENCY') {
      return ['escort'];
    } else if (businessType === 'MASSAGE_SALON') {
      return ['massage'];
    } else if (businessType === 'SWINGERS_CLUB' || businessType === 'NIGHT_CLUB' || businessType === 'STRIP_CLUB') {
      return ['bdsm'];
    } else if (businessType === 'DIGITAL_AGENCY') {
      return ['online'];
    }

    return ['escort']; // Default
  };

  const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
      'escort': 'Erotické služby',
      'massage': 'Masážní služby',
      'bdsm': 'BDSM praktiky',
      'online': 'Online služby'
    };
    return labels[tab] || tab;
  };

  useEffect(() => {
    if (showAddProfileModal) {
      fetchServices();
      // Set active tab based on business type
      const tabs = getAvailableTabs();
      if (tabs.length > 0) {
        setActiveServiceTab(tabs[0] as any);
      }
    }
  }, [showAddProfileModal]);

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.age) {
      alert('Vyplňte jméno a věk');
      return;
    }

    if (businesses.length === 0) {
      alert('Nemáte žádný podnik. Nejdřív vytvořte podnik.');
      return;
    }

    setAddProfileLoading(true);

    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          businessId: businesses[0].id, // První podnik
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Profil úspěšně přidán!');
        setShowAddProfileModal(false);
        setFormData({
          name: '',
          age: '',
          description: '',
          height: '',
          weight: '',
          bust: '',
          hairColor: '',
          breastType: '',
          role: '',
          nationality: '',
          languages: [],
          orientation: '',
          tattoos: '',
          piercing: '',
          offersEscort: false,
          travels: false,
          services: [],
          photos: [],
          openingHours: { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' }
        });
        // Reload data
        fetchUserData();
      } else {
        alert(data.error || 'Chyba při přidávání profilu');
      }
    } catch (error) {
      console.error('Error adding profile:', error);
      alert('Chyba při přidávání profilu');
    } finally {
      setAddProfileLoading(false);
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 10) // Max 10 fotek
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleOpenEditModal = (profile: any) => {
    setEditingProfile(profile);

    // Předvyplnit formulář aktuálními daty profilu
    setFormData({
      name: profile.name || '',
      age: profile.age?.toString() || '',
      description: profile.description || '',
      height: profile.height?.toString() || '',
      weight: profile.weight?.toString() || '',
      bust: profile.bust || '',
      hairColor: profile.hairColor || '',
      breastType: profile.breastType || '',
      role: profile.role || '',
      nationality: profile.nationality || '',
      languages: profile.languages ? JSON.parse(profile.languages) : [],
      orientation: profile.orientation || '',
      tattoos: profile.tattoos || '',
      piercing: profile.piercing || '',
      offersEscort: profile.offersEscort || false,
      travels: profile.travels || false,
      services: [], // Services se načtou zvlášť
      photos: [],
      openingHours: profile.openingHours || {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
      },
    });

    setShowEditProfileModal(true);
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProfile) return;

    setEditProfileLoading(true);

    try {
      // Připravit změny - pouze pole která se změnila
      const changes: any = {};

      if (formData.name !== editingProfile.name) changes.name = formData.name;
      if (parseInt(formData.age) !== editingProfile.age) changes.age = parseInt(formData.age);
      if (formData.description !== editingProfile.description) changes.description = formData.description;
      if (formData.height && parseInt(formData.height) !== editingProfile.height) changes.height = parseInt(formData.height);
      if (formData.weight && parseInt(formData.weight) !== editingProfile.weight) changes.weight = parseInt(formData.weight);
      if (formData.bust !== editingProfile.bust) changes.bust = formData.bust;
      if (formData.hairColor !== editingProfile.hairColor) changes.hairColor = formData.hairColor;
      if (formData.breastType !== editingProfile.breastType) changes.breastType = formData.breastType;
      if (formData.role !== editingProfile.role) changes.role = formData.role;
      if (formData.nationality !== editingProfile.nationality) changes.nationality = formData.nationality;
      if (formData.orientation !== editingProfile.orientation) changes.orientation = formData.orientation;
      if (formData.tattoos !== editingProfile.tattoos) changes.tattoos = formData.tattoos;
      if (formData.piercing !== editingProfile.piercing) changes.piercing = formData.piercing;
      if (formData.offersEscort !== editingProfile.offersEscort) changes.offersEscort = formData.offersEscort;
      if (formData.travels !== editingProfile.travels) changes.travels = formData.travels;

      // Languages jako JSON
      const newLanguages = JSON.stringify(formData.languages);
      const oldLanguages = editingProfile.languages || '[]';
      if (newLanguages !== oldLanguages) changes.languages = newLanguages;

      // Opening hours comparison
      const currentHours = editingProfile.openingHours || {};
      const newHours = formData.openingHours;
      if (JSON.stringify(currentHours) !== JSON.stringify(newHours)) {
        changes.openingHours = newHours;
      }

      if (Object.keys(changes).length === 0) {
        alert('Neprovedli jste žádné změny');
        setEditProfileLoading(false);
        return;
      }

      // Odeslat změny ke schválení
      const response = await fetch('/api/profiles/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: editingProfile.id,
          changes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Změny odeslány ke schválení administrátorem! Jakmile budou schváleny, projeví se na vašem profilu.');
        setShowEditProfileModal(false);
        setEditingProfile(null);
        // Reset form
        setFormData({
          name: '',
          age: '',
          description: '',
          height: '',
          weight: '',
          bust: '',
          hairColor: '',
          breastType: '',
          role: '',
          nationality: '',
          languages: [],
          orientation: '',
          tattoos: '',
          piercing: '',
          offersEscort: false,
          travels: false,
          services: [],
          photos: [],
          openingHours: {
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: '',
          },
        });
      } else {
        alert(data.error || 'Chyba při odesílání změn');
      }
    } catch (error) {
      console.error('Error editing profile:', error);
      alert('Chyba při odesílání změn');
    } finally {
      setEditProfileLoading(false);
    }
  };

  const handleOpenEditBusinessModal = (business: any) => {
    setEditingBusiness(business);
    setBusinessFormData({
      name: business.name || '',
      description: business.description || '',
      phone: business.phone || '',
      email: business.email || '',
      website: business.website || '',
      address: business.address || '',
      city: business.city || '',
      openingHours: business.openingHours || {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
      },
    });
    // Reset photo states
    setBusinessPhotos([]);
    setBusinessPhotosPreviews([]);
    setPhotosToDelete([]);
    setShowEditBusinessModal(true);
  };

  const handleEditBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    setEditBusinessLoading(true);

    try {
      const changes: any = {};

      // Compare each field
      if (businessFormData.name !== editingBusiness.name) changes.name = businessFormData.name;
      if (businessFormData.description !== editingBusiness.description) changes.description = businessFormData.description;
      if (businessFormData.phone !== editingBusiness.phone) changes.phone = businessFormData.phone;
      if (businessFormData.email !== editingBusiness.email) changes.email = businessFormData.email;
      if (businessFormData.website !== editingBusiness.website) changes.website = businessFormData.website;
      if (businessFormData.address !== editingBusiness.address) changes.address = businessFormData.address;
      if (businessFormData.city !== editingBusiness.city) changes.city = businessFormData.city;

      // Check if opening hours changed
      const currentHours = editingBusiness.openingHours || {};
      const newHours = businessFormData.openingHours;
      if (JSON.stringify(currentHours) !== JSON.stringify(newHours)) {
        changes.openingHours = newHours;
      }

      // Add photo changes
      const photoChanges: any = {};

      if (photosToDelete.length > 0) {
        photoChanges.photosToDelete = photosToDelete;
      }

      if (businessPhotos.length > 0) {
        // Convert photos to base64
        const photoPromises = businessPhotos.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        const base64Photos = await Promise.all(photoPromises);
        photoChanges.newPhotos = base64Photos;
      }

      if (Object.keys(photoChanges).length > 0) {
        changes.photoChanges = photoChanges;
      }

      if (Object.keys(changes).length === 0) {
        alert('Neprovedli jste žádné změny');
        setEditBusinessLoading(false);
        return;
      }

      const response = await fetch('/api/businesses/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: editingBusiness.id,
          changes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Změny odeslány ke schválení administrátorem!');
        setShowEditBusinessModal(false);
        setEditingBusiness(null);
        setBusinessFormData({
          name: '',
          description: '',
          phone: '',
          email: '',
          website: '',
          address: '',
          city: '',
          openingHours: {
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: '',
          },
        });
      } else {
        alert(data.error || 'Chyba při odesílání změn');
      }
    } catch (error) {
      console.error('Error editing business:', error);
      alert('Chyba při odesílání změn');
    } finally {
      setEditBusinessLoading(false);
    }
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
    { id: 'statistics' as MenuItem, label: 'Statistiky', icon: TrendingUp },
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

                  {/* Váš podnik */}
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Váš podnik</h2>
                    </div>

                    {businesses.length > 0 ? (
                      <div className="space-y-4">
                        {businesses.map((business) => (
                          <div key={business.id} className="border border-white/10 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold mb-1">{business.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <span>{business.city}</span>
                                  <span>•</span>
                                  <span>{business.phone}</span>
                                </div>
                                {business.description && (
                                  <p className="text-sm text-gray-400 mt-2">{business.description.substring(0, 100)}...</p>
                                )}
                              </div>
                              <button
                                onClick={() => setActiveSection('business')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                              >
                                <Edit className="w-4 h-4" />
                                Upravit
                              </button>
                            </div>

                            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                              <button
                                onClick={() => {
                                  if (!canAddMore) {
                                    alert(`Dosáhli jste limitu ${PROFILE_LIMIT} profilů. Pro přidání dalších profilů si prosím zakupte prémiový balíček.`);
                                    return;
                                  }
                                  setShowAddProfileModal(true);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity text-sm font-medium ${
                                  canAddMore
                                    ? 'gradient-primary hover:opacity-90'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!canAddMore}
                              >
                                <Plus className="w-4 h-4" />
                                Přidat profil
                              </button>
                              <span className="text-sm text-gray-400">
                                {canAddMore
                                  ? `Můžete přidat ještě ${remainingProfiles} ${remainingProfiles === 1 ? 'profil' : remainingProfiles < 5 ? 'profily' : 'profilů'}`
                                  : `Limit ${PROFILE_LIMIT} profilů dosažen`
                                }
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <h3 className="text-lg font-semibold mb-2">Žádný podnik</h3>
                        <p className="text-gray-400">Načítání informací o vašem podniku...</p>
                      </div>
                    )}
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
                          <button
                            onClick={() => handleOpenEditBusinessModal(business)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                          >
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
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Web</p>
                            <p className="font-medium">{business.website || '—'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Email</p>
                            <p className="font-medium">{business.email || '—'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-400 mb-1">Adresa</p>
                            <p className="font-medium">{business.address || '—'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-400 mb-1">Popis</p>
                            <p className="text-gray-300">{business.description || '—'}</p>
                          </div>
                          {business.openingHours && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-400 mb-2">Otevírací doba</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(business.openingHours as Record<string, string>).map(([day, hours]) => (
                                  <div key={day} className="text-sm">
                                    <span className="text-gray-400 capitalize">{day}:</span>
                                    <span className="ml-1 text-gray-200">{hours}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
                        onClick={() => setShowAddProfileModal(true)}
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
                          <div className="flex items-start gap-4 mb-4">
                            {/* Fotka profilu */}
                            <div className="flex-shrink-0">
                              {profile.photos && profile.photos.length > 0 ? (
                                <img
                                  src={profile.photos[0].url}
                                  alt={profile.name}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-24 h-24 bg-white/5 rounded-lg flex items-center justify-center">
                                  <User className="w-12 h-12 text-gray-600" />
                                </div>
                              )}
                            </div>

                            {/* Informace o profilu */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-bold">{profile.name}</h3>
                                  <p className="text-sm text-gray-400">{profile.city}</p>
                                </div>
                                <div className="flex flex-col gap-1">
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
                              </div>
                              {profile.description && (
                                <p className="text-sm text-gray-300 mb-2 line-clamp-2">{profile.description}</p>
                              )}
                              <div className="text-xs text-gray-400">
                                <span>📸 {profile.photos?.length || 0} fotek</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEditModal(profile)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Upravit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Opravdu chcete smazat profil ${profile.name}?`)) {
                                  alert('Funkce smazání bude brzy k dispozici');
                                }
                              }}
                              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
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
                      <button
                        onClick={() => setShowAddProfileModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 gradient-primary rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-5 h-5" />
                        Přidat první profil
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics */}
              {activeSection === 'statistics' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Statistiky</h1>
                    <p className="text-gray-400">Detailní přehled návštěvnosti a výkonu vašich profilů</p>
                  </div>

                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-primary-400" />
                        <h3 className="font-semibold text-sm">Zobrazení profilu</h3>
                      </div>
                      <p className="text-2xl font-bold">{totalViews.toLocaleString('cs-CZ')}</p>
                      <p className="text-xs text-green-400 mt-1">+12% tento týden</p>
                    </div>

                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="w-5 h-5 text-primary-400" />
                        <h3 className="font-semibold text-sm">Kliknutí na telefon</h3>
                      </div>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-gray-400 mt-1">Za posledních 7 dní</p>
                    </div>

                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-5 h-5 text-primary-400" />
                        <h3 className="font-semibold text-sm">Oblíbené</h3>
                      </div>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-gray-400 mt-1">Přidání do oblíbených</p>
                    </div>

                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-semibold text-sm">Průměrné hodnocení</h3>
                      </div>
                      <p className="text-2xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</p>
                      <p className="text-xs text-gray-400 mt-1">Z {totalReviews} hodnocení</p>
                    </div>
                  </div>

                  {/* Visitor Chart */}
                  <div className="glass rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6">Návštěvnost (posledních 30 dní)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={[
                          { date: '1.1', views: 0 },
                          { date: '2.1', views: 0 },
                          { date: '3.1', views: 0 },
                          { date: '4.1', views: 0 },
                          { date: '5.1', views: 0 },
                          { date: '6.1', views: 0 },
                          { date: '7.1', views: 0 },
                          { date: '8.1', views: 0 },
                          { date: '9.1', views: 0 },
                          { date: '10.1', views: 0 },
                          { date: '11.1', views: 0 },
                          { date: '12.1', views: 0 },
                          { date: '13.1', views: 0 },
                          { date: '14.1', views: 0 },
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="#ec4899"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorViews)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Profile Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Individual Profile Stats */}
                    <div className="glass rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-4">Výkon jednotlivých profilů</h2>
                      {profiles.length > 0 || businesses.length > 0 ? (
                        <div className="space-y-4">
                          {profiles.map((profile) => (
                            <div key={profile.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div>
                                <h3 className="font-semibold">{profile.name}</h3>
                                <p className="text-sm text-gray-400">{profile.city}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">{profile.viewCount || 0}</p>
                                <p className="text-xs text-gray-400">zobrazení</p>
                              </div>
                            </div>
                          ))}
                          {businesses.map((business) => (
                            <div key={business.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div>
                                <h3 className="font-semibold">{business.name}</h3>
                                <p className="text-sm text-gray-400">{business.city}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">{business.viewCount || 0}</p>
                                <p className="text-xs text-gray-400">zobrazení</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-8">Zatím nemáte žádné profily</p>
                      )}
                    </div>

                    {/* Improvement Tips */}
                    <div className="glass rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-yellow-400" />
                        Tipy na zlepšení
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <ImageIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-yellow-400 mb-1">Přidejte více fotek</h3>
                            <p className="text-sm text-gray-300">Profily s 5+ fotkami mají až 3x více zobrazení</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <Edit className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-blue-400 mb-1">Vyplňte popis</h3>
                            <p className="text-sm text-gray-300">Podrobný popis zvyšuje důvěryhodnost a zájem</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-green-400 mb-1">Získejte ověření</h3>
                            <p className="text-sm text-gray-300">Ověřené profily získávají 2x více kontaktů</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <Clock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-purple-400 mb-1">Aktualizujte pravidelně</h3>
                            <p className="text-sm text-gray-300">Pravidelné aktualizace drží profil v popředí</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Completeness */}
                  <div className="glass rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">Úplnost profilu</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Celková úplnost</span>
                          <span className="text-sm font-bold text-primary-400">45%</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary-500 to-pink-500" style={{ width: '45%' }}></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Kompletní profily získají až 5x více zobrazení</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-sm">Základní informace</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg opacity-50">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="text-sm">Fotografie (0/5)</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg opacity-50">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="text-sm">Detailní popis</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg opacity-50">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="text-sm">Ověření profilu</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Upravit profil - {editingProfile.name}</h2>
                <button
                  onClick={() => {
                    setShowEditProfileModal(false);
                    setEditingProfile(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>Upozornění:</strong> Všechny změny musí být schváleny administrátorem. Jakmile budou schváleny, projeví se na vašem profilu.
                </p>
              </div>

              <form onSubmit={handleEditProfile} className="space-y-6">
                {/* Jméno */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Jméno <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="Např. Adéla"
                    required
                  />
                </div>

                {/* Věk */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Věk <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="18"
                    required
                  />
                </div>

                {/* Popis */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Popis
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors resize-none"
                    placeholder="Napište něco o sobě..."
                  />
                </div>

                {/* Fyzické vlastnosti */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Výška (cm)
                    </label>
                    <input
                      type="number"
                      min="140"
                      max="200"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                      placeholder="165"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Váha (kg)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="150"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                      placeholder="55"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Velikost prsou
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData({ ...formData, bust: size.toString() })}
                          className={`px-4 py-3 rounded-lg border-2 transition-all font-bold text-lg ${
                            formData.bust === size.toString()
                              ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Další vlastnosti - grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Barva vlasů */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Barva vlasů
                    </label>
                    <select
                      value={formData.hairColor}
                      onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="blonde">Blond</option>
                      <option value="brunette">Hnědá</option>
                      <option value="black">Černá</option>
                      <option value="red">Zrzavá</option>
                      <option value="other">Jiná</option>
                    </select>
                  </div>

                  {/* Typ prsou */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Typ prsou
                    </label>
                    <select
                      value={formData.breastType}
                      onChange={(e) => setFormData({ ...formData, breastType: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="natural">Přírodní</option>
                      <option value="silicone">Silikonová</option>
                    </select>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="active">Aktivní</option>
                      <option value="passive">Pasivní</option>
                      <option value="switch">Switch</option>
                      <option value="dominant">Dominantní</option>
                      <option value="submissive">Submisivní</option>
                    </select>
                  </div>

                  {/* Národnost */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Národnost
                    </label>
                    <select
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="czech">Česká</option>
                      <option value="slovak">Slovenská</option>
                      <option value="polish">Polská</option>
                      <option value="ukrainian">Ukrajinská</option>
                      <option value="russian">Ruská</option>
                      <option value="romanian">Rumunská</option>
                      <option value="bulgarian">Bulharská</option>
                      <option value="hungarian">Maďarská</option>
                      <option value="other">Jiná</option>
                    </select>
                  </div>
                </div>

                {/* Možnosti služeb */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.offersEscort}
                      onChange={(e) => setFormData({ ...formData, offersEscort: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm">Nabízí escort doprovod</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.travels}
                      onChange={(e) => setFormData({ ...formData, travels: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm">Cestuje za klienty</span>
                  </label>
                </div>

                {/* Opening Hours */}
                <div className="space-y-4 border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-white">Otevírací doba</h3>
                  <p className="text-sm text-gray-400">Zadejte otevírací dobu pro jednotlivé dny (např. "9:00-22:00" nebo "Zavřeno")</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const dayLabels: Record<string, string> = {
                        monday: 'Pondělí',
                        tuesday: 'Úterý',
                        wednesday: 'Středa',
                        thursday: 'Čtvrtek',
                        friday: 'Pátek',
                        saturday: 'Sobota',
                        sunday: 'Neděle',
                      };

                      return (
                        <div key={day}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {dayLabels[day]}
                          </label>
                          <input
                            type="text"
                            value={formData.openingHours[day as keyof typeof formData.openingHours]}
                            onChange={(e) => setFormData({
                              ...formData,
                              openingHours: {
                                ...formData.openingHours,
                                [day]: e.target.value,
                              },
                            })}
                            placeholder="9:00-22:00"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditProfileModal(false);
                      setEditingProfile(null);
                    }}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    disabled={editProfileLoading}
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 gradient-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    disabled={editProfileLoading}
                  >
                    {editProfileLoading ? 'Odesílám změny...' : 'Odeslat ke schválení'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {showAddProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Přidat nový profil</h2>
                <button
                  onClick={() => setShowAddProfileModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {businesses.length > 0 && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>Podnik:</strong> {businesses[0].name}
                  </p>
                  <p className="text-sm text-blue-300">
                    <strong>Telefon:</strong> {businesses[0].phone} (bude použit pro všechny profily)
                  </p>
                  <p className="text-sm text-blue-300">
                    <strong>Město:</strong> {businesses[0].city}
                  </p>
                </div>
              )}

              <form onSubmit={handleAddProfile} className="space-y-6">
                {/* Jméno */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Jméno <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="Např. Adéla"
                    required
                  />
                </div>

                {/* Věk */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Věk <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="18"
                    required
                  />
                </div>

                {/* Popis */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Popis
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors resize-none"
                    placeholder="Napište něco o sobě..."
                  />
                </div>

                {/* Fotky */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Fotografie (max 10)
                  </label>

                  {/* Upload tlačítko */}
                  <div className="mb-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-lg hover:border-primary-400 hover:bg-white/10 transition-all">
                        <ImageIcon className="w-5 h-5" />
                        <span>Klikněte pro výběr fotek</span>
                      </div>
                    </label>
                  </div>

                  {/* Náhled nahraných fotek */}
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-5 gap-3">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Fotka ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Nahráno: {formData.photos.length}/10 fotek
                  </p>
                </div>

                {/* Fyzické vlastnosti */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Výška (cm)
                    </label>
                    <input
                      type="number"
                      min="140"
                      max="200"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                      placeholder="165"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Váha (kg)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="150"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                      placeholder="55"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Velikost prsou
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData({ ...formData, bust: size.toString() })}
                          className={`px-4 py-3 rounded-lg border-2 transition-all font-bold text-lg ${
                            formData.bust === size.toString()
                              ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Možnosti služeb */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.offersEscort}
                      onChange={(e) => setFormData({ ...formData, offersEscort: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm">Nabízí escort doprovod</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.travels}
                      onChange={(e) => setFormData({ ...formData, travels: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm">Cestuje za klienty</span>
                  </label>
                </div>

                {/* Další vlastnosti - grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Barva vlasů */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Barva vlasů
                    </label>
                    <select
                      value={formData.hairColor}
                      onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="blonde">Blond</option>
                      <option value="brunette">Hnědá</option>
                      <option value="black">Černá</option>
                      <option value="red">Zrzavá</option>
                      <option value="other">Jiná</option>
                    </select>
                  </div>

                  {/* Typ prsou */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Typ prsou
                    </label>
                    <select
                      value={formData.breastType}
                      onChange={(e) => setFormData({ ...formData, breastType: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="natural">Přírodní</option>
                      <option value="silicone">Silikonová</option>
                    </select>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="active">Aktivní</option>
                      <option value="passive">Pasivní</option>
                      <option value="switch">Switch</option>
                      <option value="dominant">Dominantní</option>
                      <option value="submissive">Submisivní</option>
                    </select>
                  </div>

                  {/* Národnost */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Národnost
                    </label>
                    <select
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="czech">Česká</option>
                      <option value="slovak">Slovenská</option>
                      <option value="polish">Polská</option>
                      <option value="ukrainian">Ukrajinská</option>
                      <option value="russian">Ruská</option>
                      <option value="romanian">Rumunská</option>
                      <option value="bulgarian">Bulharská</option>
                      <option value="hungarian">Maďarská</option>
                      <option value="other">Jiná</option>
                    </select>
                  </div>

                  {/* Orientace */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Orientace
                    </label>
                    <select
                      value={formData.orientation}
                      onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="hetero">Heterosexuální</option>
                      <option value="bi">Bisexuální</option>
                      <option value="lesbian">Lesbická</option>
                      <option value="gay">Gay</option>
                    </select>
                  </div>

                  {/* Tetování */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tetování
                    </label>
                    <select
                      value={formData.tattoos}
                      onChange={(e) => setFormData({ ...formData, tattoos: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="none">Bez tetování</option>
                      <option value="small">Malá tetování</option>
                      <option value="medium">Střední tetování</option>
                      <option value="large">Velká tetování</option>
                    </select>
                  </div>

                  {/* Piercing */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Piercing
                    </label>
                    <select
                      value={formData.piercing}
                      onChange={(e) => setFormData({ ...formData, piercing: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte...</option>
                      <option value="none">Bez piercingu</option>
                      <option value="ears">Jen uši</option>
                      <option value="multiple">Více piercingů</option>
                    </select>
                  </div>
                </div>

                {/* Jazyky */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Jazyky
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Čeština', 'Angličtina', 'Němčina', 'Ruština', 'Slovenština', 'Polština', 'Španělština', 'Francouzština'].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageToggle(lang)}
                        className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                          formData.languages.includes(lang)
                            ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                            : 'border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Služby s taby */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Nabízené služby (volitelné)
                  </label>

                  {servicesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-gray-400 mt-2">Načítám služby...</p>
                    </div>
                  ) : (
                    <>
                      {/* Taby - zobrazit jen podle typu podniku */}
                      {getAvailableTabs().length > 1 && (
                        <div className="flex gap-2 mb-4 bg-white/5 p-1 rounded-lg">
                          {getAvailableTabs().map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setActiveServiceTab(tab as any)}
                              className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium ${
                                activeServiceTab === tab
                                  ? 'bg-primary-500 text-white'
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              {getTabLabel(tab)}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Pokud je jen 1 tab, ukázat název */}
                      {getAvailableTabs().length === 1 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 font-medium">
                            Kategorie: {getTabLabel(getAvailableTabs()[0])}
                          </p>
                        </div>
                      )}

                      {/* Služby podle aktivního tabu */}
                      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-2 bg-white/5 rounded-lg">
                        {activeServiceTab === 'escort' && getServicesByCategory('Escort').map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceToggle(service.id)}
                            className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                              formData.services.includes(service.id)
                                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                : 'border-white/10 hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            {service.name}
                          </button>
                        ))}

                        {activeServiceTab === 'massage' && getServicesByCategory('Masáže').map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceToggle(service.id)}
                            className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                              formData.services.includes(service.id)
                                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                : 'border-white/10 hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            {service.name}
                          </button>
                        ))}

                        {activeServiceTab === 'bdsm' && getServicesByCategory('BDSM').map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceToggle(service.id)}
                            className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                              formData.services.includes(service.id)
                                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                : 'border-white/10 hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            {service.name}
                          </button>
                        ))}

                        {activeServiceTab === 'online' && getServicesByCategory('Online').map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceToggle(service.id)}
                            className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                              formData.services.includes(service.id)
                                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                : 'border-white/10 hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            {service.name}
                          </button>
                        ))}
                      </div>

                      {/* Počet vybraných služeb */}
                      <p className="text-xs text-gray-400 mt-2">
                        Vybráno služeb: {formData.services.length}
                      </p>
                    </>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddProfileModal(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    disabled={addProfileLoading}
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 gradient-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    disabled={addProfileLoading}
                  >
                    {addProfileLoading ? 'Přidávám...' : 'Přidat profil'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {showEditBusinessModal && editingBusiness && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-dark-800 border-b border-white/10 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold">Upravit podnik</h2>
                <p className="text-gray-400 text-sm mt-1">Změny musí být schváleny administrátorem</p>
              </div>
              <button
                onClick={() => setShowEditBusinessModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditBusiness} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Základní informace</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Název podniku <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={businessFormData.name}
                    onChange={(e) => setBusinessFormData({ ...businessFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Popis
                  </label>
                  <textarea
                    value={businessFormData.description}
                    onChange={(e) => setBusinessFormData({ ...businessFormData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Kontaktní údaje</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Telefon <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={businessFormData.phone}
                      onChange={(e) => setBusinessFormData({ ...businessFormData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={businessFormData.email}
                      onChange={(e) => setBusinessFormData({ ...businessFormData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Web
                  </label>
                  <input
                    type="url"
                    value={businessFormData.website}
                    onChange={(e) => setBusinessFormData({ ...businessFormData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Adresa</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Město <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={businessFormData.city}
                      onChange={(e) => setBusinessFormData({ ...businessFormData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">Vyberte město</option>
                      <option value="Praha">Praha</option>
                      <option value="Brno">Brno</option>
                      <option value="Ostrava">Ostrava</option>
                      <option value="Plzeň">Plzeň</option>
                      <option value="Liberec">Liberec</option>
                      <option value="Olomouc">Olomouc</option>
                      <option value="České Budějovice">České Budějovice</option>
                      <option value="Hradec Králové">Hradec Králové</option>
                      <option value="Pardubice">Pardubice</option>
                      <option value="Zlín">Zlín</option>
                      <option value="Jiné">Jiné</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Adresa
                    </label>
                    <input
                      type="text"
                      value={businessFormData.address}
                      onChange={(e) => setBusinessFormData({ ...businessFormData, address: e.target.value })}
                      placeholder="Ulice a číslo popisné"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Otevírací doba</h3>
                <p className="text-sm text-gray-400">Zadejte otevírací dobu pro jednotlivé dny (např. "9:00-22:00" nebo "Zavřeno")</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const dayLabels: Record<string, string> = {
                      monday: 'Pondělí',
                      tuesday: 'Úterý',
                      wednesday: 'Středa',
                      thursday: 'Čtvrtek',
                      friday: 'Pátek',
                      saturday: 'Sobota',
                      sunday: 'Neděle',
                    };

                    return (
                      <div key={day}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {dayLabels[day]}
                        </label>
                        <input
                          type="text"
                          value={businessFormData.openingHours[day as keyof typeof businessFormData.openingHours]}
                          onChange={(e) => setBusinessFormData({
                            ...businessFormData,
                            openingHours: {
                              ...businessFormData.openingHours,
                              [day]: e.target.value,
                            },
                          })}
                          placeholder="9:00-22:00"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photos Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Fotky podniku</h3>

                {/* Existing Photos */}
                {editingBusiness?.photos && editingBusiness.photos.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-3">Současné fotky (klikněte na fotku pro smazání)</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {editingBusiness.photos.map((photo: any, index: number) => (
                        <div
                          key={photo.id}
                          className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                            photosToDelete.includes(photo.id)
                              ? 'border-red-500 opacity-50'
                              : 'border-transparent hover:border-primary-400'
                          }`}
                          onClick={() => {
                            if (photosToDelete.includes(photo.id)) {
                              setPhotosToDelete(photosToDelete.filter(id => id !== photo.id));
                            } else {
                              setPhotosToDelete([...photosToDelete, photo.id]);
                            }
                          }}
                        >
                          <img
                            src={photo.url}
                            alt={`Fotka ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {photosToDelete.includes(photo.id) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                              <Trash2 className="w-8 h-8 text-red-400" />
                            </div>
                          )}
                          {photo.isMain && (
                            <div className="absolute top-1 left-1 px-2 py-0.5 bg-primary-500 rounded text-[10px] font-bold">
                              HLAVNÍ
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {photosToDelete.length > 0 && (
                      <p className="text-xs text-red-400 mt-2">
                        {photosToDelete.length} {photosToDelete.length === 1 ? 'fotka' : 'fotky'} bude smazána
                      </p>
                    )}
                  </div>
                )}

                {/* Add New Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Přidat nové fotky
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);

                      // Kontrola formátů - odmítnout HEIC
                      const invalidFiles = files.filter(file => {
                        const extension = file.name.split('.').pop()?.toLowerCase();
                        return extension === 'heic' || extension === 'heif';
                      });

                      if (invalidFiles.length > 0) {
                        alert('HEIC formát není podporován. Použijte prosím JPG, PNG nebo WEBP. Na iPhone: Nastavení → Fotoaparát → Formáty → "Nejvíce kompatibilní"');
                        return;
                      }

                      setBusinessPhotos(files);

                      // Generate previews
                      const previews: string[] = [];
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          previews.push(reader.result as string);
                          if (previews.length === files.length) {
                            setBusinessPhotosPreviews(previews);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Podporované formáty: JPG, PNG, WEBP. Maximum 10 fotek.
                  </p>
                </div>

                {/* New Photos Preview */}
                {businessPhotosPreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-3">Náhled nových fotek ({businessPhotosPreviews.length})</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {businessPhotosPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-500">
                          <img
                            src={preview}
                            alt={`Nová fotka ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 px-2 py-0.5 bg-green-500 rounded text-[10px] font-bold">
                            NOVÁ
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditBusinessModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 gradient-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={editBusinessLoading}
                >
                  {editBusinessLoading ? 'Odesílám...' : 'Odeslat ke schválení'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
