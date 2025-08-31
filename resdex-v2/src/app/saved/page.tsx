'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getUiScale } from '../../lib/uiScale';

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
    // Apply UI scale for saved page
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--ui-scale', '0.8');
      document.documentElement.style.fontSize = `${16 * 0.8}px`;
    }

    loadSavedArticles();

    // Cleanup function to reset UI scale when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.style.removeProperty('--ui-scale');
        document.documentElement.style.fontSize = '16px';
      }
    };
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

            {/* Navbar */}  
      <nav className="relative z-10 flex items-center py-6 px-8 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image src="/beige-logo.png" alt="ResDex Logo" width={32} height={32} />
          <span className="ml-1 text-xl font-semibold">ResDex</span>
        </div>
        
        {/* Nav Links - centered absolutely */}
        <div className="hidden md:flex gap-6 bg-gray-50 rounded-full px-4 py-2 text-sm font-medium absolute left-1/2 -translate-x-1/2" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
          <a href="/" className="px-3 py-2 rounded-full hover:bg-gray-100 transition">Home</a>
          <a href="/digest" className="px-3 py-2 rounded-full hover:bg-gray-100 transition text-black bg-white shadow">Digest</a>
          <a href="/waitlist" className="px-3 py-2 rounded-full hover:bg-gray-100 transition">Brainwave</a>
          <a href="/waitlist" className="px-3 py-2 rounded-full hover:bg-gray-100 transition">Discovery ↗</a>
        </div>
      </nav>
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
            {/* Back to Digest Button - Top Left */}
            <div className="mb-6">
              <Link 
                href="/digest"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Digest
              </Link>
            </div>

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
                    className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
                    onClick={() => handleArticleClick(article)}
                  >
                    {/* Card Image with Fixed Aspect Ratio */}
                    <div className="relative aspect-[16/9] overflow-hidden flex-shrink-0">
                      <div 
                        className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                        style={{
                          background: '#E5E3DF'
                        }}
                        role="img"
                        aria-label={`Research article in ${article.tag}`}
                      >
                        <div className="text-center">
                          <div className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                            {article.tag}
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 bg-white/90 dark:bg-neutral-900/90 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                          {article.tag}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-black/90 text-white text-xs font-medium rounded-full">
                          {article.source}
                        </span>
                      </div>
                      
                      {/* Remove Button - Centered */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          className="p-2 bg-white/90 dark:bg-neutral-900/90 rounded-full hover:bg-white dark:hover:bg-neutral-900 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromSaved(article.id);
                          }}
                        >
                          <svg className="h-4 w-4 text-black-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Card Content - Fixed Height */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Meta Information */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          {article.published ? new Date(article.published).toLocaleDateString() : ''}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          {article.author.split(',')[0].trim() || 'Unknown Author'}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-black dark:group-hover:text-gray-300 transition-colors flex-1">
                        {article.title}
                      </h3>
                      
                      {/* Summary */}
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Saved
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400 group-hover:text-black dark:group-hover:text-gray-300 transition-colors">
                          <span className="text-xs font-medium">Read more</span>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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