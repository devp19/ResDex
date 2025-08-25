'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDigestForDay, getRecentIfEmpty, torontoDayISO } from '@/lib/digest';
import { createClient } from '@supabase/supabase-js';

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
  const [gridArticles, setGridArticles] = useState<any[]>([]);
  const [groupedArticles, setGroupedArticles] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [allArticles, setAllArticles] = useState<any[]>([]);

  // Page-level 80% UI scale to match your other pages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--ui-scale', '0.8');
      document.documentElement.style.fontSize = `${16 * 0.8}px`;
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.style.removeProperty('--ui-scale');
        document.documentElement.style.fontSize = '16px';
      }
    };
  }, []);

  // Load digest data
  useEffect(() => {
    async function loadDigest() {
      try {
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
            return {
              id: article.id,
              title: article.title,
              summary: toSnippet(article),
              tag: row.topic,
              link: article.link_abs || `https://arxiv.org/abs/${article.id}`,
              author: fmtAuthors(article.authors),
              published: article.published_at,
              source: article.source || 'arXiv',
              arxivCategory: article.id
            };
          } else {
            // This is a direct article (fallback case)
            return {
              id: row.id,
              title: row.title,
              summary: toSnippet(row),
              tag: row.topic,
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

        // Group articles by category for display
        const grouped = uniqueArticles.reduce((acc: Record<string, any[]>, article: any) => {
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
        
        setGridArticles(finalUniqueArticles);
        setAllArticles(finalUniqueArticles);
        setGroupedArticles(grouped);
        setLoading(false);
      } catch (err) {
        console.error('Digest page error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadDigest();
  }, []);

  // Load more articles function
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      // Determine table prefix based on environment
      const useDev = process.env.NEXT_PUBLIC_USE_DEV === '1';
      const tablePrefix = useDev ? 'dev_' : '';
      
      // Fetch more articles from Supabase with pagination
      const { data: moreArticles, error } = await supabase
        .from(`${tablePrefix}articles`)
        .select('*')
        .order('published_at', { ascending: false })
        .range(page * 20 + 20, page * 20 + 39); // Fetch next 20 articles

      if (error) {
        console.error('Error loading more articles:', error);
        return;
      }

      if (moreArticles && moreArticles.length > 0) {
        // Transform the new articles
        const transformedArticles = moreArticles.map((article: any) => {
          return {
            id: article.id,
            title: article.title,
            summary: toSnippet(article),
            tag: article.topic || 'Research',
            link: article.link_abs || `https://arxiv.org/abs/${article.id}`,
            author: fmtAuthors(article.authors),
            published: article.published_at,
            source: article.source || 'arXiv',
            arxivCategory: article.id
          };
        });

        // Combine existing and new articles, then deduplicate by ID
        const combinedArticles = [...allArticles, ...transformedArticles];
        const uniqueArticles = combinedArticles.filter((article, index, self) => 
          index === self.findIndex(a => a.id === article.id)
        );
        
        // Update all articles state
        setAllArticles(uniqueArticles);
        
        // Update grid articles to show all unique articles
        setGridArticles(uniqueArticles);
        
        // Update grouped articles with unique articles
        const updatedGrouped = uniqueArticles.reduce((acc: Record<string, any[]>, article: any) => {
          const category = article.tag;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(article);
          return acc;
        }, {});
        setGroupedArticles(updatedGrouped);
        
        // Update pagination state
        setPage(prev => prev + 1);
        setHasMore(moreArticles.length === 20); // If we got less than 20, we've reached the end
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error in loadMore:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading research digest...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Digest</h1>
          <pre className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-sm overflow-auto">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Main Layout (uses global header & left rail) */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Center Column */}
          <main className="lg:col-span-12">
            {/* Hero Card - First Article */}
            {gridArticles.length > 0 && (
              <div className="mb-8">
                <Link href={`/digest/${gridArticles[0].id}`} className="block">
                  <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    {/* Hero Image - Top */}
                    <div className="relative aspect-[7/3] w-full">
                      <div 
                        className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                        style={{
                          background: '#E5E3DF'
                        }}
                        role="img"
                        aria-label={`Featured research in ${gridArticles[0].tag}`}
                      >
                        <div className="text-center p-4">
                          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                            {gridArticles[0].tag}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            Featured Research
                          </div>
                        </div>
                      </div>
                      {/* Tag Badge - Left side */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 dark:bg-neutral-900/90 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                          {gridArticles[0].tag}
                        </span>
                      </div>
                      {/* Source Badge - Right side */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/90 text-white text-xs font-medium rounded-full">
                          {gridArticles[0].source || 'arXiv'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Hero Content - Bottom */}
                    <div className="p-6">
                       {/* Metadata Row */}
                       <div className="flex items-center gap-3 mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                         <div className="flex items-center gap-1">
                           <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <circle cx="12" cy="12" r="10"/>
                             <path d="M12 6v6l4 2"/>
                           </svg>
                           {gridArticles[0].published ? timeSince(new Date(gridArticles[0].published)) : 'Recent'}
                         </div>
                         <div className="flex items-center gap-1">
                           <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                           </svg>
                           {gridArticles[0].author}
                         </div>
                         <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs font-medium rounded-full">
                           {gridArticles[0].tag}
                         </span>
                       </div>

                       {/* Hero Headline */}
                       <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                         {gridArticles[0].title}
                       </h2>

                       {/* Hero Summary */}
                       <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 leading-relaxed">
                         {gridArticles[0].summary || 'Research overview not available'}
                       </p>

                      {/* CTA Buttons - Save on left, Read more on right */}
                      <div className="flex items-center justify-between">
                        {/* Save Button - Left side */}
                        <button 
                          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <svg 
                            className="h-4 w-4 text-neutral-500 dark:text-neutral-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        
                        {/* Read More Button - Right side */}
                        <div className="flex items-center gap-1 text-neutral-400 group-hover:text-blue-500 transition-colors">
                          <span className="text-sm font-medium">Read more</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Stable Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {gridArticles.slice(1).map((article: any, index: number) => (
                <div 
                  key={`${article.id}-${index}`}
                  className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-[350px] flex flex-col w-full flex-shrink-0"
                >
                  {/* Card Image with Gradient */}
                  <div className="relative aspect-[16/9] overflow-hidden flex-shrink-0">
                    <div 
                      className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                      style={{
                        background: '#E5E3DF'
                      }}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                          {article.tag}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-white/90 dark:bg-neutral-900/90 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                        {article.tag}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-black/90 text-white text-xs font-medium rounded-full">
                        {article.source}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Meta Information */}
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                      <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
                        </svg>
                        {article.published ? timeSince(new Date(article.published)) : ''}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {article.author.split(',')[0].trim()}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0">
                      {article.title}
                    </h3>
                    
                    {/* Research Overview */}
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 flex-1">
                      {article.summary}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {/* Save Button */}
                        <button 
                          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <svg 
                            className="h-4 w-4 text-neutral-500 dark:text-neutral-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-400 group-hover:text-blue-500 transition-colors">
                        <Link 
                          href={`/digest/${article.id}`}
                          className="flex items-center gap-1 text-neutral-400 group-hover:text-blue-500 transition-colors cursor-pointer hover:text-blue-500"
                        >
                          <span className="text-sm font-medium">Read more</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Articles
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  Showing {gridArticles.length - 1} grid articles + 1 hero article • Click to load more from Supabase
                </p>
              </div>
            )}

            {/* No More Articles Message */}
            {!hasMore && gridArticles.length > 0 && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    All articles loaded ({gridArticles.length} total)
                  </span>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
} 