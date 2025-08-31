'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDigestForDay, getRecentIfEmpty, torontoDayISO } from '@/lib/digest';
import { createClient } from '@supabase/supabase-js';
import { useDigest } from './context/DigestContext';
import { useCategoryContext } from './layout';
import './DailyDigest.css';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to create clean snippets from ai_summary or abstract
function toSnippet(article: any): string {
  const raw = (article.ai_summary ?? article.abstract ?? '').replace(/\s+/g, ' ').trim();
  if (!raw) return 'Research overview not available';
  // Soft-trim to ~220 chars
  const max = 220;
  if (raw.length <= max) return raw;
  const cut = raw.slice(0, max);
  // try to end on a neat boundary
  const boundary = cut.lastIndexOf('. ');
  const safe = boundary > 120 ? cut.slice(0, boundary + 1) : cut;
  return safe.replace(/[ ,;:]+$/, '') + '…';
}

function fmtAuthors(authors?: any) {
  if (!authors) return '';
  if (Array.isArray(authors)) {
    const flat = authors.filter(Boolean);
    return flat.slice(0, 2).join(', ') + (flat.length > 2 ? ' et al.' : '');
  }
  const s = String(authors);
  const arr = s.split(',').map(a => a.trim());
  return arr.slice(0, 2).join(', ') + (arr.length > 2 ? ' et al.' : '');
}

function timeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

