'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Users,
  FileText,
  Globe,
  BarChart3,
  ArrowRight,
  FileCode,
  Layout,
  Shield,
  MessageSquare,
  Eye,
} from 'lucide-react';
import DashboardTab from './components/DashboardTab';
import ProfilesTab from './components/ProfilesTab';
import LandingPagesTab from './components/LandingPagesTab';
import AllPagesTab from './components/AllPagesTab';
import RedirectsTab from './components/RedirectsTab';
import RobotsTxtTab from './components/RobotsTxtTab';
import ContentBlocksTab from './components/ContentBlocksTab';
import MainPagesTab from './components/MainPagesTab';
import AIReviewsTab from './components/AIReviewsTab';
import VisualEditorTab from './components/VisualEditorTab';

type Tab = 'dashboard' | 'profiles' | 'landing-pages' | 'main-pages' | 'all-pages' | 'redirects' | 'robots' | 'content-blocks' | 'ai-reviews' | 'visual-editor';

export default function SEOMasterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl font-bold gradient-text">SEO MASTER</h1>
          </div>
          <button
            onClick={() => router.push('/admin_panel')}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 text-gray-300 rounded-lg hover:bg-dark-800 transition-colors border border-white/10"
            title="Zpět do Admin Panelu"
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">ADMIN PANEL</span>
          </button>
        </div>
        <p className="text-gray-400">
          AI-powered SEO management • Google Gemini
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="glass rounded-xl p-2 mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('visual-editor')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'visual-editor'
              ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-xl shadow-primary-500/50 scale-105'
              : 'bg-gradient-to-r from-primary-500/20 to-pink-500/20 text-white hover:from-primary-500/30 hover:to-pink-500/30'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="font-bold">✨ Visual Editor</span>
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('profiles')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'profiles'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-5 h-5" />
          Profily & Podniky
        </button>
        <button
          onClick={() => setActiveTab('landing-pages')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'landing-pages'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-5 h-5" />
          Landing Pages
        </button>
        <button
          onClick={() => setActiveTab('main-pages')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'main-pages'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layout className="w-5 h-5" />
          Hlavní Stránky
        </button>
        <button
          onClick={() => setActiveTab('all-pages')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'all-pages'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-5 h-5" />
          Všechny Stránky
        </button>
        <button
          onClick={() => setActiveTab('redirects')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'redirects'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
          Redirects
        </button>
        <button
          onClick={() => setActiveTab('robots')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'robots'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileCode className="w-5 h-5" />
          robots.txt
        </button>
        <button
          onClick={() => setActiveTab('content-blocks')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'content-blocks'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-5 h-5" />
          Content Blocks
        </button>
        <button
          onClick={() => setActiveTab('ai-reviews')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'ai-reviews'
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          AI Recenze
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'visual-editor' && <VisualEditorTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'profiles' && <ProfilesTab />}
        {activeTab === 'landing-pages' && <LandingPagesTab />}
        {activeTab === 'main-pages' && <MainPagesTab />}
        {activeTab === 'all-pages' && <AllPagesTab />}
        {activeTab === 'redirects' && <RedirectsTab />}
        {activeTab === 'robots' && <RobotsTxtTab />}
        {activeTab === 'content-blocks' && <ContentBlocksTab />}
        {activeTab === 'ai-reviews' && <AIReviewsTab />}
      </div>
    </div>
  );
}
