'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Eye, ArrowLeft, Sparkles } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface LandingPage {
  id?: string;
  path: string;
  type: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  content: string;
  keywords: string;
  focusKeyword: string;
  secondaryKeywords: string;
  published: boolean;
}

interface Props {
  pageId?: string;
  initialData?: Partial<LandingPage>;
}

export default function LandingPageEditor({ pageId, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const [formData, setFormData] = useState<LandingPage>({
    path: initialData?.path || '',
    type: initialData?.type || 'CUSTOM',
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    h1: initialData?.h1 || '',
    content: initialData?.content || '',
    keywords: initialData?.keywords || '',
    focusKeyword: initialData?.focusKeyword || '',
    secondaryKeywords: initialData?.secondaryKeywords || '',
    published: initialData?.published ?? true,
  });

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'align',
    'link',
    'image',
  ];

  const handleChange = (field: keyof LandingPage, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.path || !formData.seoTitle || !formData.seoDescription || !formData.h1) {
      alert('Vyplňte prosím všechna povinná pole (URL Path, SEO Title, SEO Description, H1)');
      return;
    }

    // Path validation - must start with /
    if (!formData.path.startsWith('/')) {
      alert('URL Path musí začínat lomítkem (/)');
      return;
    }

    setSaving(true);
    try {
      const url = pageId
        ? `/api/admin/landing-pages/${pageId}`
        : '/api/admin/landing-pages';

      const method = pageId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(pageId ? 'Stránka byla úspěšně aktualizována!' : 'Stránka byla úspěšně vytvořena!');
        router.push('/admin_panel/landing-pages');
      } else {
        alert('Chyba: ' + data.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Chyba při ukládání stránky');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = () => {
    if (formData.h1) {
      const slug = '/' + formData.h1
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      handleChange('path', slug);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Zpět
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {pageId ? 'Upravit Landing Page' : 'Nová Landing Page'}
        </h1>
      </div>

      {/* Preview Toggle */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
            preview
              ? 'border-pink-600 text-pink-600 bg-pink-50'
              : 'border-gray-300 text-gray-700 hover:border-gray-400'
          }`}
        >
          <Eye size={20} />
          {preview ? 'Skrýt náhled' : 'Zobrazit náhled'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save size={20} />
          {saving ? 'Ukládání...' : 'Uložit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Základní informace</h2>

            {/* URL Path */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Path <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => handleChange('path', e.target.value)}
                  placeholder="/moje-landing-page"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button
                  onClick={generateSlug}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                  title="Generovat z H1"
                >
                  <Sparkles size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Např. /holky-na-sex-praha</p>
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typ stránky
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="CUSTOM">Vlastní</option>
                <option value="CITY">Město</option>
                <option value="CATEGORY">Kategorie</option>
                <option value="SERVICE">Služba</option>
              </select>
            </div>

            {/* H1 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                H1 Nadpis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.h1}
                onChange={(e) => handleChange('h1', e.target.value)}
                placeholder="Hlavní nadpis stránky"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Published */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => handleChange('published', e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm font-medium text-gray-700">Publikovat ihned</span>
              </label>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">SEO Metadata</h2>

            {/* SEO Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({formData.seoTitle.length}/60)
                </span>
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => handleChange('seoTitle', e.target.value)}
                placeholder="Optimalizovaný SEO titulek (50-60 znaků)"
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* SEO Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Description <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({formData.seoDescription.length}/160)
                </span>
              </label>
              <textarea
                value={formData.seoDescription}
                onChange={(e) => handleChange('seoDescription', e.target.value)}
                placeholder="Popis pro vyhledávače (150-160 znaků)"
                maxLength={160}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Focus Keyword */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Focus Keyword
              </label>
              <input
                type="text"
                value={formData.focusKeyword}
                onChange={(e) => handleChange('focusKeyword', e.target.value)}
                placeholder="holky na sex praha"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Secondary Keywords */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Keywords
              </label>
              <input
                type="text"
                value={formData.secondaryKeywords}
                onChange={(e) => handleChange('secondaryKeywords', e.target.value)}
                placeholder="escort praha, erotické služby, slečny (oddělené čárkou)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Meta Keywords */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Obsah stránky</h2>
            <div className="prose-editor">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(value) => handleChange('content', value)}
                modules={modules}
                formats={formats}
                placeholder="Zde napište obsah vaší landing page. Můžete používat formátování, obrázky, odkazy..."
                className="h-96 mb-12"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {preview && (
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye size={20} />
                Náhled
              </h2>

              {/* Google SERP Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Google Preview</h3>
                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">erosko.cz › {formData.path.slice(1)}</div>
                  <div className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
                    {formData.seoTitle || 'SEO Title'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formData.seoDescription || 'SEO Description'}
                  </div>
                </div>
              </div>

              {/* Page Preview */}
              <div className="border-t border-gray-200 pt-4">
                <h1 className="text-3xl font-bold mb-4">{formData.h1 || 'H1 Nadpis'}</h1>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p>Obsah stránky...</p>' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
