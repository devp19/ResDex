'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import '../DailyDigest.css';

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
  image_url?: string;
}

interface ArticleProps {
  article: Article;
}

function fmtAuthors(author: string) {
  if (!author) return '';
  const authors = author.split(',').map(a => a.trim());
  return authors.slice(0, 2).join(', ') + (authors.length > 2 ? ' et al.' : '');
}

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
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

export default function Article({ article }: ArticleProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Page-level UI scale
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

  // Related articles from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const allArticles = localStorage.getItem('allArticles');
      if (allArticles) {
        try {
          const articles: Article[] = JSON.parse(allArticles);
          const related = articles
            .filter(a => a.id !== article.id)
            .filter(a => {
              if (article.author && a.author &&
                  a.author.toLowerCase().includes(article.author.toLowerCase())) return true;
              if (article.arxivCategory && a.arxivCategory === article.arxivCategory) return true;
              if (article.tag && a.tag === article.tag) return true;
              return false;
            })
            .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
            .slice(0, 6);

          setRelatedArticles(related);
        } catch (e) {
          console.error('Error parsing articles from localStorage:', e);
        }
      }
      setLoading(false);
    }
  }, [article.id, article.arxivCategory, article.tag, article.author]);

  const handleExternalLink = () => {
    if (article?.link) window.open(article.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full">
      {/* Back to Digest */}
      <div className="mb-6">
        <Link
          href="/digest"
          className="inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Digest
        </Link>
      </div>

      {/* Container + 12-col grid */}
      <div className="w-full">
        <div className="grid grid-cols-12 gap-0">
          {/* LEFT rail (Key Details) */}
          <aside className="hidden lg:block fixed left-50 top-45 w-80 z-10">
          <div className="sticky top-24 px-6">
              {/* Metadata */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Author:</span>
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Published:</span>
                  <span>{article.published ? timeSince(new Date(article.published)) : 'Unknown'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Source:</span>
                  <span>{article.source}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-300 dark:border-neutral-600 mb-6" />

              {/* Read Full Article Button */}
              <div className="mb-6">
                <button
                  onClick={handleExternalLink}
                  className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Read Full Article
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-300 dark:border-neutral-600 mb-6" />

              {/* Key Details */}
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Key Details</h2>
              <ul className="space-y-3 text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <div><strong>Category: </strong>{article.tag}</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <div><strong>arXiv Category: </strong>{article.arxivCategory}</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <div><strong>Research Type: </strong>{article.source} Publication</div>
                </li>
              </ul>
            </div>
          </aside>

          {/* MAIN: hero + About */}
          <main className="col-span-12 lg:flex lg:justify-center">
            <div className="max-w-4xl">
              {/* HERO (taller + uses image_url if present) */}
              <div className="mb-12">
              <div className="relative w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden
                              h-[420px]">
                {article.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-white dark:bg-neutral-900"
                    style={{ background: '#E5E3DF' }}
                    role="img"
                    aria-label={`Research article in ${article.tag}`}
                  >
                    <div className="text-center p-8">
                      <div className="text-4xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                        {article.tag}
                      </div>
                      <div className="text-lg text-neutral-600 dark:text-neutral-400">
                        Research Article
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ABOUT / SUMMARY (uncapped width) */}
            <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Research Overview</h2>
            <div className="max-w-none">
              {article.summary && (
                <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 mb-6">
                  {article.summary}
                </p>
              )}
              {article.aiSummary && (
                <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 mb-8">
                  {article.aiSummary}
                </p>
              )}
            </div>
            </div>
          </main>

          {/* RIGHT: Related Articles */}
          <aside className="hidden lg:block fixed right-50 top-45 w-80 z-10">
            <div className="sticky top-24 px-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-3">Related Articles</h2>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                      <div className="aspect-[16/9] bg-neutral-200 dark:bg-neutral-700" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : relatedArticles.length === 0 ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">No related articles found.</p>
              ) : (
                <div className="space-y-4">
                  {relatedArticles.map((ra) => (
                    <Link key={ra.id} href={`/digest/${encodeURIComponent(ra.id)}`} className="block">
                      <article className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
                        {/* Card Image with Fixed Aspect Ratio */}
                        <div className="relative aspect-[16/9] overflow-hidden flex-shrink-0">
                          <div 
                            className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                            style={{
                              background: '#E5E3DF'
                            }}
                            role="img"
                            aria-label={`Research article in ${ra.tag}`}
                          >
                            <div className="text-center">
                              <div className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                                {ra.tag}
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 bg-white/90 dark:bg-neutral-900/90 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                              {ra.tag}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-0.5 bg-black/90 text-white text-xs font-medium rounded-full">
                              {ra.source}
                            </span>
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
                              {ra.published ? timeSince(new Date(ra.published)) : ''}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                              </svg>
                              {ra.author.split(',')[0].trim() || 'Unknown Author'}
                            </div>
                          </div>
                          
                          {/* Title */}
                          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-black dark:group-hover:text-gray-300 transition-colors flex-1">
                            {ra.title}
                          </h2>
                          
                          {/* Summary */}
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                            {ra.summary}
                          </p>
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1 text-neutral-400 group-hover:text-black-500 transition-colors">
                              <span className="text-xs font-medium">Read more</span>
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
