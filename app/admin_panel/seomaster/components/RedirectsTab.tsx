'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
  Upload,
  Download,
  BarChart3,
  Search,
} from 'lucide-react';

interface Redirect {
  id: string;
  from: string;
  to: string;
  type: number;
  hits: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RedirectsTab() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    type: 301,
  });

  // Fetch redirects
  const fetchRedirects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seo/redirects');
      const data = await response.json();

      if (data.success) {
        setRedirects(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch redirects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  // Add/Update redirect
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/seo/redirects/${editingId}` : '/api/seo/redirects';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingId ? 'Redirect updated!' : 'Redirect created!');
        setFormData({ from: '', to: '', type: 301 });
        setEditingId(null);
        fetchRedirects();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Failed to save redirect');
    }
  };

  // Delete redirect
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this redirect?')) return;

    try {
      const response = await fetch(`/api/seo/redirects/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Redirect deleted!');
        fetchRedirects();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete redirect');
    }
  };

  // Toggle enabled
  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/seo/redirects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });

      const data = await response.json();

      if (data.success) {
        fetchRedirects();
      }
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  // Edit redirect
  const handleEdit = (redirect: Redirect) => {
    setEditingId(redirect.id);
    setFormData({
      from: redirect.from,
      to: redirect.to,
      type: redirect.type,
    });
  };

  // Export to CSV
  const handleExport = () => {
    const csv = [
      'From,To,Type,Hits,Enabled',
      ...redirects.map((r) => `${r.from},${r.to},${r.type},${r.hits},${r.enabled}`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redirects-${Date.now()}.csv`;
    a.click();
  };

  // Filter redirects
  const filteredRedirects = redirects.filter(
    (r) =>
      r.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeLabel = (type: number) => {
    switch (type) {
      case 301:
        return { label: '301 Permanent', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 302:
        return { label: '302 Temporary', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 307:
        return { label: '307 Temporary', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      default:
        return { label: '301 Permanent', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-400" />
          <span>Loading redirects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-1">Redirect Manager</h2>
          <p className="text-gray-400">Manage URL redirects (301, 302, 307)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchRedirects}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? 'Edit Redirect' : 'Add New Redirect'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From URL</label>
              <input
                type="text"
                required
                placeholder="/old-page"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To URL</label>
              <input
                type="text"
                required
                placeholder="/new-page"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              >
                <option value={301}>301 - Permanent</option>
                <option value={302}>302 - Temporary</option>
                <option value={307}>307 - Temporary (preserve method)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-6 py-2 gradient-primary rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Update Redirect' : 'Add Redirect'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ from: '', to: '', type: 301 });
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <ArrowRight className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-gray-400">Total Redirects</span>
          </div>
          <div className="text-3xl font-bold">{redirects.length}</div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <ToggleRight className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Active</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {redirects.filter((r) => r.enabled).length}
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Hits</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {redirects.reduce((sum, r) => sum + r.hits, 0)}
          </div>
        </div>
      </div>

      {/* Redirects List */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search redirects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Hits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRedirects.map((redirect) => (
                <tr key={redirect.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-300">{redirect.from}</code>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-primary-400">{redirect.to}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs border ${getTypeLabel(redirect.type).color}`}>
                      {getTypeLabel(redirect.type).label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">{redirect.hits}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(redirect.id, redirect.enabled)}
                      className="flex items-center gap-2"
                    >
                      {redirect.enabled ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-green-400">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-500">Disabled</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(redirect)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(redirect.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRedirects.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {searchQuery ? 'No redirects match your search' : 'No redirects yet. Add one above!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
