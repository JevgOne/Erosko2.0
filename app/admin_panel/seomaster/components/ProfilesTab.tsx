'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
} from 'lucide-react';
import SEOEditModal from './SEOEditModal';

const categoryLabels = {
  HOLKY_NA_SEX: { label: '💋 Sex Holky', color: 'text-pink-400' },
  EROTICKE_MASERKY: { label: '💆 Masáže', color: 'text-purple-400' },
  DOMINA: { label: '⛓️ BDSM', color: 'text-red-400' },
  DIGITALNI_SLUZBY: { label: '📱 Online', color: 'text-blue-400' },
  EROTICKE_PODNIKY: { label: '🏢 Podniky', color: 'text-green-400' },
};

interface Stats {
  totalProfiles: number;
  profilesWithSEO: number;
  coveragePercent: number;
  avgQualityScore: number;
  needsReview: number;
  lowQuality: number;
  avgPhotosAltQuality: number;
}

interface Profile {
  id: string;
  name: string;
  slug: string;
  age: number;
  city: string;
  category: string; // Changed from keyof typeof categoryLabels to string
  verified: boolean;
  rating: number;
  viewCount: number;
  seoTitle: string | null;
  seoDescriptionA: string | null;
  seoDescriptionB: string | null;
  seoDescriptionC: string | null;
  seoKeywords: string | null;
  seoQualityScore: number | null;
  seoActiveVariant: string;
  seoLastGenerated: string | null;
  seoLastReviewed: string | null;
  seoManualOverride: boolean;
  ogImageUrl: string | null;
  photos: Array<{ id: string; alt: string | null; altQualityScore: number | null }>;
}