export default function DigestPage() {
  const { selectedCategory, showFavoritesOnly, favoriteCategories, searchTerm, clearFilters, setShowFavoritesOnly } = useDigest();
  const { setCategoryCounts, setSidebarLoading } = useCategoryContext();
  
  const [gridArticles, setGridArticles] = useState<any[]>([]);
  const [groupedArticles, setGroupedArticles] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [categoryOffset, setCategoryOffset] = useState<Record<string, number>>({});

  // Page-level 80% UI scale to match your other pages
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     document.documentElement.style.setProperty('--ui-scale', '0.8');
  //     document.documentElement.style.fontSize = `${16 * 0.8}px`;
  //   }
  //   return () => {
  //     if (typeof window !== 'undefined') {
  //       document.documentElement.style.removeProperty('--ui-scale');
  //       document.documentElement.style.fontSize = '16px';
  //     }
  //   };
  // }, []);

  // Calculate and update category counts whenever allArticles changes
  useEffect(() => {
    // Category counts are now calculated during initial data loading
    // and stored in the context, so we don't need to recalculate here
    setSidebarLoading(false);
  }, [allArticles, setSidebarLoading, setCategoryCounts]);

  // Filter articles based on selected category, favorites, and search term
  const getFilteredArticles = () => {
    let filtered = allArticles;

    // Debug logging
    console.log('Filtering articles:', {
      totalArticles: allArticles.length,
      selectedCategory,
      showFavoritesOnly,
      favoriteCategories,
      searchTerm,
      availableTags: [...new Set(allArticles.map(a => a.tag))]
    });

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(article => {
        return (
          article.title.toLowerCase().includes(searchLower) ||
          article.summary.toLowerCase().includes(searchLower) ||
          article.author.toLowerCase().includes(searchLower) ||
          article.tag.toLowerCase().includes(searchLower)
        );
      });
      console.log(`After search filter ("${searchTerm}"): ${filtered.length} articles`);
    }

    // Filter by selected category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.tag.trim() === selectedCategory.trim());
      console.log(`After category filter (${selectedCategory}): ${filtered.length} articles`);
    }

    // Filter by favorites if enabled
    if (showFavoritesOnly && favoriteCategories.length > 0) {
      filtered = filtered.filter(article => favoriteCategories.some(fav => fav.trim() === article.tag.trim()));
      console.log(`After favorites filter: ${filtered.length} articles`);
    }

    return filtered;
  };

  // Update filtered articles when filters change
  useEffect(() => {
    const filtered = getFilteredArticles();
    setGridArticles(filtered);
  }, [selectedCategory, showFavoritesOnly, favoriteCategories, searchTerm, allArticles]);

  // Auto-load all articles when category changes (except 'all')
  useEffect(() => {
    const loadCategoryArticles = async () => {
      if (selectedCategory === 'all') {
        setHasMore(true);
        return;
      }

      try {
        // Check total count first
        const { count: totalCount, error: countError } = await supabase
          .from('dev_articles')
          .select('*', { count: 'exact', head: true })
          .eq('topic', selectedCategory);

        if (countError) {
          console.error('Error getting category count:', countError);
          return;
        }

        // If 10 or fewer articles, load all. If more than 10, load first batch with pagination
        const shouldLoadAll = (totalCount ?? 0) <= 10;
        const limit = shouldLoadAll ? undefined : 20; // Load 20 initially if >10 total

        const { data: categoryArticles, error } = await supabase
          .from('dev_articles')
          .select('*')
          .eq('topic', selectedCategory)
          .order('published_at', { ascending: false })
          .limit(limit || 1000); // Use large number if loading all

        if (error) {
          console.error('Error loading category articles:', error);
          return;
        }

        if (categoryArticles && categoryArticles.length > 0) {
          // Transform the articles
          const transformedArticles = categoryArticles.map((article: any) => {
            const topic = article.topic || 'Research';
            return {
              id: article.id,
              title: article.title,
              summary: toSnippet(article),
              tag: topic,
              link: article.link_abs || `https://arxiv.org/abs/${article.id}`,
              author: fmtAuthors(article.authors),
              published: article.published_at,
              source: article.source || 'arXiv',
              arxivCategory: article.id
            };
          });

          // Update allArticles with category-specific articles (keep existing articles from other categories)
          setAllArticles(prev => {
            // Remove existing articles from this category and add new ones
            const filtered = prev.filter(article => article.tag !== selectedCategory);
            return [...filtered, ...transformedArticles];
          });

          // Set hasMore based on whether we loaded all articles or there are more
          setHasMore(!shouldLoadAll && (totalCount ?? 0) > categoryArticles.length);
          
          // Update category offset for pagination
          setCategoryOffset(prev => ({
            ...prev,
            [selectedCategory]: categoryArticles.length
          }));
          
          console.log(`Loaded ${categoryArticles.length} of ${totalCount} articles for category: ${selectedCategory}`);
          console.log(`Load more available: ${!shouldLoadAll && (totalCount ?? 0) > categoryArticles.length}`);
        }
      } catch (err) {
        console.error('Error in loadCategoryArticles:', err);
      }
    };

    if (selectedCategory !== 'all') {
      loadCategoryArticles();
    } else {
      setHasMore(true);
    }
  }, [selectedCategory]);

  // Auto-load articles when favorites filter changes
  useEffect(() => {
    const loadFavoritesArticles = async () => {
      if (!showFavoritesOnly || favoriteCategories.length === 0) {
        setHasMore(true);
        return;
      }

      try {
        // Check total count for favorites first
        const { count: totalCount, error: countError } = await supabase
          .from('dev_articles')
          .select('*', { count: 'exact', head: true })
          .in('topic', favoriteCategories);

        if (countError) {
          console.error('Error getting favorites count:', countError);
          return;
        }

        // If 20 or fewer articles, load all. If more, load first batch with pagination
        const shouldLoadAll = (totalCount ?? 0) <= 20;
        const limit = shouldLoadAll ? undefined : 30; // Load 30 initially if >20 total

        const { data: favoritesArticles, error } = await supabase
          .from('dev_articles')
          .select('*')
          .in('topic', favoriteCategories)
          .order('published_at', { ascending: false })
          .limit(limit || 1000); // Use large number if loading all

        if (error) {
          console.error('Error loading favorites articles:', error);
          return;
        }

        if (favoritesArticles && favoritesArticles.length > 0) {
          // Transform the articles
          const transformedArticles = favoritesArticles.map((article: any) => {
            const topic = article.topic || 'Research';
            return {
              id: article.id,
              title: article.title,
              summary: toSnippet(article),
              tag: topic,
              link: article.link_abs || `https://arxiv.org/abs/${article.id}`,
              author: fmtAuthors(article.authors),
              published: article.published_at,
              source: article.source || 'arXiv',
              arxivCategory: article.id
            };
          });

          // Update allArticles with favorites articles (replace existing)
          setAllArticles(transformedArticles);

          // Set hasMore based on whether we loaded all articles or there are more
          setHasMore(!shouldLoadAll && (totalCount ?? 0) > favoritesArticles.length);
          
          // Update category offset for favorites pagination
          setCategoryOffset(prev => ({
            ...prev,
            'favorites': favoritesArticles.length
          }));
          
          console.log(`Loaded ${favoritesArticles.length} of ${totalCount} favorites articles from ${favoriteCategories.length} categories`);
          console.log(`Favorite categories: ${favoriteCategories.join(', ')}`);
          console.log(`Load more available: ${!shouldLoadAll && (totalCount ?? 0) > favoritesArticles.length}`);
        } else {
          // No articles found for favorites
          setAllArticles([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error in loadFavoritesArticles:', err);
      }
    };

    if (showFavoritesOnly && favoriteCategories.length > 0) {
      loadFavoritesArticles();
    } else if (!showFavoritesOnly) {
      // When favorites is turned off, reload the normal view
      reloadNormalView();
    }
  }, [showFavoritesOnly, favoriteCategories]);

  // Function to reload normal view (either all articles or specific category)
  const reloadNormalView = async () => {
    try {
      setLoadingMore(true);
      
      if (selectedCategory === 'all') {
        // Reload initial articles for "all" view
        const { data: initialArticles, count, error } = await supabase
          .from('dev_articles')
          .select('*', { count: 'exact' })
          .order('published_at', { ascending: false })
          .limit(100);
        
        if (error) {
          console.error('Error reloading normal view:', error);
          return;
        }
        
        if (initialArticles) {
          const transformedArticles = initialArticles.map((article: any) => {
            const topic = article.topic || 'Research';
            return {
              id: article.id,
              title: article.title,
              summary: toSnippet(article),
              tag: topic,
              link: article.link_abs || `https://arxiv.org/abs/${article.id}`,
              author: fmtAuthors(article.authors),
              published: article.published_at,
              source: article.source || 'arXiv',
              arxivCategory: article.id
            };
          });
          
          setAllArticles(transformedArticles);
          setHasMore(true);
          
          // Reset category offset when going back to normal view
          setCategoryOffset({});
          
          if (count !== null) setTotalCount(count);
        }
      } else {
        // Reload specific category (this will trigger the category effect)
        // We don't need to do anything here as the category effect will handle it
        setHasMore(true);
      }
      
      console.log('Reloaded normal view');
    } catch (err) {
      console.error('Error in reloadNormalView:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Load digest data
  useEffect(() => {
    async function loadDigest() {
      try {
        setSidebarLoading(true);
        const today = torontoDayISO();
        console.log('Toronto day:', today);
        
        let items = await getDigestForDay(today);
        console.log('Digest items count:', items.length);

        // First-run / empty safety: show recent if digest isn't built yet
        const fallback = items.length === 0 ? await getRecentIfEmpty() : null;
        console.log('Fallback count:', fallback?.length || 0);

        // Transform data to match the expected structure
        const articles = (items.length > 0 ? items : fallback || []).map((row: any) => {
          if (row.articles || row.dev_articles) {
            // This is a digest item with joined article
            const article = row.articles || row.dev_articles;
            // Use the digest item's topic first, fallback to article's topic
            const topic = (row.topic || article.topic || 'Research').trim();
            return {
              id: article.id,
              title: article.title,
              summary: toSnippet(article),
              tag: topic,
              link: article.link_abs || `https://arxiv.org/abs/${article.id}`,
              author: fmtAuthors(article.authors),
              published: article.published_at,
              source: article.source || 'arXiv',
              arxivCategory: article.id
            };
          } else {
            // This is a direct article (fallback case)
            const topic = (row.topic || 'Research').trim();
            return {
              id: row.id,
              title: row.title,
              summary: toSnippet(row),
              tag: topic,
              link: row.link_abs || `https://arxiv.org/abs/${row.id}`,
              author: fmtAuthors(row.authors),
              published: row.published_at,
              source: row.source || 'arXiv',
              arxivCategory: row.id
            };
          }
        });

        // Deduplicate articles by ID to prevent duplicates
        const uniqueArticles = articles.filter((article, index, self) => 
          index === self.findIndex(a => a.id === article.id)
        );

        console.log('Initial unique articles:', uniqueArticles.length);

        // Fetch a reasonable initial dataset for display and category counts
        console.log('Fetching initial dataset for display and category counts...');
        const { data: initialArticles, count, error } = await supabase
          .from('dev_articles')
          .select('*', { count: 'exact' })
          .order('published_at', { ascending: false })
          .limit(100); // Fetch 100 articles initially for better UX
        
        if (error) {
          console.error('Error fetching initial articles:', error);
        }
        
        if (count !== null) setTotalCount(count);
        
        let finalArticles = uniqueArticles;
        if (initialArticles && initialArticles.length > 0) {
          const transformedInitial = initialArticles.map((article: any) => {
            const topic = article.topic || 'Research';
            return {
              id: article.id,
              title: article.title,
              summary: toSnippet(article),
              tag: topic,
              link: article.link_abs || `https://arxiv.org/abs/${article.id}`,
              author: fmtAuthors(article.authors),
              published: article.published_at,
              source: article.source || 'arXiv',
              arxivCategory: article.id
            };
          });
          
          // Combine and deduplicate
          const combined = [...uniqueArticles, ...transformedInitial];
          finalArticles = combined.filter((article, index, self) => 
            index === self.findIndex(a => a.id === article.id)
          );
          console.log(`Fetched ${initialArticles.length} initial articles, total unique: ${finalArticles.length}`);
        }

        // Fetch accurate category counts directly from database using aggregation
        console.log('Fetching accurate category counts from database...');
        try {
          // Use a more efficient approach with RPC function if available, or fall back to client-side counting
          const { data: categoryCountsData, error: countsError } = await supabase
          .from('dev_articles')
            .select('topic')
            .not('topic', 'is', null);
          
          if (countsError) {
            console.error('Error fetching category counts:', countsError);
            setCategoryCounts({});
            return;
          }
          
          // Calculate accurate category counts from all articles in database
          const accurateCounts: Record<string, number> = {};
          if (categoryCountsData) {
            categoryCountsData.forEach((row: any) => {
              if (row.topic) {
                const normalizedTopic = row.topic.trim();
                accurateCounts[normalizedTopic] = (accurateCounts[normalizedTopic] || 0) + 1;
              }
            });
          }
          
          console.log('✅ Accurate category counts calculated from', categoryCountsData?.length || 0, 'total articles');
          console.log('📊 Found', Object.keys(accurateCounts).length, 'unique categories');
          setCategoryCounts(accurateCounts);
        } catch (error) {
          console.error('Failed to fetch category counts:', error);
          setCategoryCounts({});
        }

        // Group articles by category for display
        const grouped = finalArticles.reduce((acc: Record<string, any[]>, article: any) => {
          const category = article.tag;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(article);
          return acc;
        }, {});

        // Flatten articles for grid display and ensure uniqueness
        const flatArticles = Object.values(grouped).flat();
        const finalUniqueArticles = flatArticles.filter((article, index, self) => 
          index === self.findIndex(a => a.id === article.id)
        );
        
        console.log('Available categories in articles:', [...new Set(finalUniqueArticles.map(a => a.tag))]);
        console.log('Sample articles with tags:', finalUniqueArticles.slice(0, 3).map(a => ({ title: a.title, tag: a.tag })));
        console.log('Total articles loaded:', finalUniqueArticles.length);
        
        setAllArticles(finalUniqueArticles);
        setGroupedArticles(grouped);
        setLoading(false);
      } catch (err) {
        console.error('Digest page error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
        setSidebarLoading(false);
      }
    }

    loadDigest();
  }, [setSidebarLoading]);

  // Load more articles function
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      const PAGE_SIZE = selectedCategory !== 'all' ? 50 : 30; // Load more when filtering by category
      
      // Use filter-aware offset for pagination
      const currentOffset = selectedCategory !== 'all' 
        ? (categoryOffset[selectedCategory] || 0)
        : showFavoritesOnly && favoriteCategories.length > 0
        ? (categoryOffset['favorites'] || 0)
        : allArticles.length;
      
      const from = currentOffset;
      const to = from + PAGE_SIZE - 1;

      // Build query with optional filters
      let query = supabase
        .from('dev_articles')
        .select('*', { count: 'exact' })
        .order('published_at', { ascending: false });

      // Apply category filter if selected
      if (selectedCategory !== 'all') {
        query = query.eq('topic', selectedCategory);
      }
      
      // Apply favorites filter if enabled
      if (showFavoritesOnly && favoriteCategories.length > 0) {
        query = query.in('topic', favoriteCategories);
      }

      // Apply pagination
      const { data: moreArticles, count, error } = await query.range(from, to);

      if (error) {
        console.error('Error loading more articles:', error);
        setLoadingMore(false);
        return;
      }

      if (moreArticles && moreArticles.length > 0) {
        // Transform the new articles
        const transformedArticles = moreArticles.map((article: any) => {
          const topic = article.topic || 'Research';
          return {
            id: article.id,
            title: article.title,
            summary: toSnippet(article),
            tag: topic,
            link: article.link_abs || `https://arxiv.org/abs/${article.id}`,
            author: fmtAuthors(article.authors),
            published: article.published_at,
            source: article.source || 'arXiv',
            arxivCategory: article.id
          };
        });

        // De-dupe by id just in case
        setAllArticles(prev => {
          const map = new Map(prev.map(a => [a.id, a]));
          for (const r of transformedArticles) map.set(r.id, r);
          return Array.from(map.values());
        });
        
        // Update category offset for pagination
        if (selectedCategory !== 'all') {
          setCategoryOffset(prev => ({
            ...prev,
            [selectedCategory]: (prev[selectedCategory] || 0) + transformedArticles.length
          }));
        } else if (showFavoritesOnly) {
          // For favorites, track offset under 'favorites' key
          setCategoryOffset(prev => ({
            ...prev,
            'favorites': (prev['favorites'] || 0) + transformedArticles.length
          }));
        }
        
        // Update grouped articles with unique articles
        const updatedGrouped = Array.from(new Map([...allArticles, ...transformedArticles].map(a => [a.id, a])).values())
          .reduce((acc: Record<string, any[]>, article: any) => {
            const category = article.tag;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(article);
            return acc;
          }, {});
        setGroupedArticles(updatedGrouped);
        
        if (count !== null) setTotalCount(count);
        setHasMore(to + 1 < (count ?? 0));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error in loadMore:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Get filtered articles for display
  const displayArticles = getFilteredArticles();
  const heroArticle = displayArticles[0];
  const gridArticlesToShow = displayArticles.slice(1);

  // Check if showing favorites but no categories are favorited
  const showingFavoritesWithNone = showFavoritesOnly && favoriteCategories.length === 0;

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading research digest...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-regular text-red-600">Error Loading Digest</h1>
          <pre className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-sm overflow-auto">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <>
      {/* Filter Status Display */}
      {(selectedCategory !== 'all' || showFavoritesOnly || searchTerm.trim()) && (
        <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13.586A1 1 0 016 12.879V4z" />
              </svg>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {searchTerm.trim() && showFavoritesOnly && selectedCategory !== 'all' 
                  ? `Showing ${selectedCategory} articles from favorites matching "${searchTerm}"`
                  : searchTerm.trim() && showFavoritesOnly 
                  ? `Showing articles from favorites matching "${searchTerm}"`
                  : searchTerm.trim() && selectedCategory !== 'all'
                  ? `Showing ${selectedCategory} articles matching "${searchTerm}"`
                  : searchTerm.trim()
                  ? `Showing articles matching "${searchTerm}"`
                  : showFavoritesOnly && selectedCategory !== 'all' 
                  ? `Showing ${selectedCategory} articles from favorites`
                  : showFavoritesOnly 
                  ? `Showing ${displayArticles.length} articles from favorites`
                  : `Showing ${displayArticles.length} articles in ${selectedCategory}`
                }
              </span>
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 underline"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* No Favorites Message */}
      {showingFavoritesWithNone && (
        <div className="mb-8 p-8 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="h-16 w-16 text-neutral-400 dark:text-neutral-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No Favorite Categories
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              You haven't favorited any categories yet. Star some categories in the sidebar to see your personalized feed here.
            </p>
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
            >
              Browse All Articles
            </button>
          </div>
        </div>
      )}

      {/* Hero Card - First Article */}
      {!showingFavoritesWithNone && heroArticle && (
        <div className="mb-8">
          <Link href={`/digest/${heroArticle.id}`} className="block">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-800/50 transition-all duration-300 cursor-pointer group">
              <div className="relative aspect-[21/9] w-full">
                <div 
                  className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                  style={{ background: '#E5E3DF' }}
                  role="img"
                  aria-label={`Featured research in ${heroArticle.tag}`}
                >
                  <div className="text-center p-4">
                    <div className="text-3xl font-regular text-neutral-800 dark:text-neutral-200 mb-2">
                      {heroArticle.tag}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Featured Research
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-white/90 dark:bg-neutral-900/90 text-sm font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                    {heroArticle.tag}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 bg-black/90 text-white text-sm font-medium rounded-full">
                    {heroArticle.source || 'arXiv'}
                  </span>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    <span className='text-xs'>{heroArticle.published ? timeSince(new Date(heroArticle.published)) : 'Recent'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span className="truncate max-w-[200px] text-xs">{heroArticle.author}</span>
                  </div>
                  <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-xs font-regulara rounded-full">
                    {heroArticle.source || 'arXiv'}
                  </span>
                </div>
                
                <h2 className="text-xl md:text-xl font-regular text-neutral-900 dark:text-neutral-100 mb-4 line-clamp-2 transition-colors leading-tight">
                  {heroArticle.title}
                </h2>
                
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 line-clamp-3 leading-relaxed">
                  {heroArticle.summary}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <svg className="h-5 w-5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                    <span className="text-sm font-regular">Read full article</span>
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Grid Articles */}
      {!showingFavoritesWithNone && gridArticlesToShow.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
          {gridArticlesToShow.map((article) => (
            <div key={article.id} className="group">
              <Link href={`/digest/${article.id}`} className="block">
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
                  {/* Image/Header Section */}
                  <div className="relative aspect-[4/3] w-full">
                    <div 
                      className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                      style={{ background: '#E5E3DF' }}
                      role="img"
                      aria-label={`Research in ${article.tag}`}
                    >
                      <div className="text-center p-4">
                        <div className="text-lg font-regular text-neutral-800 dark:text-neutral-200 mb-1">
                          {article.tag}
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          Research
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-white/90 dark:bg-neutral-900/90 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                        {article.tag}
                      </span>
                    </div>

                    
                  </div>
                  
                  
                  {/* Content Section */}
                  <div className="p-4 flex-1 flex flex-col">
                    

                    {/* Meta Information */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
                        </svg>
                        {article.published ? timeSince(new Date(article.published)) : 'Recent'}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span className='text-xs'>{article.author.split(',')[0].trim()}</span>
                      </div>
                    </div>
                    

                    {/* Title */}
                    <h3 className="text-medium font-regular text-neutral-900 dark:text-neutral-100 mb-3 line-clamp-2 transition-colors flex-shrink-0">
                      {article.title}
                    </h3>
                    
                    {/* Summary */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 flex-1">
                      {article.summary}
                    </p>

                    
                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-auto flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                          <svg className="h-4 w-4 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                                             <div className="flex items-center gap-1 text-neutral-400 transition-colors">
                         <div className="flex items-center gap-1 text-neutral-400 transition-colors cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200">
                           <span className="text-sm font-medium">Read more</span>
                           <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                           </svg>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!showingFavoritesWithNone && hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore || !hasMore}
            className="px-6 py-3 rounded-xl bg-black text-white disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : hasMore ? 'Load More Articles' : 'No more articles'}
          </button>
          <p className="mt-3 text-sm text-neutral-500">
            Showing {displayArticles.length}{totalCount ? ` of ${totalCount}` : ''} articles
          </p>
        </div>
      )}

      {/* No More Articles Message */}
      {!showingFavoritesWithNone && !hasMore && displayArticles.length > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {selectedCategory === 'all' 
                ? `All articles loaded (${displayArticles.length}${totalCount ? ` of ${totalCount}` : ''} total)`
                : `All ${displayArticles.length} articles in ${selectedCategory} loaded`
              }
            </span>
          </div>
        </div>
      )}
    </>
  );
} 