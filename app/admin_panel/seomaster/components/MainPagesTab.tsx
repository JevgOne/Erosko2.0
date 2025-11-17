'use client';

import { useState, useEffect } from 'react';
import { FileText, Edit, Eye, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StaticPage {
  id: string;
  path: string;
  type: string;
  seoTitle: string | null;
  seoDescription: string | null;
  h1: string | null;
  keywords: string | null;
  focusKeyword: string | null;
  secondaryKeywords: string | null;
  content: string | null;
  published: boolean;
  seoScore: number | null;
}

type PageType = 'all' | 'CATEGORY' | 'CITY' | 'COMBINATION' | 'FILTER' | 'CUSTOM' | 'OTHER';

export default function MainPagesTab() {
  const router = useRouter();
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PageType>('all');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  useEffect(() => {
    fetchPages();
  }, [typeFilter, publishedFilter]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      console.log('Fetching static pages...');

      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (publishedFilter !== 'all') params.append('published', publishedFilter === 'published' ? 'true' : 'false');

      const response = await fetch(`/api/admin/static-pages?${params}`);
      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setPages(data.data || []);
      } else {
        console.error('API returned error:', data.error);
        alert('Chyba při načítání stránek: ' + (data.error || 'Neznámá chyba'));
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      alert('Chyba při načítání stránek');
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter((page) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      page.path.toLowerCase().includes(searchLower) ||
      page.seoTitle?.toLowerCase().includes(searchLower) ||
      page.h1?.toLowerCase().includes(searchLower)
    );
  });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CATEGORY: 'Kategorie',
      CITY: 'Město',
      COMBINATION: 'Kombinace',
      FILTER: 'Filtr',
      CUSTOM: 'Vlastní',
      OTHER: 'Ostatní',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CATEGORY: 'bg-purple-500/20 text-purple-400',
      CITY: 'bg-blue-500/20 text-blue-400',
      COMBINATION: 'bg-green-500/20 text-green-400',
      FILTER: 'bg-orange-500/20 text-orange-400',
      CUSTOM: 'bg-pink-500/20 text-pink-400',
      OTHER: 'bg-gray-500/20 text-gray-400',
    };
    return colors[type] || colors.OTHER;
  };

  const getSEOScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Hlavní Stránky</h2>
          <p className="text-gray-400 mt-1">
            Správa SEO metadat pro kategorie, města a filtry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
            <span className="text-sm text-gray-400">Celkem stránek:</span>
            <span className="ml-2 text-lg font-semibold text-white">{pages.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-lighter border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat podle URL nebo názvu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PageType)}
              className="px-4 py-2 bg-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">Všechny typy</option>
              <option value="CUSTOM">Vlastní stránky</option>
              <option value="CATEGORY">Kategorie</option>
              <option value="CITY">Města</option>
              <option value="COMBINATION">Kombinace</option>
              <option value="FILTER">Filtry</option>
              <option value="OTHER">Ostatní</option>
            </select>
          </div>

          {/* Published Filter */}
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value as any)}
            className="px-4 py-2 bg-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">Vše</option>
            <option value="published">Publikováno</option>
            <option value="unpublished">Nepublikováno</option>
          </select>
        </div>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="bg-dark-lighter border border-white/10 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Žádné stránky nenalezeny</p>
        </div>
      ) : (
        <div className="bg-dark-lighter border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    SEO Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    H1
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    SEO Skóre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-mono text-sm">{page.path}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(page.type)}`}>
                        {getTypeLabel(page.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {page.seoTitle || <span className="text-gray-600 italic">Nevyplněno</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {page.h1 || <span className="text-gray-600 italic">Nevyplněno</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-semibold ${getSEOScoreColor(page.seoScore)}`}>
                        {page.seoScore !== null ? `${page.seoScore}%` : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {page.published ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                          Aktivní
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
                          Neaktivní
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.open(`https://localhost:3000${page.path}`, '_blank')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Zobrazit stránku"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin_panel/seomaster/main-pages/edit/${page.id}`)}
                          className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                          title="Upravit SEO"
                        >
                          <Edit className="w-4 h-4 text-primary-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
