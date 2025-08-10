'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Article {
  id: string;
  title: string;
  summary: string;
  tag: string;
  link: string;
  author: string;
  published: string;
  source: string;
  arxivCategory: string;
  aiSummary?: string;
}

export default function SavedArticlesPage() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedArticles();
  }, []);

  const loadSavedArticles = () => {
    try {
      const savedIds = localStorage.getItem('savedArticles');
      const allArticles = localStorage.getItem('allArticles');
      
      if (savedIds && allArticles) {
        const savedIdsSet = new Set(JSON.parse(savedIds));
        const articles = JSON.parse(allArticles);
        const saved = articles.filter((article: Article) => savedIdsSet.has(article.id));
        setSavedArticles(saved);
      }
    } catch (error) {
      console.error('Error loading saved articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromSaved = (articleId: string) => {
    try {
      const savedIds = localStorage.getItem('savedArticles');
      if (savedIds) {
        const savedIdsSet = new Set(JSON.parse(savedIds));
        savedIdsSet.delete(articleId);
        localStorage.setItem('savedArticles', JSON.stringify(Array.from(savedIdsSet)));
        setSavedArticles(prev => prev.filter(article => article.id !== articleId));
      }
    } catch (error) {
      console.error('Error removing saved article:', error);
    }
  };

  const addToHistory = (article: Article) => {
    try {
      const history = localStorage.getItem('articleHistory') || '[]';
      const historyArray = JSON.parse(history);
      
      // Add timestamp
      const articleWithTimestamp = {
        ...article,
        viewedAt: new Date().toISOString()
      };
      
      // Remove if already exists and add to beginning
      const filteredHistory = historyArray.filter((item: any) => item.id !== article.id);
      const newHistory = [articleWithTimestamp, ...filteredHistory].slice(0, 100); // Keep last 100
      
      localStorage.setItem('articleHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  const handleArticleClick = (article: Article) => {
    addToHistory(article);
    window.open(article.link, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading saved articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/beige-logo.png" alt="ResDex Logo" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">ResDex</span>
            </div>

            {/* Center: Main Navigation */}
            <nav className="flex items-center gap-8">
              <a href="/" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Home
              </a>
              <a href="/digest" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Digest
              </a>
              <a href="#" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Brainwave
              </a>
              <a href="#" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Discovery
              </a>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <svg className="h-5 w-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative">
                <svg className="h-5 w-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.83 2.83l4.24 4.24M20 12h-5l5-5v5zM4.83 19.17l4.24-4.24" />
                </svg>
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar */}
              <button className="flex items-center gap-2 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <nav className="space-y-2">
                <a href="/digest" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Discover
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Following
                </a>
                <a href="/saved" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Saved
                </a>
                <a href="/history" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  History
                </a>
              </nav>
            </div>
          </aside>

          {/* Center Column */}
          <main className="lg:col-span-7">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Saved Articles</h1>
            
            {/* Articles Grid */}
            {savedArticles.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No saved articles</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Articles you save will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedArticles.map((article) => (
                  <div 
                    key={article.id} 
                    className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    {/* Card Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img 
                        src={`https://source.unsplash.com/400x225/?research,${encodeURIComponent(article.tag || 'science')}`} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 dark:bg-neutral-900/90 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                          {article.tag}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-blue-500/90 text-white text-xs font-medium rounded-full">
                          {article.source}
                        </span>
                      </div>
                      
                      {/* Remove Button */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          className="p-2 bg-white/90 dark:bg-neutral-900/90 rounded-full hover:bg-white dark:hover:bg-neutral-900 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromSaved(article.id);
                          }}
                        >
                          <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-6">
                      {/* Meta Information */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          {article.published ? new Date(article.published).toLocaleDateString() : ''}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          {article.author.split(',')[0].trim()}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                      
                      {/* Summary */}
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Saved
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400 group-hover:text-blue-500 transition-colors">
                          <span className="text-sm font-medium">Read more</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Search Bar */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Search Articles</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search research articles..."
                    className="w-full px-4 py-2 pl-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Saved Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Saved</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {savedArticles.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Categories</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {new Set(savedArticles.map(article => article.tag)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
} 