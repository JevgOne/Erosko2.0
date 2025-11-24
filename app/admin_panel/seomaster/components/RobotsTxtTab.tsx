'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, Code2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RobotsTxtTab() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch current robots.txt
  const fetchRobotsTxt = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seo/robots-txt');
      const data = await response.json();

      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Failed to fetch robots.txt:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRobotsTxt();
  }, []);

  // Validate robots.txt syntax
  const validateRobotsTxt = (text: string): string[] => {
    const errors: string[] = [];
    const lines = text.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) return;

      const parts = trimmed.split(':');
      if (parts.length !== 2) {
        errors.push(`Line ${index + 1}: Invalid syntax - should be "Directive: value"`);
        return;
      }

      const directive = parts[0].trim();
      const validDirectives = ['User-agent', 'Disallow', 'Allow', 'Sitemap', 'Crawl-delay'];

      if (!validDirectives.includes(directive)) {
        errors.push(`Line ${index + 1}: Unknown directive "${directive}"`);
      }
    });

    return errors;
  };

  // Handle content change
  const handleContentChange = (value: string) => {
    setContent(value);
    const errors = validateRobotsTxt(value);
    setValidationErrors(errors);
  };

  // Save robots.txt
  const handleSave = async () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before saving');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/seo/robots-txt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.success) {
        alert('robots.txt saved successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save robots.txt');
    } finally {
      setSaving(false);
    }
  };

  // Load template
  const loadTemplate = () => {
    const template = `# robots.txt for Erosko.cz

User-agent: *
Allow: /

# Sitemaps
Sitemap: https://www.erosko.cz/sitemap.xml

# Block admin areas
Disallow: /admin_panel/
Disallow: /api/

# Block search parameters
Disallow: /*?*search=
Disallow: /*?*filter=

# Crawl delay (optional - use with caution)
# Crawl-delay: 10
`;
    setContent(template);
    setValidationErrors([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-400" />
          <span>Loading robots.txt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-1">robots.txt Editor</h2>
          <p className="text-gray-400">Control search engine crawler access</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTemplate}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
          >
            <Code2 className="w-4 h-4" />
            Load Template
          </button>
          <button
            onClick={handleSave}
            disabled={saving || validationErrors.length > 0}
            className="px-6 py-2 gradient-primary rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save robots.txt
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass rounded-xl p-6 border border-blue-500/30 bg-blue-500/10">
        <div className="flex items-start gap-3">
          <Code2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-400 mb-2">robots.txt Guide</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <code className="text-primary-400">User-agent: *</code> - applies to all bots</li>
              <li>• <code className="text-primary-400">Disallow: /path/</code> - blocks access to path</li>
              <li>• <code className="text-primary-400">Allow: /path/</code> - allows access to path</li>
              <li>• <code className="text-primary-400">Sitemap: URL</code> - points to your sitemap</li>
              <li>• Lines starting with <code className="text-primary-400">#</code> are comments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {validationErrors.length === 0 && content.trim().length > 0 && (
        <div className="glass rounded-xl p-4 border border-green-500/30 bg-green-500/10">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Syntax is valid!</span>
          </div>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-2">Validation Errors:</p>
              <ul className="text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="bg-white/5 px-6 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">File: /public/robots.txt</span>
            <span className="text-xs text-gray-400">{content.split('\n').length} lines</span>
          </div>
        </div>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-[500px] px-6 py-4 bg-dark-900 text-white font-mono text-sm focus:outline-none resize-none"
            placeholder="# Enter robots.txt content here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Example */}
      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold mb-3">Common Examples</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-400 mb-2">Block admin areas:</p>
            <code className="block bg-dark-900 p-3 rounded-lg text-primary-400">
              Disallow: /admin_panel/
              <br />
              Disallow: /api/
            </code>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Block specific bots:</p>
            <code className="block bg-dark-900 p-3 rounded-lg text-primary-400">
              User-agent: BadBot
              <br />
              Disallow: /
            </code>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Add sitemap:</p>
            <code className="block bg-dark-900 p-3 rounded-lg text-primary-400">
              Sitemap: https://www.erosko.cz/sitemap.xml
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
