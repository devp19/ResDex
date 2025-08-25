'use client';

import React, { useState, useEffect } from 'react';
import { useDigest } from '../context/DigestContext';

interface RightSidebarProps {
  categoryCounts: Record<string, number>;
  loading?: boolean;
}

export function RightSidebar({ categoryCounts, loading = false }: RightSidebarProps) {
  const { 
    selectedCategory, 
    showFavoritesOnly, 
    favoriteCategories,
    searchTerm,
    setSelectedCategory, 
    setShowFavoritesOnly, 
    setSearchTerm,
    toggleFavorite 
  } = useDigest();

  const [categorySearch, setCategorySearch] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Reset showAllCategories when search changes
  useEffect(() => {
    setShowAllCategories(false);
  }, [categorySearch]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? 'all' : category);
    setShowFavoritesOnly(false); // Reset favorites filter when category changes
  };

  const handleFavoritesToggle = (checked: boolean) => {
    setShowFavoritesOnly(checked);
    if (checked) {
      setSelectedCategory('all'); // Reset category filter when showing favorites
    }
  };

  const handleArticleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
  };

  // Get trending categories - safely handle undefined categoryCounts
  const trendingCategories = Object.entries(categoryCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8); // Show top 8 instead of 5

  // Get all available categories
  const allCategories = Object.keys(categoryCounts || {}).sort();

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
    <div className="sticky top-24 hover-scroll">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Search Articles</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search research articles..."
              value={searchTerm}
              onChange={handleArticleSearch}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Categories</h3>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {Object.keys(categoryCounts || {}).length} total
            </span>
          </div>
          
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
                onChange={(e) => handleFavoritesToggle(e.target.checked)}
                className="w-4 h-4 text-black bg-neutral-100 border-neutral-300 rounded focus:ring-black dark:focus:ring-gray-300 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
              />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Show Favorites Only</span>
            </label>
          </div>

          {/* Category List with Star Buttons */}
          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {filteredCategories.length > 0 ? (
                <>
                  {/* Show categories based on showAllCategories state */}
                  {(showAllCategories ? filteredCategories : filteredCategories.slice(0, 10)).map((category) => (
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
                            {categoryCounts?.[category] || 0} articles
                          </span>
                        </div>
                      </div>
                      {selectedCategory === category && (
                        <div className="w-2 h-2 bg-black dark:bg-gray-300 rounded-full"></div>
                      )}
                    </div>
                  ))}
                  
                  {/* Show expand/collapse button */}
                  {filteredCategories.length > 10 && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      {!showAllCategories ? (
                        <button
                          onClick={() => setShowAllCategories(true)}
                          className="w-full text-center py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                        >
                          View All {filteredCategories.length} Categories
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowAllCategories(false)}
                          className="w-full text-center py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                  {categorySearch.trim() ? 'No categories match your search' : 'No categories available'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 