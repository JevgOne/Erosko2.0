'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface EnhancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  modules?: any;
}

export default function EnhancedEditor({
  value,
  onChange,
  placeholder = 'Začněte psát obsah...',
  height = '400px',
  modules: customModules,
}: EnhancedEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Enhanced toolbar with more formatting options
  const modules = useMemo(
    () =>
      customModules || {
        toolbar: [
          // Headers
          [{ header: [1, 2, 3, 4, 5, 6, false] }],

          // Font style
          [{ font: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],

          // Text formatting
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],

          // Text alignment
          [{ align: [] }],

          // Lists
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],

          // Block elements
          ['blockquote', 'code-block'],

          // Links and media
          ['link', 'image', 'video'],

          // Clear formatting
          ['clean'],
        ],
        clipboard: {
          matchVisual: false, // Better paste handling
        },
      },
    [customModules]
  );

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'align',
    'list',
    'bullet',
    'indent',
    'blockquote',
    'code-block',
    'link',
    'image',
    'video',
  ];

  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all ${
        isFocused
          ? 'ring-2 ring-primary-500/50 shadow-lg shadow-primary-500/20'
          : 'ring-1 ring-white/10'
      }`}
    >
      <style jsx global>{`
        .enhanced-editor .ql-toolbar {
          background: rgba(255, 255, 255, 0.03);
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px;
        }

        .enhanced-editor .ql-toolbar .ql-stroke {
          stroke: rgba(255, 255, 255, 0.7);
        }

        .enhanced-editor .ql-toolbar .ql-fill {
          fill: rgba(255, 255, 255, 0.7);
        }

        .enhanced-editor .ql-toolbar .ql-picker-label {
          color: rgba(255, 255, 255, 0.7);
        }

        .enhanced-editor .ql-toolbar button:hover .ql-stroke,
        .enhanced-editor .ql-toolbar button:focus .ql-stroke {
          stroke: #ec4899;
        }

        .enhanced-editor .ql-toolbar button:hover .ql-fill,
        .enhanced-editor .ql-toolbar button:focus .ql-fill {
          fill: #ec4899;
        }

        .enhanced-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #ec4899;
        }

        .enhanced-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #ec4899;
        }

        .enhanced-editor .ql-container {
          background: rgba(0, 0, 0, 0.3);
          border: none;
          font-size: 15px;
          font-family: inherit;
        }

        .enhanced-editor .ql-editor {
          min-height: ${height};
          color: white;
          padding: 20px;
        }

        .enhanced-editor .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.4);
          font-style: normal;
        }

        .enhanced-editor .ql-editor h1 {
          font-size: 2.5em;
          font-weight: bold;
          margin: 0.67em 0;
          color: white;
        }

        .enhanced-editor .ql-editor h2 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.75em 0;
          color: white;
        }

        .enhanced-editor .ql-editor h3 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
          color: white;
        }

        .enhanced-editor .ql-editor strong {
          font-weight: 600;
          color: white;
        }

        .enhanced-editor .ql-editor a {
          color: #ec4899;
          text-decoration: underline;
        }

        .enhanced-editor .ql-editor a:hover {
          color: #f472b6;
        }

        .enhanced-editor .ql-editor blockquote {
          border-left: 4px solid #ec4899;
          padding-left: 16px;
          margin: 16px 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .enhanced-editor .ql-editor code-block {
          background: rgba(255, 255, 255, 0.05);
          padding: 16px;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
        }

        .enhanced-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }

        /* Dropdown menus */
        .enhanced-editor .ql-picker-options {
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 4px;
        }

        .enhanced-editor .ql-picker-item {
          color: rgba(255, 255, 255, 0.7);
        }

        .enhanced-editor .ql-picker-item:hover {
          color: #ec4899;
          background: rgba(236, 72, 153, 0.1);
        }

        /* Color picker */
        .enhanced-editor .ql-color-picker .ql-picker-options,
        .enhanced-editor .ql-background .ql-picker-options {
          width: 150px;
        }
      `}</style>

      <div className="enhanced-editor">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
