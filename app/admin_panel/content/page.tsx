'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import Link from 'next/link';

interface ContentBlock {
  id: string;
  identifier: string;
  type: string;
  title: string;
  content: string;
  data: string;
  page: string;
  section: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function ContentManagementPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pageFilter, setPageFilter] = useState('all');

  useEffect(() => {
    fetchBlocks();
  }, [pageFilter]);

  const fetchBlocks = async () => {
    try {
      const url = pageFilter === 'all'
        ? '/api/admin/content-blocks'
        : `/api/admin/content-blocks?page=${pageFilter}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setBlocks(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch content blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string, published: boolean) => {
    try {
      const res = await fetch(`/api/admin/content-blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      });

      if (res.ok) {
        fetchBlocks();
      }
    } catch (error) {
      console.error('Failed to toggle published:', error);
    }
  };

  const deleteBlock = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento content block?')) return;

    try {
      const res = await fetch(`/api/admin/content-blocks/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchBlocks();
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  const filteredBlocks = blocks.filter((block) =>
    block.title?.toLowerCase().includes(search.toLowerCase()) ||
    block.identifier?.toLowerCase().includes(search.toLowerCase()) ||
    block.section?.toLowerCase().includes(search.toLowerCase())
  );

  const pages = ['all', 'homepage', 'about', 'contact'];

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="gradient-text">Content Management</span>
              </h1>
              <p className="text-gray-400">
                Upravujte texty a obsah na webu v reálném čase
              </p>
            </div>
            <Link
              href="/admin_panel/content/new"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-medium glass-hover"
            >
              <Plus className="w-5 h-5" />
              <span>Nový Content Block</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Celkem bloků</div>
              <div className="text-2xl font-bold">{blocks.length}</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Publikované</div>
              <div className="text-2xl font-bold text-green-400">
                {blocks.filter((b) => b.published).length}
              </div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Nepublikované</div>
              <div className="text-2xl font-bold text-orange-400">
                {blocks.filter((b) => !b.published).length}
              </div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Homepage bloky</div>
              <div className="text-2xl font-bold text-primary-400">
                {blocks.filter((b) => b.page === 'homepage').length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat podle názvu, identifikátoru nebo sekce..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Page Filter */}
            <select
              value={pageFilter}
              onChange={(e) => setPageFilter(e.target.value)}
              className="px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {pages.map((page) => (
                <option key={page} value={page} className="bg-dark-800">
                  {page === 'all' ? 'Všechny stránky' : page.charAt(0).toUpperCase() + page.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Blocks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Načítání content bloků...</p>
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2">Žádné content bloky</h3>
            <p className="text-gray-400 mb-6">
              {search ? 'Zkuste jiné hledání' : 'Vytvořte první content block'}
            </p>
            {!search && (
              <Link
                href="/admin_panel/content/new"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-medium glass-hover"
              >
                <Plus className="w-5 h-5" />
                <span>Vytvořit první block</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBlocks.map((block) => (
              <div
                key={block.id}
                className="glass rounded-xl p-6 hover:bg-white/5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold">{block.title || block.identifier}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400">
                        {block.type}
                      </span>
                      {!block.published && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                          Nepublikováno
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <span>ID: {block.identifier}</span>
                      <span>•</span>
                      <span>Stránka: {block.page}</span>
                      {block.section && (
                        <>
                          <span>•</span>
                          <span>Sekce: {block.section}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Pořadí: {block.order}</span>
                    </div>

                    {block.content && (
                      <div className="text-sm text-gray-300 line-clamp-2">
                        {block.type === 'RICH_TEXT' ? (
                          <div dangerouslySetInnerHTML={{ __html: block.content.substring(0, 150) + '...' }} />
                        ) : (
                          block.content.substring(0, 150) + (block.content.length > 150 ? '...' : '')
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => togglePublished(block.id, block.published)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title={block.published ? 'Skrýt' : 'Publikovat'}
                    >
                      {block.published ? (
                        <Eye className="w-5 h-5 text-green-400" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    <Link
                      href={`/admin_panel/content/edit/${block.id}`}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Editovat"
                    >
                      <Edit className="w-5 h-5 text-primary-400" />
                    </Link>

                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Smazat"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
