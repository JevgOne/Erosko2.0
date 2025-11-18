'use client';

import { useState, useEffect } from 'react';
import { Eye, Edit, Save, X, Layers, FileText, Plus, Sparkles, Trash2 } from 'lucide-react';

interface ContentBlock {
  id: string;
  identifier: string;
  title: string;
  content: string;
  page: string;
  section: string;
  published: boolean;
  order: number;
}

interface PageSection {
  page: string;
  section: string;
  label: string;
  description: string;
  position: number;
  icon: string;
}

const PAGE_SECTIONS: PageSection[] = [
  // HOMEPAGE
  { page: 'homepage', section: 'hero-top', label: '🎯 NAD HERO', description: 'Banner nad hlavním Hero - urgentní oznámení, promo akce', position: 1, icon: '🎯' },
  { page: 'homepage', section: 'after-hero', label: '⭐ PO HERO', description: 'Hned pod hlavním Hero - důležitý content', position: 2, icon: '⭐' },
  { page: 'homepage', section: 'main', label: '📝 HLAVNÍ SEKCE', description: 'Mezi Categories a Trust Signals - SEO text', position: 3, icon: '📝' },
  { page: 'homepage', section: 'after-profiles', label: '🎨 PO PROFILECH', description: 'Pod profile kartami - další CTA nebo info', position: 4, icon: '🎨' },
  { page: 'homepage', section: 'footer', label: '🦶 PŘED PATIČKOU', description: 'Nad footerem - newsletter, social links', position: 5, icon: '🦶' },

  // HOLKY NA SEX
  { page: 'holky-na-sex', section: 'hero', label: '🎯 NAD CONTENTEM', description: 'Banner nad seznamem holek', position: 1, icon: '🎯' },
  { page: 'holky-na-sex', section: 'main', label: '📝 HLAVNÍ TEXT', description: 'SEO text - co nabízíme, jak to funguje', position: 2, icon: '📝' },
  { page: 'holky-na-sex', section: 'footer', label: '🦶 POD SEZNAMEM', description: 'Dodatečné info pod holkami', position: 3, icon: '🦶' },

  // PROFILE DETAIL
  { page: 'profile-detail', section: 'above-photos', label: '📸 NAD FOTKAMI', description: 'Promo banner nad fotogalerií', position: 1, icon: '📸' },
  { page: 'profile-detail', section: 'sidebar', label: '📌 SIDEBAR', description: 'Boční panel - reklama, tipy', position: 2, icon: '📌' },
  { page: 'profile-detail', section: 'below-description', label: '📝 POD POPISEM', description: 'Dodatečný content pod popisem profilu', position: 3, icon: '📝' },
];

const PAGES = [
  { id: 'homepage', name: 'Homepage', icon: '🏠', desc: 'Hlavní stránka webu' },
  { id: 'holky-na-sex', name: 'Holky na sex', icon: '💋', desc: 'Kategorie escort' },
  { id: 'profile-detail', name: 'Detail profilu', icon: '👤', desc: 'Stránka konkrétního profilu' },
  { id: 'eroticke-masaze', name: 'Erotické masáže', icon: '💆', desc: 'Kategorie masáže' },
  { id: 'bdsm', name: 'BDSM', icon: '⛓️', desc: 'Kategorie BDSM' },
];