export default function ProfilesTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [regenerating, setRegenerating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  console.log('ProfilesTab editingProfile state:', editingProfile);

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      console.log('Fetching SEO dashboard data...');
      const response = await fetch(`/api/admin/seo-dashboard?${params}`);
      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Stats:', data.data.stats);
        console.log('Profiles count:', data.data.profiles?.length);
        setStats(data.data.stats);
        setProfiles(data.data.profiles);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error('API returned success: false', data.error);
        alert('Chyba při načítání dat: ' + (data.error || 'Neznámá chyba'));
      }
    } catch (error) {
      console.error('Failed to fetch SEO data:', error);
      alert('Chyba při načítání dat: ' + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery, categoryFilter, statusFilter]);

  // Handle bulk regeneration
  const handleBulkRegenerate = async () => {
    if (selectedProfiles.length === 0) {
      alert('Vyberte alespoň jeden profil');
      return;
    }

    if (!confirm(`Regenerovat SEO pro ${selectedProfiles.length} profilů?`)) {
      return;
    }

    try {
      setRegenerating(true);
      const response = await fetch('/api/admin/seo-regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileIds: selectedProfiles, force: false }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Úspěšně regenerováno: ${data.data.successful}/${data.data.total}`);
        setSelectedProfiles([]);
        fetchData(); // Refresh data
      } else {
        alert('Chyba: ' + data.error);
      }
    } catch (error) {
      console.error('Bulk regenerate failed:', error);
      alert('Chyba při regeneraci');
    } finally {
      setRegenerating(false);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProfiles.length === profiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(profiles.map(p => p.id));
    }
  };

  // Handle select profile
  const handleSelectProfile = (id: string) => {
    if (selectedProfiles.includes(id)) {
      setSelectedProfiles(selectedProfiles.filter(pid => pid !== id));
    } else {
      setSelectedProfiles([...selectedProfiles, id]);
    }
  };

  // Get status badge
  const getStatusBadge = (profile: Profile) => {
    if (profile.seoManualOverride) {
      return (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30">
          ✏️ Manual
        </span>
      );
    }
    if (!profile.seoTitle) {
      return (
        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg border border-red-500/30">
          ❌ Missing
        </span>
      );
    }
    if (profile.seoQualityScore && profile.seoQualityScore < 70) {
      return (
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg border border-yellow-500/30">
          ⚠️ Review
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30">
        🤖 Auto
      </span>
    );
  };

  // Get quality color
  const getQualityColor = (score: number | null) => {
    if (!score) return 'bg-gray-500';
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('cs-CZ');
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-400" />
          <span>Loading SEO data...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* SEO Edit Modal */}
      {editingProfile && (
        <SEOEditModal
          isOpen={true}
          onClose={() => setEditingProfile(null)}
          profile={editingProfile}
          onSave={() => {
            fetchData();
            setEditingProfile(null);
          }}
        />
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Profiles */}
          <div className="glass glass-hover rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary-500/20">
                <BarChart3 className="w-6 h-6 text-primary-400" />
              </div>
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalProfiles}</div>
            <div className="text-sm text-gray-400 mb-3">Profiles</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-400">✅ {stats.profilesWithSEO}</span>
              <span className="text-gray-500">/</span>
              <span className="text-yellow-400">⚠️ {stats.totalProfiles - stats.profilesWithSEO}</span>
            </div>
          </div>

          {/* Coverage */}
          <div className="glass glass-hover rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs text-gray-400">Coverage</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.coveragePercent}%</div>
            <div className="text-sm text-gray-400 mb-3">SEO Coverage</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${stats.coveragePercent}%` }}
              />
            </div>
          </div>

          {/* Avg Quality */}
          <div className="glass glass-hover rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400">Quality</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgQualityScore}/100</div>
            <div className="text-sm text-gray-400 mb-3">Avg Score</div>
            <div className="text-xs text-blue-400">📊 Quality metric</div>
          </div>

          {/* Needs Review */}
          <div className="glass glass-hover rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-xs text-gray-400">Action</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.needsReview}</div>
            <div className="text-sm text-gray-400 mb-3">Needs Review</div>
            <div className="text-xs text-yellow-400">⚠️ Action required</div>
          </div>

          {/* Low Quality */}
          <div className="glass glass-hover rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-xs text-gray-400">Low Quality</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.lowQuality}</div>
            <div className="text-sm text-gray-400 mb-3">Score &lt; 70</div>
            <div className="text-xs text-red-400">🔴 Needs improvement</div>
          </div>

          {/* Photo ALT Quality */}
          <div className="glass glass-hover rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <ImageIcon className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs text-gray-400">Images</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgPhotosAltQuality}/100</div>
            <div className="text-sm text-gray-400 mb-3">ALT Quality</div>
            <div className="text-xs text-purple-400">🖼️ Photo metadata</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleBulkRegenerate}
            disabled={selectedProfiles.length === 0 || regenerating}
            className="px-4 py-2 gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            Bulk Regenerate SEO {selectedProfiles.length > 0 && `(${selectedProfiles.length})`}
          </button>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold mb-4">Profiles - SEO Status</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Search */}
            <div className="flex items-center gap-2 glass rounded-lg px-3 py-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or city..."
                className="bg-transparent border-none focus:outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to page 1 on search
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                className="bg-transparent border-none focus:outline-none text-sm"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryLabels).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                className="bg-transparent border-none focus:outline-none text-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="missing">Missing SEO</option>
                <option value="low-quality">Low Quality (&lt;70)</option>
                <option value="needs-review">Needs Review</option>
              </select>
            </div>
          </div>

          {/* Select All */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={selectedProfiles.length === profiles.length && profiles.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-600"
            />
            <span className="text-sm text-gray-400">
              Select All ({selectedProfiles.length} selected)
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  SEO Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Last Gen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProfiles.includes(profile.id)}
                      onChange={() => handleSelectProfile(profile.id)}
                      className="w-4 h-4 rounded border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{profile.name}, {profile.age}</div>
                      <div className="text-sm text-gray-400">{profile.city}</div>
                      <div className="mt-1">
                        <span className={`text-xs ${categoryLabels[profile.category as keyof typeof categoryLabels]?.color || 'text-gray-400'}`}>
                          {categoryLabels[profile.category as keyof typeof categoryLabels]?.label || profile.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm max-w-md">
                      {profile.seoTitle || (
                        <span className="text-gray-500 italic">No SEO title</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {profile.seoQualityScore ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full border-4 border-gray-700 relative flex items-center justify-center">
                          <div
                            className={`absolute inset-0 rounded-full ${getQualityColor(profile.seoQualityScore)}`}
                            style={{
                              clipPath: `polygon(50% 50%, 50% 0%, ${profile.seoQualityScore > 12.5 ? '100%' : '50%'} 0%, ${profile.seoQualityScore > 37.5 ? '100%' : '50%'} ${profile.seoQualityScore > 12.5 ? '100%' : '0%'}, ${profile.seoQualityScore > 62.5 ? '0%' : '50%'} ${profile.seoQualityScore > 37.5 ? '100%' : '0%'}, ${profile.seoQualityScore > 87.5 ? '0%' : '50%'} ${profile.seoQualityScore > 62.5 ? '0%' : '50%'})`,
                              opacity: 0.3,
                            }}
                          />
                          <span className="text-xs font-bold relative z-10">
                            {profile.seoQualityScore}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(profile)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400">
                      {formatDate(profile.seoLastGenerated)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/${profile.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="View profile"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Edit button clicked for profile:', profile.name);
                          setEditingProfile(profile);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit SEO"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {profiles.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              No profiles found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
