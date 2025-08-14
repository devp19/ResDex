'use client';

import React from 'react';

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

interface LeftSidebarProps {
  article: Article;
  onExternalLink: () => void;
}

export function LeftSidebar({ article, onExternalLink }: LeftSidebarProps) {
  const timeSince = (date: Date): string => {
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
  };

  return (
    <div className="lg:w-80 flex-shrink-0 lg:-ml-100">
      <div className="sticky top-24">
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
        <div className="border-t border-neutral-300 dark:border-neutral-600 mb-6"></div>

        {/* Read Full Article Button */}
        <div className="mb-6">
          <button 
            onClick={onExternalLink}
            className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Read Full Article
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-300 dark:border-neutral-600 mb-6"></div>

        {/* Key Details */}
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Key Details</h2>
        <ul className="space-y-3 text-neutral-600 dark:text-neutral-400">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <div>
              <strong>Category: </strong> {article.tag}
            </div>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <div>
              <strong>arXiv Category: </strong> {article.arxivCategory}
            </div>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <div>
              <strong>Research Type: </strong> {article.source} Publication
            </div>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <div>
              <strong>Access: </strong> Open Access via {article.source}
            </div>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <div>
              <strong>Citation: </strong> Available in {article.source} database
            </div>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <div>
              <strong>Full Text: </strong> Accessible via external link
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
} 