export default function VisualEditorTab() {
  const [selectedPage, setSelectedPage] = useState('homepage');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [showNewBlockModal, setShowNewBlockModal] = useState<{page: string, section: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, [selectedPage]);

  const fetchBlocks = async () => {
    try {
      const res = await fetch(`/api/admin/content-blocks?page=${selectedPage}`);
      const data = await res.json();
      if (data.success) {
        setBlocks(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    }
  };

  const createNewBlock = async (page: string, section: string) => {
    const sectionInfo = PAGE_SECTIONS.find(s => s.page === page && s.section === section);

    const newBlock = {
      identifier: `${page}-${section}-${Date.now()}`,
      title: `Nový content - ${sectionInfo?.label || section}`,
      content: '<p>Vaš text zde...</p>',
      page,
      section,
      type: 'RICH_TEXT',
      published: false,
      order: blocks.filter(b => b.page === page && b.section === section).length,
    };

    try {
      const res = await fetch('/api/admin/content-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlock),
      });

      if (res.ok) {
        const data = await res.json();
        setEditingBlock(data.data);
        setShowNewBlockModal(null);
        fetchBlocks();
      }
    } catch (error) {
      console.error('Failed to create block:', error);
    }
  };

  const saveBlock = async (block: ContentBlock) => {
    try {
      const res = await fetch(`/api/admin/content-blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: block.title,
          content: block.content,
          published: block.published,
        }),
      });

      if (res.ok) {
        fetchBlocks();
        setEditingBlock(null);
      }
    } catch (error) {
      console.error('Failed to save block:', error);
    }
  };

  const deleteBlock = async (id: string) => {
    if (!confirm('Smazat tento content block?')) return;

    try {
      const res = await fetch(`/api/admin/content-blocks/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchBlocks();
        if (editingBlock?.id === id) setEditingBlock(null);
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  const togglePublished = async (block: ContentBlock) => {
    try {
      const res = await fetch(`/api/admin/content-blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !block.published }),
      });

      if (res.ok) {
        fetchBlocks();
      }
    } catch (error) {
      console.error('Failed to toggle published:', error);
    }
  };

  const pageSections = PAGE_SECTIONS.filter(s => s.page === selectedPage);
  const currentPage = PAGES.find(p => p.id === selectedPage);

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6">
      {/* Left Sidebar - Page Selector */}
      <div className="w-80 glass rounded-xl p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-bold">Stránky</h2>
        </div>

        <div className="space-y-2">
          {PAGES.map((page) => {
            const pageBlocks = blocks.filter(b => b.page === page.id);
            const publishedCount = pageBlocks.filter(b => b.published).length;

            return (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page.id)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedPage === page.id
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 shadow-lg'
                    : 'bg-dark-800/50 hover:bg-dark-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{page.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{page.name}</div>
                    <div className="text-xs text-gray-400">{page.desc}</div>
                  </div>
                </div>
                {pageBlocks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs mt-2">
                    <span className="px-2 py-1 bg-white/10 rounded-full">
                      {pageBlocks.length} bloků
                    </span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                      {publishedCount} live
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="text-sm text-blue-400 mb-2 font-semibold">💡 Jak to funguje?</div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>1. Vyber stránku vlevo</p>
            <p>2. Vidíš všechny sekce vpravo</p>
            <p>3. Klikni na "+ Přidat" u sekce</p>
            <p>4. Napiš text, ulož</p>
            <p>5. Aktivuj "Publikovat" → jde live!</p>
          </div>
        </div>
      </div>

      {/* Center - Visual Page Layout */}
      <div className="flex-1 glass rounded-xl p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{currentPage?.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">{currentPage?.name}</h2>
              <p className="text-sm text-gray-400">{currentPage?.desc}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {pageSections.map((section) => {
            const sectionBlocks = blocks.filter(b => b.section === section.section);
            const isHovered = hoveredSection === `${section.page}-${section.section}`;

            return (
              <div
                key={`${section.page}-${section.section}`}
                onMouseEnter={() => setHoveredSection(`${section.page}-${section.section}`)}
                onMouseLeave={() => setHoveredSection(null)}
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                  isHovered
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-gray-700 bg-dark-800/30'
                }`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <div className="font-bold text-lg">{section.label}</div>
                      <div className="text-sm text-gray-400">{section.description}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowNewBlockModal({page: section.page, section: section.section})}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Přidat
                  </button>
                </div>

                {/* Existing Blocks */}
                {sectionBlocks.length > 0 ? (
                  <div className="space-y-3">
                    {sectionBlocks.map((block) => (
                      <div
                        key={block.id}
                        className="bg-dark-800/50 rounded-lg p-4 border border-white/10 hover:border-primary-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{block.title}</span>
                            {block.published && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                                LIVE
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => togglePublished(block)}
                              className={`p-2 rounded-lg transition-all ${
                                block.published
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              }`}
                              title={block.published ? 'Skrýt' : 'Publikovat'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingBlock(block)}
                              className="p-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteBlock(block.id)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div
                          className="text-sm text-gray-400 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Žádný content v této sekci</p>
                    <p className="text-xs">Klikni na "Přidat" pro vytvoření</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar - Editor (when editing) */}
      {editingBlock && (
        <div className="w-96 glass rounded-xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary-400" />
              <h3 className="font-bold">Editor</h3>
            </div>
            <button
              onClick={() => setEditingBlock(null)}
              className="p-2 hover:bg-dark-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Název (interní)</label>
              <input
                type="text"
                value={editingBlock.title}
                onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder="Název pro administraci"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Obsah (HTML podporováno)</label>

              {/* HTML Quick Insert Buttons */}
              <div className="mb-2 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setEditingBlock({ ...editingBlock, content: editingBlock.content + '\n<p>Text</p>' })}
                  className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-white/10"
                  title="Přidat odstavec"
                >
                  &lt;p&gt;
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlock({ ...editingBlock, content: editingBlock.content + '\n<h2>Nadpis</h2>' })}
                  className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-white/10"
                  title="Přidat nadpis"
                >
                  &lt;h2&gt;
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlock({ ...editingBlock, content: editingBlock.content + '\n<h3>Podnadpis</h3>' })}
                  className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-white/10"
                  title="Přidat podnadpis"
                >
                  &lt;h3&gt;
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlock({ ...editingBlock, content: editingBlock.content + '<strong>Tučný text</strong>' })}
                  className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-white/10"
                  title="Tučné"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlock({ ...editingBlock, content: editingBlock.content + '<em>Kurzíva</em>' })}
                  className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-white/10"
                  title="Kurzíva"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlock({ ...editingBlock, content: editingBlock.content + '\n<a href="https://erosko.cz" className="text-primary-400 hover:underline">Odkaz</a>' })}
                  className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-white/10"
                  title="Přidat odkaz"
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('URL obrázku:');
                    if (url) setEditingBlock({ ...editingBlock, content: editingBlock.content + `\n<img src="${url}" alt="Obrázek" className="w-full rounded-lg my-4" />` });
                  }}
                  className="px-2 py-1 text-xs bg-primary-600 hover:bg-primary-500 rounded border border-primary-400"
                  title="Vložit obrázek"
                >
                  Obrázek
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlock({ ...editingBlock, content: editingBlock.content + '\n<ul>\n  <li>Položka 1</li>\n  <li>Položka 2</li>\n</ul>' })}
                  className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-white/10"
                  title="Seznam"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlock({ ...editingBlock, content: editingBlock.content + '\n<div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">\n  <p>Zvýrazněný box</p>\n</div>' })}
                  className="px-2 py-1 text-xs bg-dark-700 hover:bg-dark-600 rounded border border-white/10"
                  title="Zvýrazněný box"
                >
                  Box
                </button>
              </div>

              <textarea
                value={editingBlock.content}
                onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none font-mono text-sm"
                rows={12}
                placeholder="<p>Váš text zde...</p>"
              />
              <div className="text-xs text-gray-400 mt-1">
                HTML tagy: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;img&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;div&gt;
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium mb-2">Náhled</label>
              <div
                className="p-4 bg-dark-800/50 border border-white/10 rounded-lg prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: editingBlock.content }}
              />
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
              <div>
                <div className="font-medium">Publikovat</div>
                <div className="text-xs text-gray-400">Zobrazit na webu</div>
              </div>
              <button
                onClick={() => setEditingBlock({ ...editingBlock, published: !editingBlock.published })}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  editingBlock.published ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    editingBlock.published ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={() => saveBlock(editingBlock)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Save className="w-5 h-5" />
              Uložit změny
            </button>
          </div>
        </div>
      )}

      {/* New Block Modal */}
      {showNewBlockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNewBlockModal(null)}>
          <div className="bg-dark-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Vytvořit nový Content Block</h3>
            <p className="text-gray-400 mb-6">
              Vytvoříte nový blok v sekci:{' '}
              <span className="text-primary-400 font-semibold">
                {PAGE_SECTIONS.find(s => s.page === showNewBlockModal.page && s.section === showNewBlockModal.section)?.label}
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewBlockModal(null)}
                className="flex-1 px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl font-medium transition-all"
              >
                Zrušit
              </button>
              <button
                onClick={() => createNewBlock(showNewBlockModal.page, showNewBlockModal.section)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Vytvořit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
