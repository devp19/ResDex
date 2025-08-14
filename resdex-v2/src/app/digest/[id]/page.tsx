'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArticleDetail } from './ArticleDetail';

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

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [articleId, setArticleId] = useState<string>('');

  useEffect(() => {
    // Resolve params and fetch article data
    params.then(resolvedParams => {
      setArticleId(resolvedParams.id);
      
      // Get article data from localStorage
      if (typeof window !== 'undefined') {
        const allArticles = localStorage.getItem('allArticles');
        if (allArticles) {
          try {
            const articles: Article[] = JSON.parse(allArticles);
            const foundArticle = articles.find(a => a.id === resolvedParams.id);
            if (foundArticle) {
              setArticle(foundArticle);
            }
          } catch (error) {
            console.error('Error parsing articles from localStorage:', error);
          }
        }
      }
      setLoading(false);
    });
  }, [params]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-neutral-600 dark:text-neutral-400">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Article Not Found</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">The article you're looking for could not be found.</p>
        <Link 
          href="/digest"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Digest
        </Link>
      </div>
    );
  }

  return <ArticleDetail article={article} />;
} 