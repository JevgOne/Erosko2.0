'use client';

import { useState, useEffect } from 'react';
import {
  Globe,
  FileText,
  Users,
  Building2,
  RefreshCw,
  Eye,
  Edit3,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface PageData {
  id: string;
  path: string;
  type: 'profile' | 'business' | 'landing-page' | 'hardcoded';
  title: string | null;
  description: string | null;
  hasSEO: boolean;
  qualityScore: number | null;
  viewCount: number;
  lastUpdated: string | null;
  status: 'published' | 'draft' | 'active';
}

interface Stats {
  totalPages: number;
  withSEO: number;
  withoutSEO: number;
  avgQualityScore: number;
  profiles: number;
  businesses: number;
  landingPages: number;
  hardcodedRoutes: number;
}

export default function AllPagesTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/seo-all-pages?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setPages(data.data.pages);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [searchQuery, typeFilter, statusFilter]);

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'profile':
        return <Users className="w-4 h-4 text-pink-400" />;
      case 'business':
        return <Building2 className="w-4 h-4 text-green-400" />;
      case 'landing-page':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'hardcoded':
        return <Globe className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'profile':
        return '👤 Profile';
      case 'business':
        return '🏢 Business';
      case 'landing-page':
        return '📄 Landing';
      case 'hardcoded':
        return '🔗 Hardcoded';
      default:
        return type;
    }
  };

  // Get SEO status badge
  const getSEOStatusBadge = (page: PageData) => {
    if (!page.hasSEO) {
      return (
        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg border border-red-500/30 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          No SEO
        </span>
      );
    }
    if (page.qualityScore && page.qualityScore < 70) {
      return (
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg border border-yellow-500/30 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Low Quality
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Good SEO
      </span>
    );
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('cs-CZ');
  };

  if (loading && !stats) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-400" />
          <span>Loading all pages...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Pages */}
          <div className="glass glass-hover rounded-xl p-4 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-primary-400" />
              <span className="text-xs text-gray-400">Total Pages</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalPages}</div>
          </div>

          {/* With SEO */}
          <div className="glass glass-hover rounded-xl p-4 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-400">With SEO</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.withSEO}</div>
          </div>

          {/* Without SEO */}
          <div className="glass glass-hover rounded-xl p-4 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-xs text-gray-400">No SEO</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{stats.withoutSEO}</div>
          </div>

          {/* Avg Quality */}
          <div className="glass glass-hover rounded-xl p-4 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-400">Avg Quality</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats.avgQualityScore}/100</div>
          </div>
        </div>
      )}

      {/* Type breakdown */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-gray-400">Profiles</span>
            </div>
            <div className="text-xl font-bold">{stats.profiles}</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Businesses</span>
            </div>
            <div className="text-xl font-bold">{stats.businesses}</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Landing Pages</span>
            </div>
            <div className="text-xl font-bold">{stats.landingPages}</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Hardcoded</span>
            </div>
            <div className="text-xl font-bold">{stats.hardcodedRoutes}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 glass rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages by path or title..."
              className="bg-transparent border-none focus:outline-none text-sm w-full text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="glass rounded-lg px-3 py-2 text-sm bg-transparent border-none focus:outline-none text-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all" className="bg-dark-800">All Types</option>
            <option value="profile" className="bg-dark-800">👤 Profiles</option>
            <option value="business" className="bg-dark-800">🏢 Businesses</option>
            <option value="landing-page" className="bg-dark-800">📄 Landing Pages</option>
            <option value="hardcoded" className="bg-dark-800">🔗 Hardcoded Routes</option>
          </select>

          {/* Status Filter */}
          <select
            className="glass rounded-lg px-3 py-2 text-sm bg-transparent border-none focus:outline-none text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all" className="bg-dark-800">All Status</option>
            <option value="with-seo" className="bg-dark-800">✅ With SEO</option>
            <option value="without-seo" className="bg-dark-800">❌ Without SEO</option>
            <option value="low-quality" className="bg-dark-800">⚠️ Low Quality</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchPages}
            className="glass rounded-lg px-4 py-2 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Pages Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  SEO Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(page.type)}
                      <span className="text-sm">{getTypeLabel(page.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-primary-400">
                      {page.path}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm max-w-md truncate">
                      {page.title || <span className="text-gray-500 italic">No title</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getSEOStatusBadge(page)}
                  </td>
                  <td className="px-6 py-4">
                    {page.qualityScore ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{page.qualityScore}</span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              page.qualityScore >= 90
                                ? 'bg-green-500'
                                : page.qualityScore >= 70
                                ? 'bg-blue-500'
                                : page.qualityScore >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${page.qualityScore}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400">
                      {page.viewCount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="View page"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
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

          {pages.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              No pages found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
