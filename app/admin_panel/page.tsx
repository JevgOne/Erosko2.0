'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import {
  LayoutDashboard, Users, Building2, UserCircle, MessageSquare,
  CreditCard, Image as ImageIcon, CheckCircle, XCircle, Eye, Edit,
  TrendingUp, AlertCircle, Shield, Search, Plus
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type MenuItem = 'dashboard' | 'users' | 'businesses' | 'profiles' | 'pending-changes' | 'reviews' | 'payments' | 'banners';

export default function AdminPanel() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState<MenuItem>('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [businessFilter, setBusinessFilter] = useState<'all' | 'pending_approval' | 'pending_verification'>('all');

  // Search and expand states for users
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Business edit modal states
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
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

  // Add new business modal states
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [newBusinessFormData, setNewBusinessFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    profileType: 'PRIVAT',
    equipment: [] as string[],
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
  const [newBusinessPhotos, setNewBusinessPhotos] = useState<File[]>([]);
  const [newBusinessPhotosPreviews, setNewBusinessPhotosPreviews] = useState<string[]>([]);

  // Add new profile modal states
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newProfileFormData, setNewProfileFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    category: 'HOLKY_NA_SEX',
    description: '',
    businessId: '',
    services: [] as string[], // Array of service IDs
  });
  const [newProfilePhotos, setNewProfilePhotos] = useState<File[]>([]);
  const [newProfilePhotosPreviews, setNewProfilePhotosPreviews] = useState<string[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]); // All services from database

  // Edit profile modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [editProfileFormData, setEditProfileFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    location: '',
    category: 'HOLKY_NA_SEX',
    description: '',
    businessId: '',
    services: [] as string[],
    isOnline: false,
  });
  const [editProfilePhotos, setEditProfilePhotos] = useState<File[]>([]);
  const [editProfilePhotosPreviews, setEditProfilePhotosPreviews] = useState<string[]>([]);
  const [editPhotosToDelete, setEditPhotosToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/prihlaseni');
      return;
    }

    // Check if user is admin
    if (session?.user && session.user.role !== 'ADMIN') {
      router.push('/inzerent_dashboard');
      return;
    }

    if (session?.user) {
      fetchAdminData();
    }
  }, [status, session, router]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      console.log('[Admin Panel] Fetching admin data...');
      const [statsRes, usersRes, businessesRes, profilesRes, changesRes, servicesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/businesses'),
        fetch('/api/admin/profiles'),
        fetch('/api/admin/pending-changes'),
        fetch('/api/services'),
      ]);

      console.log('[Admin Panel] API responses:', {
        stats: statsRes.status,
        users: usersRes.status,
        businesses: businessesRes.status,
        profiles: profilesRes.status,
        changes: changesRes.status
      });

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      } else {
        console.error('[Admin Panel] Stats API failed:', statsRes.status, await statsRes.text());
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        console.log('[Admin Panel] Users loaded:', data.users?.length || 0);
        setUsers(data.users || []);
      } else {
        console.error('[Admin Panel] Users API failed:', usersRes.status, await usersRes.text());
      }

      if (businessesRes.ok) {
        const data = await businessesRes.json();
        console.log('[Admin Panel] Businesses loaded:', data.businesses?.length || 0);
        setBusinesses(data.businesses || []);
      } else {
        console.error('[Admin Panel] Businesses API failed:', businessesRes.status, await businessesRes.text());
      }

      if (profilesRes.ok) {
        const data = await profilesRes.json();
        console.log('[Admin Panel] Profiles API response:', data);
        console.log('[Admin Panel] Profiles loaded:', data.profiles?.length || 0);
        setProfiles(data.profiles || []);
      } else {
        console.error('[Admin Panel] Profiles API failed:', profilesRes.status, await profilesRes.text());
      }

      if (changesRes.ok) {
        const data = await changesRes.json();
        console.log('[Admin Panel] Changes loaded:', data.changes?.length || 0);
        setPendingChanges(data.changes || []);
      } else {
        console.error('[Admin Panel] Changes API failed:', changesRes.status, await changesRes.text());
      }

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        console.log('[Admin Panel] Services loaded:', data.services?.length || 0);
        setAllServices(data.services || []);
      } else {
        console.error('[Admin Panel] Services API failed:', servicesRes.status, await servicesRes.text());
      }
    } catch (error) {
      console.error('[Admin Panel] Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type: 'business' | 'profile', id: string, approved: boolean) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, approved }),
      });

      if (response.ok) {
        fetchAdminData(); // Reload data
        alert(approved ? 'Úspěšně schváleno!' : 'Schválení zrušeno');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Chyba při schvalování');
    }
  };

  const handleVerify = async (type: 'business' | 'profile', id: string, verified: boolean) => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, verified }),
      });

      if (response.ok) {
        fetchAdminData(); // Reload data
        alert(verified ? 'Úspěšně ověřeno!' : 'Ověření zrušeno');
      }
    } catch (error) {
      console.error('Error verifying:', error);
      alert('Chyba při ověřování');
    }
  };

  const handleReviewChange = async (changeId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch('/api/admin/pending-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeId, action, notes }),
      });

      if (response.ok) {
        fetchAdminData(); // Reload data
        alert(action === 'approve' ? 'Změna schválena!' : 'Změna zamítnuta');
      } else {
        const data = await response.json();
        alert(data.error || 'Chyba při zpracování změny');
      }
    } catch (error) {
      console.error('Error reviewing change:', error);
      alert('Chyba při zpracování změny');
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (!confirm('Opravdu chcete smazat tento podnik? Tato akce je nevratná.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/businesses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (response.ok) {
        fetchAdminData(); // Reload data
        alert('Podnik úspěšně smazán!');
      } else {
        const data = await response.json();
        alert(data.error || 'Chyba při mazání podniku');
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Chyba při mazání podniku');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Opravdu chcete smazat tento profil? Tato akce je nevratná.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/profiles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      });

      if (response.ok) {
        fetchAdminData(); // Reload data
        alert('Profil úspěšně smazán!');
      } else {
        const data = await response.json();
        alert(data.error || 'Chyba při mazání profilu');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Chyba při mazání profilu');
    }
  };

  const handleEditBusinessOpen = (business: any) => {
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
    setBusinessPhotos([]);
    setBusinessPhotosPreviews([]);
    setPhotosToDelete([]);
    setShowEditBusinessModal(true);
  };

  const handleEditBusinessSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    try {
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

      // Prepare data
      const data: any = { ...businessFormData };

      if (photosToDelete.length > 0 || base64Photos.length > 0) {
        data.photoChanges = {
          photosToDelete: photosToDelete.length > 0 ? photosToDelete : undefined,
          newPhotos: base64Photos.length > 0 ? base64Photos : undefined,
        };
      }

      // Send to API
      const response = await fetch('/api/admin/businesses/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: editingBusiness.id, data }),
      });

      if (response.ok) {
        alert('Podnik úspěšně upraven!');
        setShowEditBusinessModal(false);
        setEditingBusiness(null);
        fetchAdminData(); // Reload
      } else {
        const result = await response.json();
        alert(result.error || 'Chyba při úpravě podniku');
      }
    } catch (error) {
      console.error('Error editing business:', error);
      alert('Chyba při úpravě podniku');
    }
  };

  // Add new business handlers
  const handleAddBusinessOpen = () => {
    setNewBusinessFormData({
      name: '',
      description: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      city: '',
      profileType: 'PRIVAT',
      equipment: [],
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
    setNewBusinessPhotos([]);
    setNewBusinessPhotosPreviews([]);
    setShowAddBusinessModal(true);
  };

  const handleAddBusinessSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!newBusinessFormData.name || !newBusinessFormData.phone || !newBusinessFormData.city) {
        alert('Vyplňte prosím povinná pole: Název, Telefon, Město');
        return;
      }

      // Convert photos to base64
      const photoPromises = newBusinessPhotos.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      const base64Photos = await Promise.all(photoPromises);

      // Prepare data
      const data = {
        ...newBusinessFormData,
        photos: base64Photos.length > 0 ? base64Photos : [],
      };

      // Send to API
      const response = await fetch('/api/admin/businesses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (response.ok) {
        alert('Podnik úspěšně vytvořen!');
        setShowAddBusinessModal(false);
        fetchAdminData(); // Reload
      } else {
        const result = await response.json();
        alert(result.error || 'Chyba při vytváření podniku');
      }
    } catch (error) {
      console.error('Error creating business:', error);
      alert('Chyba při vytváření podniku');
    }
  };

  // Add new profile handlers
  const handleAddProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!newProfileFormData.name || !newProfileFormData.age || !newProfileFormData.phone || !newProfileFormData.city) {
        alert('Vyplňte prosím povinná pole');
        return;
      }

      const photoPromises = newProfilePhotos.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      const base64Photos = await Promise.all(photoPromises);

      const data = {
        ...newProfileFormData,
        photos: base64Photos,
      };

      const response = await fetch('/api/admin/profiles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (response.ok) {
        alert('Profil úspěšně vytvořen!');
        setShowAddProfileModal(false);
        fetchAdminData();
      } else {
        const result = await response.json();
        alert(result.error || 'Chyba při vytváření profilu');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Chyba při vytváření profilu');
    }
  };

  // Edit profile handlers
  const handleEditProfileOpen = (profile: any) => {
    setEditingProfile(profile);

    // Extract service IDs from profile.services array
    const serviceIds = (profile.services || []).map((ps: any) => ps.serviceId);

    setEditProfileFormData({
      name: profile.name || '',
      age: profile.age?.toString() || '',
      phone: profile.phone || '',
      email: profile.email || '',
      city: profile.city || '',
      address: profile.address || '',
      location: profile.location || '',
      category: profile.category || 'HOLKY_NA_SEX',
      description: profile.description || '',
      businessId: profile.businessId || '',
      services: serviceIds,
      isOnline: profile.isOnline || false,
    });
    setEditProfilePhotos([]);
    setEditProfilePhotosPreviews([]);
    setEditPhotosToDelete([]);
    setShowEditProfileModal(true);
  };

  const handleEditProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    try {
      // Convert photos to base64
      const photoPromises = editProfilePhotos.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      const base64Photos = await Promise.all(photoPromises);

      // Prepare data
      const data: any = {
        name: editProfileFormData.name,
        age: parseInt(editProfileFormData.age),
        phone: editProfileFormData.phone,
        email: editProfileFormData.email || null,
        city: editProfileFormData.city,
        address: editProfileFormData.address || null,
        location: editProfileFormData.location || editProfileFormData.city,
        category: editProfileFormData.category,
        description: editProfileFormData.description || null,
        businessId: editProfileFormData.businessId || null,
        services: editProfileFormData.services,
        isOnline: editProfileFormData.isOnline,
      };

      if (editPhotosToDelete.length > 0 || base64Photos.length > 0) {
        data.photoChanges = {
          photosToDelete: editPhotosToDelete.length > 0 ? editPhotosToDelete : undefined,
          newPhotos: base64Photos.length > 0 ? base64Photos : undefined,
        };
      }

      // Send to API
      const response = await fetch('/api/admin/profiles/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: editingProfile.id, data }),
      });

      if (response.ok) {
        alert('Profil úspěšně upraven!');
        setShowEditProfileModal(false);
        setEditingProfile(null);
        fetchAdminData(); // Reload
      } else {
        const result = await response.json();
        alert(result.error || 'Chyba při úpravě profilu');
      }
    } catch (error) {
      console.error('Error editing profile:', error);
      alert('Chyba při úpravě profilu');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-dark-900">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Načítání admin panelu...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark-900">
      <Header />

      <div className="pt-20">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 min-h-screen bg-dark-800/50 border-r border-white/10 fixed top-20 left-0">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-8">
                <Shield className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold">Admin Panel</h2>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'dashboard'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveSection('users')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'users'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Uživatelé</span>
                  {stats?.stats?.totalUsers && (
                    <span className="ml-auto text-sm text-gray-400">{stats.stats.totalUsers}</span>
                  )}
                </button>

                <button
                  onClick={() => setActiveSection('businesses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'businesses'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Podniky</span>
                  {stats?.stats?.pendingBusinesses > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {stats.stats.pendingBusinesses}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveSection('profiles')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'profiles'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Profily</span>
                  {stats?.stats?.pendingProfiles > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {stats.stats.pendingProfiles}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveSection('pending-changes')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'pending-changes'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Změny</span>
                  {pendingChanges.filter(c => c.status === 'PENDING').length > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {pendingChanges.filter(c => c.status === 'PENDING').length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveSection('reviews')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'reviews'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Recenze</span>
                </button>

                <button
                  onClick={() => setActiveSection('payments')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'payments'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Platby</span>
                </button>

                <button
                  onClick={() => setActiveSection('banners')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'banners'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Bannery</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="ml-64 flex-1 p-8">
            {/* Dashboard Overview */}
            {activeSection === 'dashboard' && stats && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                  <p className="text-gray-400">Přehled celého webu a statistiky</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-400">Celkem uživatelů</h3>
                      <Users className="w-5 h-5 text-primary-400" />
                    </div>
                    <p className="text-3xl font-bold">{stats.stats.totalUsers}</p>
                  </div>

                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-400">Celkem podniků</h3>
                      <Building2 className="w-5 h-5 text-primary-400" />
                    </div>
                    <p className="text-3xl font-bold">{stats.stats.totalBusinesses}</p>
                    {stats.stats.pendingBusinesses > 0 && (
                      <p className="text-sm text-orange-400 mt-2">
                        {stats.stats.pendingBusinesses} čeká na schválení
                      </p>
                    )}
                  </div>

                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-400">Celkem profilů</h3>
                      <UserCircle className="w-5 h-5 text-primary-400" />
                    </div>
                    <p className="text-3xl font-bold">{stats.stats.totalProfiles}</p>
                    {stats.stats.pendingProfiles > 0 && (
                      <p className="text-sm text-orange-400 mt-2">
                        {stats.stats.pendingProfiles} čeká na schválení
                      </p>
                    )}
                  </div>

                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-400">Aktivita</h3>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold">+12%</p>
                    <p className="text-sm text-gray-400 mt-2">Tento týden</p>
                  </div>
                </div>

                {/* Traffic Charts */}
                <div className="glass rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6">Návštěvnost webu (posledních 30 dní)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={[
                        { date: '1.11', views: 245, users: 180 },
                        { date: '2.11', views: 312, users: 225 },
                        { date: '3.11', views: 289, users: 198 },
                        { date: '4.11', views: 378, users: 267 },
                        { date: '5.11', views: 456, users: 321 },
                        { date: '6.11', views: 423, users: 298 },
                        { date: '7.11', views: 512, users: 356 },
                        { date: '8.11', views: 478, users: 334 },
                        { date: '9.11', views: 567, users: 389 },
                        { date: '10.11', views: 634, users: 421 },
                        { date: '11.11', views: 589, users: 398 },
                        { date: '12.11', views: 678, users: 456 },
                        { date: '13.11', views: 723, users: 487 },
                        { date: '14.11', views: 812, users: 534 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                        name="Zobrazení"
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        name="Uživatelé"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* SEO Keywords (KW) */}
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Top vyhledávací dotazy (SEO Keywords)</h3>
                    <Search className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">escort praha</span>
                          <span className="text-xs text-green-400">+24%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: '85%' }}></div>
                          </div>
                          <span className="text-xs text-gray-400">1,234</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">erotické masáže</span>
                          <span className="text-xs text-green-400">+18%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: '72%' }}></div>
                          </div>
                          <span className="text-xs text-gray-400">987</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">holky na sex</span>
                          <span className="text-xs text-green-400">+32%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: '68%' }}></div>
                          </div>
                          <span className="text-xs text-gray-400">856</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">privát brno</span>
                          <span className="text-xs text-green-400">+15%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: '54%' }}></div>
                          </div>
                          <span className="text-xs text-gray-400">634</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">domina ostrava</span>
                          <span className="text-xs text-orange-400">-3%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: '42%' }}></div>
                          </div>
                          <span className="text-xs text-gray-400">512</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">erotický salon</span>
                          <span className="text-xs text-green-400">+9%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: '38%' }}></div>
                          </div>
                          <span className="text-xs text-gray-400">478</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Nejnovější uživatelé</h3>
                    <div className="space-y-3">
                      {stats.recentUsers?.slice(0, 5).map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="font-medium">{user.email}</p>
                            <p className="text-sm text-gray-400">
                              {user._count.businesses} podniků, {user._count.profiles} profilů
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Businesses */}
                  <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Nejnovější podniky</h3>
                    <div className="space-y-3">
                      {stats.recentBusinesses?.slice(0, 5).map((business: any) => (
                        <div key={business.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="font-medium">{business.name}</p>
                            <p className="text-sm text-gray-400">{business.city} • {business.owner.email}</p>
                          </div>
                          {business.verified ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Section */}
            {activeSection === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Uživatelé</h1>
                    <p className="text-gray-400">Správa všech uživatelů platformy</p>
                  </div>

                  {/* Vyhledávání podle názvu podniku / telefonního čísla */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Hledat podle názvu podniku nebo telefonu..."
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-400 transition-colors text-sm w-80"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {users
                    .filter(user => {
                      if (!userSearchQuery) return true;

                      const query = userSearchQuery.toLowerCase();
                      const userBusinesses = businesses.filter(b => b.ownerId === user.id);
                      const userProfiles = profiles.filter(p => p.ownerId === user.id);

                      // Vyhledávání v emailu
                      if (user.email.toLowerCase().includes(query)) return true;

                      // Vyhledávání v názvech podniků
                      if (userBusinesses.some(b => b.name.toLowerCase().includes(query))) return true;

                      // Vyhledávání v telefonních číslech
                      const phones = [
                        ...userBusinesses.map(b => b.phone),
                        ...userProfiles.map(p => p.phone)
                      ].filter(Boolean);

                      if (phones.some(phone => phone.includes(query))) return true;

                      return false;
                    })
                    .map((user) => {
                      const isExpanded = expandedUserId === user.id;
                      const userBusinesses = businesses.filter(b => b.ownerId === user.id);
                      const userProfiles = profiles.filter(p => p.ownerId === user.id);

                      // Najít telefonní čísla z podniků a profilů
                      const phones = [
                        ...userBusinesses.map(b => b.phone),
                        ...userProfiles.map(p => p.phone)
                      ].filter(Boolean);
                      const uniquePhones = Array.from(new Set(phones));

                      return (
                        <div key={user.id} className="glass rounded-xl overflow-hidden">
                          {/* Hlavní řádek - rozklikávací */}
                          <div
                            onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                            className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-2">
                                  {isExpanded ? (
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">{user.email}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                                      user.role === 'PROVIDER' ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {user.role}
                                    </span>
                                  </div>
                                  {uniquePhones.length > 0 && (
                                    <div className="text-sm text-gray-400 mt-1">
                                      📞 {uniquePhones.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-6 text-sm">
                                <div className="text-center">
                                  <div className="text-gray-400">Podniky</div>
                                  <div className="font-bold">{user._count.businesses}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-400">Profily</div>
                                  <div className="font-bold">{user._count.profiles}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-400">Recenze</div>
                                  <div className="font-bold">{user._count.reviews}</div>
                                </div>
                                <div className="text-gray-400 text-xs">
                                  {new Date(user.createdAt).toLocaleDateString('cs-CZ')}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Rozbalený detail */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-white/5">
                              {/* Podniky */}
                              {userBusinesses.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-semibold text-primary-400 mb-2">
                                    Podniky ({userBusinesses.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {userBusinesses.map((business) => (
                                      <div key={business.id} className="p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium">{business.name}</span>
                                              {business.verified && (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                              )}
                                              {!business.approved && (
                                                <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                                                  Čeká
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-gray-400 space-y-0.5">
                                              <div>📞 {business.phone}</div>
                                              <div>📍 {business.city}</div>
                                              <div>👥 {business._count.profiles} profilů</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* SOLO Profily */}
                              {userProfiles.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-semibold text-blue-400 mb-2">
                                    SOLO Profily ({userProfiles.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {userProfiles.map((profile) => (
                                      <div key={profile.id} className="p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium">{profile.name}</span>
                                              {profile.verified && (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                              )}
                                              {!profile.approved && (
                                                <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                                                  Čeká
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-gray-400 space-y-0.5">
                                              <div>📞 {profile.phone}</div>
                                              <div>📍 {profile.city}</div>
                                              <div>👤 {profile.age} let</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {userBusinesses.length === 0 && userProfiles.length === 0 && (
                                <div className="mt-4 text-center text-gray-400 text-sm py-4">
                                  Žádné podniky ani profily
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Businesses Section */}
            {activeSection === 'businesses' && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Podniky</h1>
                    <p className="text-gray-400">Správa a schvalování podniků</p>
                  </div>
                  <button
                    onClick={handleAddBusinessOpen}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Přidat nový podnik
                  </button>
                </div>

                {/* Filter buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setBusinessFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      businessFilter === 'all'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    Všechny ({businesses.length})
                  </button>
                  <button
                    onClick={() => setBusinessFilter('pending_approval')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      businessFilter === 'pending_approval'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    Čeká na schválení ({businesses.filter(b => !b.approved).length})
                  </button>
                  <button
                    onClick={() => setBusinessFilter('pending_verification')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      businessFilter === 'pending_verification'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    Čeká na ověření ({businesses.filter(b => !b.verified).length})
                  </button>
                </div>

                <div className="space-y-4">
                  {businesses
                    .filter(business => {
                      if (businessFilter === 'pending_approval') return !business.approved;
                      if (businessFilter === 'pending_verification') return !business.verified;
                      return true;
                    })
                    .map((business) => (
                    <div key={business.id} className="glass rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{business.name}</h3>
                            <div className="flex items-center gap-2">
                              {business.approved && (
                                <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">Schváleno</span>
                              )}
                              {business.verified && (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              )}
                              {!business.approved && (
                                <AlertCircle className="w-5 h-5 text-orange-400" />
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Vlastník</p>
                              <p>{business.owner.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Město</p>
                              <p>{business.city}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Telefon</p>
                              <p>{business.phone}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Typ</p>
                              <p>{business.profileType}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Profily</p>
                              <p>{business._count.profiles}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Hodnocení</p>
                              <p>{business.rating.toFixed(1)} ({business._count.reviews})</p>
                            </div>
                          </div>
                          {business.description && (
                            <p className="text-sm text-gray-400 mt-3">{business.description}</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditBusinessOpen(business)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Upravit
                          </button>

                          {/* Approve/Reject Button */}
                          {!business.approved ? (
                            <button
                              onClick={() => handleApprove('business', business.id, true)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Schválit
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove('business', business.id, false)}
                              className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Zamítnout
                            </button>
                          )}

                          {/* Verify/Unverify Button */}
                          {!business.verified ? (
                            <button
                              onClick={() => handleVerify('business', business.id, true)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Ověřit
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerify('business', business.id, false)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Zrušit ověření
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteBusiness(business.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Smazat
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profiles Section */}
            {activeSection === 'profiles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Profily</h1>
                    <p className="text-gray-400">Správa a schvalování profilů</p>
                  </div>
                  <button
                    onClick={() => setShowAddProfileModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Přidat nový profil
                  </button>
                </div>

                {profiles.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {profiles.map((profile: any) => (
                      <div key={profile.id} className="glass rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">{profile.name}</h3>
                            <div className="space-y-1 text-sm text-gray-400">
                              <p><strong>Věk:</strong> {profile.age} let</p>
                              <p><strong>Město:</strong> {profile.city}</p>
                              <p><strong>Telefon:</strong> {profile.phone}</p>
                              <p><strong>Vlastník:</strong> {profile.owner.email}</p>
                              {profile.business && (
                                <p className="text-primary-400">
                                  <strong>Podnik:</strong> {profile.business.name}
                                </p>
                              )}
                              {!profile.business && (
                                <p className="text-blue-400">
                                  <strong>Typ:</strong> SOLO profil
                                </p>
                              )}
                            </div>
                            {profile.description && (
                              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                                {profile.description}
                              </p>
                            )}
                          </div>
                          {profile.photos?.[0] && (
                            <img
                              src={profile.photos[0].url}
                              alt={profile.name}
                              className="w-20 h-20 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                          <div className="flex items-center gap-1">
                            {profile.approved ? (
                              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                ✓ Schváleno
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                                Čeká na schválení
                              </span>
                            )}
                            {profile.verified && (
                              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded ml-1">
                                ✓ Ověřeno
                              </span>
                            )}
                          </div>

                          <div className="ml-auto flex gap-2">
                            {/* Approve/Reject Button */}
                            {!profile.approved ? (
                              <button
                                onClick={() => handleApprove('profile', profile.id, true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Schválit
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApprove('profile', profile.id, false)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                Zamítnout
                              </button>
                            )}

                            {/* Verify/Unverify Button */}
                            {!profile.verified ? (
                              <button
                                onClick={() => handleVerify('profile', profile.id, true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Ověřit
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerify('profile', profile.id, false)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                Zrušit ověření
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditProfileOpen(profile)}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Upravit
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteProfile(profile.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Smazat
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-xl p-12 text-center">
                    <UserCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Zatím žádné profily</p>
                  </div>
                )}
              </div>
            )}

            {/* Pending Changes Section */}
            {activeSection === 'pending-changes' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Čekající změny</h1>
                  <p className="text-gray-400">Kontrola a schvalování změn profilů a podniků</p>
                </div>

                {pendingChanges.length > 0 ? (
                  <div className="space-y-4">
                    {pendingChanges.map((change: any) => {
                      const isPending = change.status === 'PENDING';
                      const oldData = change.oldData || {};
                      const newData = change.newData || {};

                      // Calculate monthly changes count for this user
                      const thisMonth = new Date();
                      thisMonth.setDate(1);
                      thisMonth.setHours(0, 0, 0, 0);
                      const userMonthlyCount = pendingChanges.filter((c: any) =>
                        c.requestedBy.id === change.requestedBy.id &&
                        new Date(c.createdAt) >= thisMonth
                      ).length;

                      // Determine type display
                      const typeDisplay = change.profileId ? 'Dívka' : 'Podnik';

                      // Get business info - prefer profile's business, fallback to user's business
                      let businessName = '';
                      let businessPhone = '';

                      if (change.profileId && change.profile) {
                        // For profile changes, show profile's phone and business name if available
                        businessPhone = change.profile.phone || '';
                        businessName = change.profile.business?.name || '';

                        // If no business linked to profile, use user's first business
                        if (!businessName && change.requestedBy.businesses?.[0]) {
                          businessName = change.requestedBy.businesses[0].name;
                        }
                      } else if (change.businessId && change.business) {
                        // For business changes, show the business info
                        businessName = change.business.name;
                        businessPhone = change.business.phone;
                      }

                      // Fallback to user's business if nothing else
                      if (!businessName && change.requestedBy.businesses?.[0]) {
                        businessName = change.requestedBy.businesses[0].name;
                        businessPhone = change.requestedBy.businesses[0].phone;
                      }

                      const userDisplay = businessName && businessPhone
                        ? `${businessName} - ${businessPhone}`
                        : businessName || businessPhone || change.requestedBy.email;

                      return (
                        <div key={change.id} className="glass rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold">
                                  {change.type === 'PROFILE_UPDATE' ? 'Změna profilu' : 'Změna podniku'}
                                </h3>
                                <span className={`text-xs px-3 py-1 rounded-full ${
                                  change.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' :
                                  change.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {change.status === 'PENDING' ? 'Čeká' : change.status === 'APPROVED' ? 'Schváleno' : 'Zamítnuto'}
                                </span>
                              </div>

                              <div className="space-y-2 text-sm text-gray-400">
                                <p><strong>Typ:</strong> {typeDisplay}</p>
                                <p><strong>Požadováno uživatelem:</strong> {userDisplay}</p>
                                <p><strong>Žádostí tento měsíc:</strong> {userMonthlyCount}</p>
                                <p><strong>Datum:</strong> {new Date(change.createdAt).toLocaleString('cs-CZ')}</p>
                                {change.reviewedBy && (
                                  <>
                                    <p><strong>Zkontroloval:</strong> {change.reviewedBy.email}</p>
                                    <p><strong>Datum kontroly:</strong> {new Date(change.reviewedAt).toLocaleString('cs-CZ')}</p>
                                    {change.reviewNotes && (
                                      <p><strong>Poznámky:</strong> {change.reviewNotes}</p>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Show changes */}
                              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                                <h4 className="font-semibold mb-2">Změny:</h4>
                                <div className="space-y-2 text-sm">
                                  {Object.keys(newData).map((key) => {
                                    if (key === 'updatedAt') return null;
                                    if (key === 'photoChanges') return null; // Handle separately

                                    return (
                                      <div key={key} className="flex items-start gap-2">
                                        <span className="text-gray-400 min-w-[120px]">{key}:</span>
                                        <div className="flex-1">
                                          {oldData[key] !== undefined && (
                                            <div className="text-red-400 line-through">
                                              {typeof oldData[key] === 'object' ? JSON.stringify(oldData[key]) : String(oldData[key])}
                                            </div>
                                          )}
                                          <div className="text-green-400">
                                            {typeof newData[key] === 'object' ? JSON.stringify(newData[key]) : String(newData[key])}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Photo Changes */}
                                  {newData.photoChanges && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                      <h5 className="font-semibold mb-3 text-primary-400">Změny fotek:</h5>

                                      {/* Photos to delete */}
                                      {newData.photoChanges.photosToDelete && newData.photoChanges.photosToDelete.length > 0 && (
                                        <div className="mb-3">
                                          <p className="text-red-400 mb-2">Fotky ke smazání ({newData.photoChanges.photosToDelete.length}):</p>
                                          <div className="grid grid-cols-4 gap-2">
                                            {oldData.photos?.filter((p: any) => newData.photoChanges.photosToDelete.includes(p.id)).map((photo: any) => (
                                              <div key={photo.id} className="relative aspect-square rounded border-2 border-red-500">
                                                <img src={photo.url} alt="Smazat" className="w-full h-full object-cover rounded" />
                                                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                  <span className="text-red-400 font-bold">SMAZAT</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* New photos */}
                                      {newData.photoChanges.newPhotos && newData.photoChanges.newPhotos.length > 0 && (
                                        <div>
                                          <p className="text-green-400 mb-2">Nové fotky ({newData.photoChanges.newPhotos.length}):</p>
                                          <div className="grid grid-cols-4 gap-2">
                                            {newData.photoChanges.newPhotos.map((photo: string, index: number) => (
                                              <div key={index} className="relative aspect-square rounded border-2 border-green-500">
                                                <img src={photo} alt={`Nová ${index + 1}`} className="w-full h-full object-cover rounded" />
                                                <div className="absolute top-1 left-1 px-2 py-0.5 bg-green-500 rounded text-[10px] font-bold">
                                                  NOVÁ
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action buttons - pouze pro PENDING */}
                            {isPending && (
                              <div className="ml-4 flex flex-col gap-2">
                                <button
                                  onClick={() => handleReviewChange(change.id, 'approve')}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Schválit
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = prompt('Poznámka k zamítnutí (volitelné):');
                                    handleReviewChange(change.id, 'reject', notes || undefined);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Zamítnout
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass rounded-xl p-12 text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Žádné čekající změny</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews, Payments, Banners - Placeholders */}
            {['reviews', 'payments', 'banners'].includes(activeSection) && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 capitalize">{activeSection}</h1>
                  <p className="text-gray-400">Tato sekce bude brzy dostupná</p>
                </div>
                <div className="glass rounded-xl p-12 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Funkce v přípravě</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Business Modal */}
      {showEditBusinessModal && editingBusiness && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upravit podnik</h2>
              <button
                onClick={() => setShowEditBusinessModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditBusinessSave} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Název podniku *
                  </label>
                  <input
                    type="text"
                    value={businessFormData.name}
                    onChange={(e) => setBusinessFormData({ ...businessFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    value={businessFormData.phone}
                    onChange={(e) => setBusinessFormData({ ...businessFormData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                    required
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Web
                  </label>
                  <input
                    type="url"
                    value={businessFormData.website}
                    onChange={(e) => setBusinessFormData({ ...businessFormData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adresa
                  </label>
                  <input
                    type="text"
                    value={businessFormData.address}
                    onChange={(e) => setBusinessFormData({ ...businessFormData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Město *
                  </label>
                  <input
                    type="text"
                    value={businessFormData.city}
                    onChange={(e) => setBusinessFormData({ ...businessFormData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Popis
                </label>
                <textarea
                  value={businessFormData.description}
                  onChange={(e) => setBusinessFormData({ ...businessFormData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              {/* Photos Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                  Fotky podniku
                </h3>

                {/* Existing Photos */}
                {editingBusiness.photos && editingBusiness.photos.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-3">Současné fotky (klikněte na fotku pro smazání)</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {editingBusiness.photos.map((photo: any) => (
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
                          <img src={photo.url} alt={`Fotka ${photo.order + 1}`} className="w-full h-full object-cover" />
                          {photosToDelete.includes(photo.id) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                              <XCircle className="w-8 h-8 text-red-400" />
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

                      // HEIC validation
                      const invalidFiles = files.filter(file => {
                        const extension = file.name.split('.').pop()?.toLowerCase();
                        return extension === 'heic' || extension === 'heif';
                      });

                      if (invalidFiles.length > 0) {
                        alert('HEIC formát není podporován. Použijte prosím JPG, PNG nebo WebP.');
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer hover:file:bg-primary-600"
                  />
                </div>

                {/* New Photos Preview */}
                {businessPhotosPreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-3">Náhled nových fotek ({businessPhotosPreviews.length})</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {businessPhotosPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-500">
                          <img src={preview} alt={`Nová fotka ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 px-2 py-0.5 bg-green-500 rounded text-[10px] font-bold">
                            NOVÁ
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditBusinessModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all font-semibold"
                >
                  Uložit změny
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Business Modal */}
      {showAddBusinessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Přidat nový podnik</h2>
              <button
                onClick={() => setShowAddBusinessModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddBusinessSave} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Název podniku <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBusinessFormData.name}
                    onChange={(e) => setNewBusinessFormData({...newBusinessFormData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Telefon <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newBusinessFormData.phone}
                    onChange={(e) => setNewBusinessFormData({...newBusinessFormData, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newBusinessFormData.email}
                    onChange={(e) => setNewBusinessFormData({...newBusinessFormData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={newBusinessFormData.website}
                    onChange={(e) => setNewBusinessFormData({...newBusinessFormData, website: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Město <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBusinessFormData.city}
                    onChange={(e) => setNewBusinessFormData({...newBusinessFormData, city: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Typ podniku <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newBusinessFormData.profileType}
                    onChange={(e) => setNewBusinessFormData({...newBusinessFormData, profileType: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                    required
                  >
                    <option value="PRIVAT">Privát</option>
                    <option value="MASSAGE_SALON">Masážní salon</option>
                    <option value="ESCORT_AGENCY">Escort Agentura</option>
                    <option value="SWINGERS_CLUB">Swingers klub</option>
                    <option value="NIGHT_CLUB">Night Club</option>
                    <option value="STRIP_CLUB">Strip Club</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Adresa
                  </label>
                  <input
                    type="text"
                    value={newBusinessFormData.address}
                    onChange={(e) => setNewBusinessFormData({...newBusinessFormData, address: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Popis
                </label>
                <textarea
                  value={newBusinessFormData.description}
                  onChange={(e) => setNewBusinessFormData({...newBusinessFormData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none resize-none"
                />
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vybavení
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Sprcha', 'Parkování', 'Klimatizace', 'Wi-Fi', 'Platba kartou', 'Diskrétní vchod', 'Sauna', 'Whirlpool', 'Masážní stůl', 'Bazén', 'Bar', 'VIP pokoje'].map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBusinessFormData.equipment.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewBusinessFormData({
                              ...newBusinessFormData,
                              equipment: [...newBusinessFormData.equipment, item]
                            });
                          } else {
                            setNewBusinessFormData({
                              ...newBusinessFormData,
                              equipment: newBusinessFormData.equipment.filter(eq => eq !== item)
                            });
                          }
                        }}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-primary-500"
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                  Fotky podniku
                </h3>

                {/* Add Photos */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Přidat fotky</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);

                      // Check for HEIC files
                      const hasHEIC = files.some(f => f.name.toLowerCase().endsWith('.heic'));
                      if (hasHEIC) {
                        alert('HEIC formát není podporován. Použijte prosím JPG, PNG nebo WEBP.');
                        e.target.value = '';
                        return;
                      }

                      setNewBusinessPhotos(prev => [...prev, ...files]);

                      // Create previews
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewBusinessPhotosPreviews(prev => [...prev, reader.result as string]);
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Podporované formáty: JPG, PNG, WEBP (HEIC není podporován)
                  </p>
                </div>

                {/* New Photos Preview */}
                {newBusinessPhotosPreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-3">Náhled nových fotek (klikněte pro odstranění)</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {newBusinessPhotosPreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-green-500/50"
                          onClick={() => {
                            setNewBusinessPhotos(prev => prev.filter((_, i) => i !== index));
                            setNewBusinessPhotosPreviews(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <img src={preview} alt={`Nová fotka ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/0 group-hover:bg-red-500/20 transition-colors">
                            <XCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddBusinessModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all"
                >
                  Vytvořit podnik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {showAddProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass rounded-3xl p-8 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Přidat nový profil</h2>
            <form onSubmit={handleAddProfileSave} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Jméno *</label>
                  <input
                    type="text"
                    required
                    value={newProfileFormData.name}
                    onChange={(e) => setNewProfileFormData({...newProfileFormData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Věk *</label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="99"
                    value={newProfileFormData.age}
                    onChange={(e) => setNewProfileFormData({...newProfileFormData, age: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={newProfileFormData.phone}
                    onChange={(e) => setNewProfileFormData({...newProfileFormData, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={newProfileFormData.email}
                    onChange={(e) => setNewProfileFormData({...newProfileFormData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Město *</label>
                  <input
                    type="text"
                    required
                    value={newProfileFormData.city}
                    onChange={(e) => setNewProfileFormData({...newProfileFormData, city: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Adresa</label>
                  <input
                    type="text"
                    value={newProfileFormData.address}
                    onChange={(e) => setNewProfileFormData({...newProfileFormData, address: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Kategorie *</label>
                <select
                  value={newProfileFormData.category}
                  onChange={(e) => setNewProfileFormData({...newProfileFormData, category: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                >
                  <option value="HOLKY_NA_SEX">Holky na sex</option>
                  <option value="EROTICKE_MASERKY">Erotické maserky</option>
                  <option value="DOMINA">Domina</option>
                  <option value="DIGITALNI_SLUZBY">Digitální služby</option>
                </select>
              </div>

              {/* Business Assignment (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">Přiřadit k podniku (volitelné)</label>
                <select
                  value={newProfileFormData.businessId}
                  onChange={(e) => setNewProfileFormData({...newProfileFormData, businessId: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                >
                  <option value="">-- SOLO profil (bez podniku) --</option>
                  {businesses.map((business: any) => (
                    <option key={business.id} value={business.id}>
                      {business.name} ({business.city})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Necháte-li prázdné, vytvoří se samostatný SOLO profil
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Popis</label>
                <textarea
                  value={newProfileFormData.description}
                  onChange={(e) => setNewProfileFormData({...newProfileFormData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none resize-none"
                  placeholder="Detailní popis profilu..."
                />
              </div>

              {/* Services based on category */}
              <div className="space-y-4">
                {newProfileFormData.category === 'EROTICKE_MASERKY' && (
                  <>
                    {/* Typy masáží */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Typy masáží</label>
                      <div className="grid grid-cols-2 gap-3">
                        {allServices.filter(s => s.category === 'DRUHY_MASAZI').map((service) => (
                          <label key={service.id} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newProfileFormData.services.includes(service.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewProfileFormData({
                                    ...newProfileFormData,
                                    services: [...newProfileFormData.services, service.id]
                                  });
                                } else {
                                  setNewProfileFormData({
                                    ...newProfileFormData,
                                    services: newProfileFormData.services.filter(id => id !== service.id)
                                  });
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{service.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Extra služby */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Extra služby (volitelné)</label>
                      <div className="grid grid-cols-2 gap-3">
                        {allServices.filter(s => s.category === 'EXTRA_SLUZBY').map((service) => (
                          <label key={service.id} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newProfileFormData.services.includes(service.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewProfileFormData({
                                    ...newProfileFormData,
                                    services: [...newProfileFormData.services, service.id]
                                  });
                                } else {
                                  setNewProfileFormData({
                                    ...newProfileFormData,
                                    services: newProfileFormData.services.filter(id => id !== service.id)
                                  });
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{service.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {newProfileFormData.category === 'HOLKY_NA_SEX' && (
                  <div>
                    <label className="block text-sm font-medium mb-3">Praktiky</label>
                    <div className="grid grid-cols-2 gap-3">
                      {allServices.filter(s => s.category === 'PRAKTIKY').map((service) => (
                        <label key={service.id} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newProfileFormData.services.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewProfileFormData({
                                  ...newProfileFormData,
                                  services: [...newProfileFormData.services, service.id]
                                });
                              } else {
                                setNewProfileFormData({
                                  ...newProfileFormData,
                                  services: newProfileFormData.services.filter(id => id !== service.id)
                                });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{service.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium mb-2">Fotky</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);

                    // Check for HEIC files
                    const heicFiles = files.filter(file =>
                      file.name.toLowerCase().endsWith('.heic') ||
                      file.type === 'image/heic'
                    );

                    if (heicFiles.length > 0) {
                      alert('HEIC formát není podporován. Prosím, použijte JPG, PNG nebo WEBP.');
                      e.target.value = '';
                      return;
                    }

                    setNewProfilePhotos(files);

                    // Create previews
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setNewProfilePhotosPreviews(prev => [...prev, e.target?.result as string]);
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Podporované formáty: JPG, PNG, WEBP (HEIC není podporován)
                </p>
              </div>

              {/* New Photos Preview */}
              {newProfilePhotosPreviews.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-3">Náhled fotek (klikněte pro odstranění)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {newProfilePhotosPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-green-500/50"
                        onClick={() => {
                          setNewProfilePhotos(prev => prev.filter((_, i) => i !== index));
                          setNewProfilePhotosPreviews(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <img src={preview} alt={`Fotka ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/0 group-hover:bg-red-500/20 transition-colors">
                          <XCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProfileModal(false);
                    setNewProfileFormData({
                      name: '', age: '', phone: '', email: '', city: '', address: '',
                      category: 'HOLKY_NA_SEX', description: '', businessId: '', services: [],
                    });
                    setNewProfilePhotos([]);
                    setNewProfilePhotosPreviews([]);
                  }}
                  className="flex-1 px-6 py-3 bg-white/5 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all"
                >
                  Vytvořit profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && editingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass rounded-3xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Upravit profil: {editingProfile.name}</h2>
            <form onSubmit={handleEditProfileSave} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Jméno *</label>
                  <input
                    type="text"
                    required
                    value={editProfileFormData.name}
                    onChange={(e) => setEditProfileFormData({...editProfileFormData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Věk *</label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="99"
                    value={editProfileFormData.age}
                    onChange={(e) => setEditProfileFormData({...editProfileFormData, age: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={editProfileFormData.phone}
                    onChange={(e) => setEditProfileFormData({...editProfileFormData, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={editProfileFormData.email}
                    onChange={(e) => setEditProfileFormData({...editProfileFormData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Město *</label>
                  <input
                    type="text"
                    required
                    value={editProfileFormData.city}
                    onChange={(e) => setEditProfileFormData({...editProfileFormData, city: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Adresa</label>
                  <input
                    type="text"
                    value={editProfileFormData.address}
                    onChange={(e) => setEditProfileFormData({...editProfileFormData, address: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Kategorie *</label>
                <select
                  value={editProfileFormData.category}
                  onChange={(e) => setEditProfileFormData({...editProfileFormData, category: e.target.value, services: []})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                >
                  <option value="HOLKY_NA_SEX">Holky na sex</option>
                  <option value="EROTICKE_MASERKY">Erotické maserky</option>
                  <option value="DOMINA">Domina</option>
                  <option value="DIGITALNI_SLUZBY">Digitální služby</option>
                </select>
              </div>

              {/* Business Assignment */}
              <div>
                <label className="block text-sm font-medium mb-2">Přiřadit k podniku (volitelné)</label>
                <select
                  value={editProfileFormData.businessId}
                  onChange={(e) => setEditProfileFormData({...editProfileFormData, businessId: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                >
                  <option value="">-- SOLO profil (bez podniku) --</option>
                  {businesses.map((business: any) => (
                    <option key={business.id} value={business.id}>
                      {business.name} ({business.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Online Status */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProfileFormData.isOnline}
                    onChange={(e) => setEditProfileFormData({...editProfileFormData, isOnline: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Online (zelená tečka)</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Popis</label>
                <textarea
                  value={editProfileFormData.description}
                  onChange={(e) => setEditProfileFormData({...editProfileFormData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none resize-none"
                />
              </div>

              {/* Services based on category */}
              <div className="space-y-4">
                {editProfileFormData.category === 'EROTICKE_MASERKY' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-3">Typy masáží</label>
                      <div className="grid grid-cols-2 gap-3">
                        {allServices.filter(s => s.category === 'DRUHY_MASAZI').map((service) => (
                          <label key={service.id} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editProfileFormData.services.includes(service.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditProfileFormData({
                                    ...editProfileFormData,
                                    services: [...editProfileFormData.services, service.id]
                                  });
                                } else {
                                  setEditProfileFormData({
                                    ...editProfileFormData,
                                    services: editProfileFormData.services.filter(id => id !== service.id)
                                  });
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{service.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">Extra služby</label>
                      <div className="grid grid-cols-2 gap-3">
                        {allServices.filter(s => s.category === 'EXTRA_SLUZBY').map((service) => (
                          <label key={service.id} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editProfileFormData.services.includes(service.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditProfileFormData({
                                    ...editProfileFormData,
                                    services: [...editProfileFormData.services, service.id]
                                  });
                                } else {
                                  setEditProfileFormData({
                                    ...editProfileFormData,
                                    services: editProfileFormData.services.filter(id => id !== service.id)
                                  });
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{service.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {editProfileFormData.category === 'HOLKY_NA_SEX' && (
                  <div>
                    <label className="block text-sm font-medium mb-3">Praktiky</label>
                    <div className="grid grid-cols-2 gap-3">
                      {allServices.filter(s => s.category === 'PRAKTIKY').map((service) => (
                        <label key={service.id} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editProfileFormData.services.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditProfileFormData({
                                  ...editProfileFormData,
                                  services: [...editProfileFormData.services, service.id]
                                });
                              } else {
                                setEditProfileFormData({
                                  ...editProfileFormData,
                                  services: editProfileFormData.services.filter(id => id !== service.id)
                                });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{service.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {editProfileFormData.category === 'DOMINA' && (
                  <div>
                    <label className="block text-sm font-medium mb-3">BDSM Praktiky</label>
                    <div className="grid grid-cols-2 gap-3">
                      {allServices.filter(s => s.category === 'BDSM_PRAKTIKY').map((service) => (
                        <label key={service.id} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editProfileFormData.services.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditProfileFormData({
                                  ...editProfileFormData,
                                  services: [...editProfileFormData.services, service.id]
                                });
                              } else {
                                setEditProfileFormData({
                                  ...editProfileFormData,
                                  services: editProfileFormData.services.filter(id => id !== service.id)
                                });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{service.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Photos */}
              {editingProfile.photos && editingProfile.photos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">Současné fotky (klikněte pro smazání)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {editingProfile.photos.map((photo: any) => {
                      const isMarkedForDeletion = editPhotosToDelete.includes(photo.id);
                      return (
                        <div
                          key={photo.id}
                          className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                            isMarkedForDeletion ? 'border-red-500/70 opacity-50' : 'border-white/10'
                          }`}
                          onClick={() => {
                            if (isMarkedForDeletion) {
                              setEditPhotosToDelete(prev => prev.filter(id => id !== photo.id));
                            } else {
                              setEditPhotosToDelete(prev => [...prev, photo.id]);
                            }
                          }}
                        >
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                          <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
                            isMarkedForDeletion ? 'bg-red-500/40' : 'bg-red-500/0 group-hover:bg-red-500/20'
                          }`}>
                            <XCircle className={`w-8 h-8 text-white transition-opacity ${
                              isMarkedForDeletion ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add New Photos */}
              <div>
                <label className="block text-sm font-medium mb-2">Přidat nové fotky</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const hasHEIC = files.some(f => f.name.toLowerCase().endsWith('.heic'));
                    if (hasHEIC) {
                      alert('HEIC formát není podporován. Použijte prosím JPG, PNG nebo WEBP.');
                      e.target.value = '';
                      return;
                    }
                    setEditProfilePhotos(prev => [...prev, ...files]);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditProfilePhotosPreviews(prev => [...prev, reader.result as string]);
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-400 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Podporované formáty: JPG, PNG, WEBP (HEIC není podporován)
                </p>
              </div>

              {/* New Photos Preview */}
              {editProfilePhotosPreviews.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-3">Nové fotky (klikněte pro odstranění)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {editProfilePhotosPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-green-500/50"
                        onClick={() => {
                          setEditProfilePhotos(prev => prev.filter((_, i) => i !== index));
                          setEditProfilePhotosPreviews(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <img src={preview} alt={`Nová ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/0 group-hover:bg-red-500/20 transition-colors">
                          <XCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfileModal(false);
                    setEditingProfile(null);
                  }}
                  className="flex-1 px-6 py-3 bg-white/5 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all"
                >
                  Uložit změny
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
