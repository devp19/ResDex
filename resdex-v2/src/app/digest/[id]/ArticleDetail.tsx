'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getUiScale } from '../../../lib/uiScale';
import '../DailyDigest.css';
import { LeftSidebar } from '../components/LeftSidebar';

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

interface ArticleDetailProps {
  article: Article;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  useEffect(() => {
    // Apply UI scale for article detail page
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--ui-scale', '0.8');
      document.documentElement.style.fontSize = `${16 * 0.8}px`;
    }

    // Cleanup function to reset UI scale when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.style.removeProperty('--ui-scale');
        document.documentElement.style.fontSize = '16px';
      }
    };
  }, []);

  const handleExternalLink = () => {
    if (article?.link) {
      window.open(article.link, '_blank');
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-6 py-10">
      {/* Back to Digest Button - Top Left */}
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

      {/* Main Layout with Left Sidebar */}
      <div className="flex flex-col lg:flex-row gap-20">
        {/* Left Sidebar */}
        <LeftSidebar 
          article={article} 
          onExternalLink={handleExternalLink} 
        />

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Article Image/Demo - Matching Digest Header */}
          <div className="mb-12">
            <div className="relative aspect-[7/3] w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: '#E5E3DF'
                }}
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
            </div>
          </div>

          {/* About This Research */}
          <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">About This Research</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
            {article.summary}
          </p>
          {article.aiSummary && (
            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
              {article.aiSummary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 