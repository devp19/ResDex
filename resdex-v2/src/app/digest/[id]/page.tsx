'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Article from './Article';

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

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [articleId, setArticleId] = useState<string>('');

  useEffect(() => {
    // Resolve params and fetch article data
    params.then(async (resolvedParams) => {
      setArticleId(resolvedParams.id);
      
      try {
        // Fetch article from Supabase
        const { data: articleData, error } = await supabase
          .from('dev_articles')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (error) {
          console.error('Error fetching article:', error);
          setLoading(false);
          return;
        }

        if (articleData) {
          // Transform Supabase data to match your Article interface
          const transformedArticle: Article = {
            id: articleData.id,
            title: articleData.title,
            summary: articleData.abstract || '',
            tag: articleData.topic || 'Research',
            link: articleData.link_abs || `https://arxiv.org/abs/${articleData.id}`,
            author: articleData.authors ? (Array.isArray(articleData.authors) ? articleData.authors.join(', ') : articleData.authors) : 'Unknown',
            published: articleData.published_at,
            source: articleData.source || 'arXiv',
            arxivCategory: articleData.id,
            aiSummary: articleData.ai_summary
          };
          
          setArticle(transformedArticle);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in ArticlePage:', error);
        setLoading(false);
      }
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

  return <Article article={article} />;
} 