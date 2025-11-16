'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  FileText,
  Globe,
  MapPin,
  Sparkles,
} from 'lucide-react';

const pageTypeLabels = {
  CATEGORY: { label: '📁 Category', color: 'text-blue-400', icon: '📁' },
  CITY: { label: '🏙️ City', color: 'text-green-400', icon: '🏙️' },
  CATEGORY_CITY: { label: '📍 Category+City', color: 'text-purple-400', icon: '📍' },
  CUSTOM: { label: '✨ Custom', color: 'text-yellow-400', icon: '✨' },
};

interface LandingPage {
  id: string;
  path: string;
  type: keyof typeof pageTypeLabels;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  content: string | null;
  keywords: string | null;
  published: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function LandingPagesTab() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    path: '',
    type: 'CUSTOM' as keyof typeof pageTypeLabels,
    seoTitle: '',
    seoDescription: '',
    h1: '',
    content: '',
    keywords: '',
    published: true,
  });

  // Fetch landing pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      });

      const response = await fetch(`/api/admin/landing-pages?${params}`);
      const data = await response.json();

      if (data.success) {
        setPages(data.data.pages);
      }
    } catch (error) {
      console.error('Failed to fetch landing pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [searchQuery, typeFilter]);

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPage
        ? `/api/admin/landing-pages/${editingPage.id}`
        : '/api/admin/landing-pages';

      const response = await fetch(url, {
        method: editingPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingPage ? 'Stránka upravena!' : 'Stránka vytvořena!');
        setShowForm(false);
        setEditingPage(null);
        resetForm();
        fetchPages();
      } else {
        alert('Chyba: ' + data.error);
      }
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Chyba při ukládání');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu smazat tuto stránku?')) return;

    try {
      const response = await fetch(`/api/admin/landing-pages/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Stránka smazána!');
        fetchPages();
      } else {
        alert('Chyba: ' + data.error);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Chyba při mazání');
    }
  };

  // Handle edit
  const handleEdit = (page: LandingPage) => {
    setEditingPage(page);
    setFormData({
      path: page.path,
      type: page.type,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      h1: page.h1,
      content: page.content || '',
      keywords: page.keywords || '',
      published: page.published,
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      path: '',
      type: 'CUSTOM',
      seoTitle: '',
      seoDescription: '',
      h1: '',
      content: '',
      keywords: '',
      published: true,
    });
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingPage(null);
    resetForm();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Landing Pages</h2>
          <p className="text-gray-400 text-sm">
            Spravuj SEO stránky pro kategorie, města a custom pages
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nová Stránka
        </button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat stránky..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          >
            <option value="all">Všechny typy</option>
            <option value="CATEGORY">📁 Kategorie</option>
            <option value="CITY">🏙️ Města</option>
            <option value="CATEGORY_CITY">📍 Kategorie + Město</option>
            <option value="CUSTOM">✨ Custom</option>
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingPage ? 'Upravit Stránku' : 'Nová Stránka'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Path */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL Path *
                </label>
                <input
                  type="text"
                  placeholder="/holky-na-sex"
                  value={formData.path}
                  onChange={(e) =>
                    setFormData({ ...formData, path: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Typ Stránky *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as keyof typeof pageTypeLabels,
                    })
                  }
                  className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  required
                >
                  <option value="CATEGORY">📁 Category</option>
                  <option value="CITY">🏙️ City</option>
                  <option value="CATEGORY_CITY">📍 Category + City</option>
                  <option value="CUSTOM">✨ Custom</option>
                </select>
              </div>
            </div>

            {/* SEO Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SEO Title (max 60 znaků) *
              </label>
              <input
                type="text"
                placeholder="Holky na sex Praha | Top Společnice | EROSKO.CZ"
                value={formData.seoTitle}
                onChange={(e) =>
                  setFormData({ ...formData, seoTitle: e.target.value })
                }
                maxLength={60}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                required
              />
              <div className="text-xs text-gray-400 mt-1">
                {formData.seoTitle.length}/60
              </div>
            </div>

            {/* H1 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">H1 *</label>
              <input
                type="text"
                placeholder="Holky na sex Praha"
                value={formData.h1}
                onChange={(e) =>
                  setFormData({ ...formData, h1: e.target.value })
                }
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                required
              />
            </div>

            {/* SEO Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                META Description (150-160 znaků) *
              </label>
              <textarea
                placeholder="Nejlepší holky na sex v Praze. Ověřené profily, diskrétní kontakt bez zprostředkovatele..."
                value={formData.seoDescription}
                onChange={(e) =>
                  setFormData({ ...formData, seoDescription: e.target.value })
                }
                maxLength={160}
                rows={3}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                required
              />
              <div className="text-xs text-gray-400 mt-1">
                {formData.seoDescription.length}/160
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keywords (oddělené čárkou)
              </label>
              <input
                type="text"
                placeholder="holky na sex praha, sex holky, společnice praha"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SEO Content (HTML podporováno)
              </label>
              <textarea
                placeholder="<p>Vítejte na stránce...</p>"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={8}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none font-mono text-sm"
              />
            </div>

            {/* Published */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-300">Publikováno</label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary flex-1">
                {editingPage ? 'Uložit Změny' : 'Vytvořit Stránku'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary flex-1"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium text-sm">
                  Path
                </th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">
                  Typ
                </th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">
                  SEO Title
                </th>
                <th className="text-center p-4 text-gray-400 font-medium text-sm">
                  Views
                </th>
                <th className="text-center p-4 text-gray-400 font-medium text-sm">
                  Status
                </th>
                <th className="text-center p-4 text-gray-400 font-medium text-sm">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary-400 mx-auto" />
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400">
                    Žádné stránky nenalezeny
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr
                    key={page.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {/* Path */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary-400" />
                        <span className="text-white font-mono text-sm">
                          {page.path}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-4">
                      <span
                        className={`text-sm ${
                          pageTypeLabels[page.type].color
                        }`}
                      >
                        {pageTypeLabels[page.type].icon}{' '}
                        {pageTypeLabels[page.type].label.split(' ')[1]}
                      </span>
                    </td>

                    {/* SEO Title */}
                    <td className="p-4">
                      <div className="text-sm text-gray-300">
                        {page.seoTitle}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {page.seoDescription.substring(0, 60)}...
                      </div>
                    </td>

                    {/* Views */}
                    <td className="p-4 text-center">
                      <div className="text-sm text-gray-300">
                        {page.viewCount}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      {page.published ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30">
                          ✓ Live
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-lg border border-gray-500/30">
                          ○ Draft
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => window.open(page.path, '_blank')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleEdit(page)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-yellow-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
