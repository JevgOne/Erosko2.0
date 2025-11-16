'use client';

import { useState } from 'react';
import {
  Search,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Image as ImageIcon,
  Eye,
  Edit3,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Mock data pro demo
const mockProfiles = [
  {
    id: '1',
    name: 'Lucie',
    age: 25,
    city: 'Praha',
    category: 'HOLKY_NA_SEX',
    slug: 'lucie-praha-x7k2p9',
    seoTitle: 'Lucie, 25 let - holky na sex Praha ✓ | EROSKO.CZ',
    seoDescription: '💋 Lucie (25 let) - holky na sex Praha. ✨ Ověřený profil. Klasik, orál, anál. 📞 Reálné fotky, diskrétní jednání.',
    seoQualityScore: 95,
    seoManualOverride: false,
    seoLastGenerated: '2h ago',
    photos: 5,
    photosWithAlt: 5,
  },
  {
    id: '2',
    name: 'Katka',
    age: 28,
    city: 'Brno',
    category: 'EROTICKE_MASERKY',
    slug: 'katka-brno-m3n8p2',
    seoTitle: 'Katka, 28 let - erotické masáže Brno | EROSKO.CZ',
    seoDescription: '💆 Katka nabízí erotické masáže v Brno. Tantra masáž, body to body, erotická masérka. Kontakt a fotky na profilu.',
    seoQualityScore: 91,
    seoManualOverride: true,
    seoLastGenerated: '1d ago',
    photos: 6,
    photosWithAlt: 6,
  },
  {
    id: '3',
    name: 'Elena',
    age: 30,
    city: 'Ostrava',
    category: 'HOLKY_NA_SEX',
    slug: 'elena-ostrava-q5r7s9',
    seoTitle: 'Elena - holky na sex Ostrava',
    seoDescription: 'Elena nabízí holky na sex v Ostrava.',
    seoQualityScore: 67,
    seoManualOverride: false,
    seoLastGenerated: '5d ago',
    photos: 4,
    photosWithAlt: 2,
  },
  {
    id: '4',
    name: 'Nikol',
    age: 23,
    city: 'Praha',
    category: 'DOMINA',
    slug: 'nikol-praha-c1p7q4',
    seoTitle: 'Nikol, 23 let - domina Praha | EROSKO.CZ',
    seoDescription: '⛓️ Nikol - domina Praha. BDSM, SM privát, femdom. Ověřený profil. Reálné fotky.',
    seoQualityScore: 88,
    seoManualOverride: false,
    seoLastGenerated: '12h ago',
    photos: 7,
    photosWithAlt: 7,
  },
];

const categoryLabels = {
  HOLKY_NA_SEX: { label: '💋 Sex Holky', color: 'text-pink-400' },
  EROTICKE_MASERKY: { label: '💆 Masáže', color: 'text-purple-400' },
  DOMINA: { label: '⛓️ BDSM', color: 'text-red-400' },
  DIGITALNI_SLUZBY: { label: '📱 Online', color: 'text-blue-400' },
};

export default function SEOMasterPage() {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');

  const stats = {
    totalProfiles: 1247,
    withSEO: 1205,
    avgQuality: 87,
    needsReview: 23,
    abTestsActive: 156,
    altCoverage: 100,
    ogImages: 98.5,
  };

  const handleSelectAll = () => {
    if (selectedProfiles.length === mockProfiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(mockProfiles.map(p => p.id));
    }
  };

  const handleSelectProfile = (id: string) => {
    if (selectedProfiles.includes(id)) {
      setSelectedProfiles(selectedProfiles.filter(pid => pid !== id));
    } else {
      setSelectedProfiles([...selectedProfiles, id]);
    }
  };

  const getStatusBadge = (profile: typeof mockProfiles[0]) => {
    if (profile.seoManualOverride) {
      return (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30">
          ✏️ Manual
        </span>
      );
    }
    if (profile.seoQualityScore < 70) {
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

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold gradient-text">
            SEO MASTER
          </h1>
        </div>
        <p className="text-gray-400">
          AI-powered SEO management • OpenAI + Claude
        </p>
      </div>

      {/* Stats Overview */}
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
            <span className="text-green-400">✅ {stats.withSEO} SEO</span>
            <span className="text-gray-500">/</span>
            <span className="text-yellow-400">⚠️ {stats.totalProfiles - stats.withSEO} Missing</span>
          </div>
        </div>

        {/* Avg Quality */}
        <div className="glass glass-hover rounded-xl p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-gray-400">Quality</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.avgQuality}/100</div>
          <div className="text-sm text-gray-400 mb-3">Avg Score</div>
          <div className="text-xs text-green-400">📈 +3 pts this week</div>
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

        {/* A/B Tests */}
        <div className="glass glass-hover rounded-xl p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-gray-400">Testing</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.abTestsActive}</div>
          <div className="text-sm text-gray-400 mb-3">A/B Tests Active</div>
          <div className="text-xs text-purple-400">🧪 Running experiments</div>
        </div>

        {/* ALT Coverage */}
        <div className="glass glass-hover rounded-xl p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <ImageIcon className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-gray-400">Images</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.altCoverage}%</div>
          <div className="text-sm text-gray-400 mb-3">ALT Coverage</div>
          <div className="text-xs text-green-400">✅ Complete</div>
        </div>

        {/* OG Images */}
        <div className="glass glass-hover rounded-xl p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-pink-500/20">
              <ImageIcon className="w-6 h-6 text-pink-400" />
            </div>
            <span className="text-xs text-gray-400">Social</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.ogImages}%</div>
          <div className="text-sm text-gray-400 mb-3">OG Images</div>
          <div className="text-xs text-pink-400">🎨 Generated</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Bulk Regenerate SEO
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Run SEO Audit
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            View Analytics
          </button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Generate Missing OG
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            Find Duplicates
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold mb-4">Profiles - SEO Status</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                className="bg-transparent border-none focus:outline-none text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Profiles</option>
                <option value="auto">Auto-generated</option>
                <option value="manual">Manual Override</option>
                <option value="needs-review">Needs Review</option>
              </select>
            </div>

            <div className="flex items-center gap-2 glass rounded-lg px-3 py-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search profiles..."
                className="bg-transparent border-none focus:outline-none text-sm w-full"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProfiles.length === mockProfiles.length}
                onChange={handleSelectAll}
                className="rounded bg-white/10 border-white/20"
              />
              <span className="text-sm text-gray-300">Select All</span>
            </label>

            {selectedProfiles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">
                  {selectedProfiles.length} selected
                </span>
                <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm">
                  <option>Regenerate SEO</option>
                  <option>Delete</option>
                  <option>Export</option>
                </select>
                <button className="px-3 py-1 gradient-primary text-white rounded-lg text-sm hover:opacity-90">
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {mockProfiles.map((profile) => {
                const category = categoryLabels[profile.category as keyof typeof categoryLabels];
                return (
                  <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProfiles.includes(profile.id)}
                        onChange={() => handleSelectProfile(profile.id)}
                        className="rounded bg-white/10 border-white/20"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">
                        {profile.name}, {profile.age}
                      </div>
                      <div className="text-sm text-gray-400">{profile.city}</div>
                      <div className="text-xs text-gray-500">/profil/{profile.slug.slice(0, 15)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${category.color}`}>
                        {category.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{profile.seoQualityScore}</span>
                        <div className="w-16 bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getQualityColor(profile.seoQualityScore)}`}
                            style={{ width: `${profile.seoQualityScore}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ALT: {profile.photosWithAlt}/{profile.photos}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(profile)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {profile.seoLastGenerated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">4</span> of{' '}
            <span className="font-medium text-white">{stats.totalProfiles}</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button className="px-3 py-1 gradient-primary text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1 glass rounded-lg text-sm hover:bg-white/10 transition-colors">
              2
            </button>
            <button className="px-3 py-1 glass rounded-lg text-sm hover:bg-white/10 transition-colors">
              3
            </button>
            <button className="px-3 py-1 glass rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-1">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="mt-8 glass rounded-xl p-6 border-l-4 border-primary-500">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <Sparkles className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Demo Mode - AI-Powered SEO System</h3>
            <p className="text-sm text-gray-400 mb-3">
              This is a functional mockup showing the SEO Master dashboard design.
              Data shown is for demonstration purposes.
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">UI Design - Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">API Endpoints - Pending implementation</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Database Schema - Pending migration</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">AI Integration - Pending (OpenAI + Claude)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
