'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

interface RightSidebarProps {
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
}

export function RightSidebar({ onCategoryChange, selectedCategory = 'all' }: RightSidebarProps) {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        setLoading(true);
        
        // Determine table prefix based on environment
        const useDev = process.env.NEXT_PUBLIC_USE_DEV === '1';
        const tablePrefix = useDev ? 'dev_' : '';
        
        console.log('RightSidebar: Environment check:', {
          useDev,
          tablePrefix,
          NEXT_PUBLIC_USE_DEV: process.env.NEXT_PUBLIC_USE_DEV
        });
        
        // Fetch digest items to get categories and article counts
        const { data: digestItems, error } = await supabase
          .from(`${tablePrefix}daily_digest_items`)
          .select(`
            topic,
            ${tablePrefix}articles!inner(
              id,
              title,
              abstract,
              authors,
              published_at,
              link_abs
            )
          `);

        console.log('RightSidebar: Supabase query result:', {
          digestItems: digestItems?.length || 0,
          error,
          sampleTopics: digestItems?.slice(0, 3).map(item => item.topic)
        });

        if (error) {
          console.error('Error fetching digest data:', error);
          return;
        }

        // Count articles by category
        const counts: Record<string, number> = {};
        digestItems?.forEach(item => {
          if (item.topic) {
            counts[item.topic] = (counts[item.topic] || 0) + 1;
          }
        });

        console.log('RightSidebar: Category counts:', counts);

        setCategoryCounts(counts);
        setLoading(false);
      } catch (error) {
        console.error('Error in RightSidebar:', error);
        setLoading(false);
      }
    }

    fetchCategoryData();
  }, []);

  useEffect(() => {
    // Load user preferences from localStorage
    if (typeof window !== 'undefined') {
      const storedFavorites = localStorage.getItem('favoriteCategories');
      if (storedFavorites) {
        setFavoriteCategories(JSON.parse(storedFavorites));
      }
    }
  }, []);

  const toggleFavorite = (category: string) => {
    const newFavorites = favoriteCategories.includes(category)
      ? favoriteCategories.filter(c => c !== category)
      : [...favoriteCategories, category];
    
    setFavoriteCategories(newFavorites);
    localStorage.setItem('favoriteCategories', JSON.stringify(newFavorites));
  };

  const handleCategoryClick = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategory === category ? 'all' : category);
    }
  };

  // Get trending categories
  const trendingCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Get all available categories
  const allCategories = Object.keys(categoryCounts).sort();

  // Filter categories based on search
  const filteredCategories = categorySearch.trim() 
    ? allCategories.filter(category => category.toLowerCase().includes(categorySearch.toLowerCase()))
    : allCategories;

  if (loading) {
    return (
      <div className="sticky top-24 space-y-6">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24 space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Search Articles</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search research articles..."
            className="w-full px-4 py-2 pl-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Trending Topics</h3>
        <div className="space-y-3">
          {trendingCategories.length > 0 ? (
            trendingCategories.map(([cat, count], i) => (
              <div key={cat} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">#{i + 1}</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{cat}</span>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{count} articles</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-neutral-500 dark:text-neutral-400">No categories available</div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Categories</h3>
        
        {/* Search Categories */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full px-3 py-2 pl-9 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Favorites Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="w-4 h-4 text-black bg-neutral-100 border-neutral-300 rounded focus:ring-black dark:focus:ring-gray-300 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
            />
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Show Favorites Only</span>
          </label>
        </div>

        {/* Category List with Star Buttons */}
        <div className="max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div 
                  key={category} 
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === category 
                      ? 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800' 
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(category);
                      }}
                      className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <svg 
                        className={`h-4 w-4 ${favoriteCategories.includes(category) ? 'text-yellow-500 fill-current' : 'text-neutral-400 dark:text-neutral-500'}`} 
                        fill={favoriteCategories.includes(category) ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {category}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {categoryCounts[category] || 0} articles
                      </span>
                    </div>
                  </div>
                  {selectedCategory === category && (
                    <div className="w-2 h-2 bg-black dark:bg-gray-300 rounded-full"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                {categorySearch.trim() ? 'No categories match your search' : 'No categories available'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 