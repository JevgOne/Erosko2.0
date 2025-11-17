'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import EnhancedEditor from '../../landing-pages/components/EnhancedEditor';
import LocationPicker from './LocationPickerNew';

interface ContentBlockData {
  id?: string;
  identifier: string;
  type: 'TEXT' | 'RICH_TEXT' | 'JSON' | 'IMAGE' | 'VIDEO';
  title: string;
  content: string;
  data: string;
  page: string;
  section: string;
  published: boolean;
  order: number;
}

interface Props {
  blockId?: string;
  initialData?: Partial<ContentBlockData>;
}

export default function ContentBlockEditor({ blockId, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const [formData, setFormData] = useState<ContentBlockData>({
    identifier: initialData?.identifier || '',
    type: initialData?.type || 'TEXT',
    title: initialData?.title || '',
    content: initialData?.content || '',
    data: initialData?.data || '',
    page: initialData?.page || 'homepage',
    section: initialData?.section || '',
    published: initialData?.published ?? true,
    order: initialData?.order || 0,
  });

  const handleChange = (field: keyof ContentBlockData, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.identifier || !formData.title) {
      alert('Vyplňte prosím povinná pole (Identifier, Title)');
      return;
    }

    setSaving(true);
    try {
      const url = blockId
        ? `/api/admin/content-blocks/${blockId}`
        : '/api/admin/content-blocks';

      const method = blockId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert(blockId ? 'Content block aktualizován!' : 'Content block vytvořen!');
        router.push('/admin_panel/seomaster?tab=content-blocks');
        router.refresh();
      } else {
        alert(`Chyba: ${data.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  const renderContentEditor = () => {
    switch (formData.type) {
      case 'RICH_TEXT':
        return (
          <EnhancedEditor
            value={formData.content}
            onChange={(value) => handleChange('content', value)}
            placeholder="Začněte psát HTML obsah..."
            height="500px"
          />
        );

      case 'JSON':
        return (
          <textarea
            value={formData.data}
            onChange={(e) => handleChange('data', e.target.value)}
            placeholder='{"key": "value", "array": [1, 2, 3]}'
            className="w-full h-[500px] glass rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
          />
        );

      case 'TEXT':
      default:
        return (
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Začněte psát text..."
            className="w-full h-[300px] glass rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        );

      case 'IMAGE':
      case 'VIDEO':
        return (
          <input
            type="url"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder={formData.type === 'IMAGE' ? 'https://example.com/image.jpg' : 'https://youtube.com/embed/...'}
            className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">
                  {blockId ? 'Editovat Content Block' : 'Nový Content Block'}
                </span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {blockId ? 'Upravte existující content block' : 'Vytvořte nový editovatelný content block'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center space-x-2 px-4 py-2 glass rounded-xl hover:bg-white/10 transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span>{preview ? 'Editor' : 'Náhled'}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-medium glass-hover disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Ukládám...' : 'Uložit'}</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Metadata</h2>

              {/* Identifier */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Identifier <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.identifier}
                  onChange={(e) => handleChange('identifier', e.target.value)}
                  placeholder="hero_title, trust_stats, etc."
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={!!blockId} // Cannot change identifier after creation
                />
                <p className="text-xs text-gray-400 mt-1">
                  Unikátní identifikátor pro použití v kódu (nelze měnit po vytvoření)
                </p>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Nadpis Hero sekce"
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Lidsky čitelný název pro admin panel
                </p>
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Typ</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="TEXT" className="bg-dark-800">Text (prostý text)</option>
                  <option value="RICH_TEXT" className="bg-dark-800">Rich Text (HTML, WYSIWYG)</option>
                  <option value="JSON" className="bg-dark-800">JSON (strukturovaná data)</option>
                  <option value="IMAGE" className="bg-dark-800">Image (URL obrázku)</option>
                  <option value="VIDEO" className="bg-dark-800">Video (URL videa)</option>
                </select>
              </div>

              {/* Location Picker with Visual Preview */}
              <LocationPicker
                value={{ page: formData.page, section: formData.section }}
                onChange={(page, section) => {
                  handleChange('page', page);
                  handleChange('section', section);
                }}
              />

              {/* Order */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Pořadí</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center justify-between p-4 glass rounded-xl">
                <div>
                  <div className="font-medium">Publikováno</div>
                  <div className="text-sm text-gray-400">
                    {formData.published ? 'Zobrazeno na webu' : 'Skryto'}
                  </div>
                </div>
                <button
                  onClick={() => handleChange('published', !formData.published)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    formData.published ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.published ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Content Editor */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Obsah</h2>
              {renderContentEditor()}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Náhled</h2>

              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Identifier:</div>
                <code className="text-primary-400 font-mono text-sm">{formData.identifier || '(prázdné)'}</code>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Title:</div>
                <div className="text-white">{formData.title || '(prázdné)'}</div>
              </div>

              {formData.type === 'RICH_TEXT' && formData.content && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Rendered HTML:</div>
                  <div
                    className="prose prose-invert max-w-none p-4 glass rounded-xl"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                </div>
              )}

              {formData.type === 'TEXT' && formData.content && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Text:</div>
                  <div className="p-4 glass rounded-xl text-white whitespace-pre-wrap">
                    {formData.content}
                  </div>
                </div>
              )}

              {formData.type === 'JSON' && formData.data && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">JSON:</div>
                  <pre className="p-4 glass rounded-xl text-sm overflow-auto max-h-64">
                    {formData.data}
                  </pre>
                </div>
              )}

              {(formData.type === 'IMAGE' || formData.type === 'VIDEO') && formData.content && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">URL:</div>
                  <div className="p-4 glass rounded-xl text-primary-400 break-all text-sm">
                    {formData.content}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="text-sm text-blue-400">
                  <strong>Použití v kódu:</strong>
                  <pre className="mt-2 text-xs overflow-auto">
{`const content = await getContentBlock('${formData.identifier}');
// content.content nebo content.data`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
