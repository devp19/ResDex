'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getAISummaries, mergeAISummariesWithArticles, getSummaryStats } from '../../lib/aiSummaryService';
import { getUiScale } from '../../lib/uiScale';
import Image from 'next/image';
import './DailyDigest.css';

// arXiv categories and their mappings to high-level categories
const ARXIV_CATEGORIES = [
  // AI / Machine Learning (High Priority)
  { query: 'cs.AI', category: 'AI / ML', maxResults: 1 },
  { query: 'cs.LG', category: 'AI / ML', maxResults: 1 },
  { query: 'stat.ML', category: 'AI / ML', maxResults: 0 },
  { query: 'cs.NE', category: 'AI / ML', maxResults: 0 },
  
  // Computer Vision & Robotics
  { query: 'cs.CV', category: 'Computer Vision', maxResults: 1 },
  { query: 'cs.RO', category: 'Robotics', maxResults: 0 },
  
  // Cybersecurity
  { query: 'cs.CR', category: 'Cybersecurity', maxResults: 0 },
  
  // Quantum Computing
  { query: 'quant-ph', category: 'Quantum', maxResults: 2 },
  
  // Space & Astrophysics
  { query: 'physics.space-ph', category: 'Space / Physics', maxResults: 0 },
  { query: 'astro-ph', category: 'Space / Physics', maxResults: 2 },
  
  // Biology & Health
  { query: 'q-bio', category: 'Biology / Health', maxResults: 2 },
  
  // Economics & Finance
  { query: 'econ.GN', category: 'Economics', maxResults: 1 },
  { query: 'econ.TH', category: 'Economics', maxResults: 0 },
  { query: 'q-fin.CP', category: 'Finance', maxResults: 1 },
  
  // Materials & Chemistry
  { query: 'cond-mat', category: 'Materials / Chemistry', maxResults: 1 },
  
  // Applied Physics
  { query: 'physics.app-ph', category: 'Applied Physics', maxResults: 0 },
  
  // Software Engineering
  { query: 'cs.SE', category: 'Software Engineering', maxResults: 1 },
  
  // All other categories set to 0 (disabled)
  { query: 'physics.chem-ph', category: 'Chemistry / Physics', maxResults: 0 },
  { query: 'physics.comp-ph', category: 'Computational Physics', maxResults: 0 },
  { query: 'physics.flu-dyn', category: 'Fluid Dynamics', maxResults: 0 },
  { query: 'physics.optics', category: 'Optics / Photonics', maxResults: 0 },
  { query: 'physics.plasm-ph', category: 'Plasma Physics', maxResults: 0 },
  { query: 'physics.soc-ph', category: 'Social Physics', maxResults: 0 },
  { query: 'q-bio.BM', category: 'Biology / Health', maxResults: 0 },
  { query: 'q-bio.CB', category: 'Biology / Health', maxResults: 0 },
  { query: 'q-bio.GN', category: 'Biology / Health', maxResults: 0 },
  { query: 'q-bio.NC', category: 'Biology / Health', maxResults: 0 },
  { query: 'q-bio.PE', category: 'Biology / Health', maxResults: 0 },
  { query: 'q-bio.QM', category: 'Biology / Health', maxResults: 0 },
  { query: 'q-bio.SC', category: 'Biology / Health', maxResults: 0 },
  { query: 'q-bio.TO', category: 'Biology / Health', maxResults: 0 },
  { query: 'math.PR', category: 'Mathematics', maxResults: 0 },
  { query: 'math.AP', category: 'Mathematics', maxResults: 0 },
  { query: 'math.AT', category: 'Mathematics', maxResults: 0 },
  { query: 'math.CA', category: 'Mathematics', maxResults: 0 },
  { query: 'math.CO', category: 'Mathematics', maxResults: 0 },
  { query: 'math.CT', category: 'Mathematics', maxResults: 0 },
  { query: 'math.DG', category: 'Mathematics', maxResults: 0 },
  { query: 'math.DS', category: 'Mathematics', maxResults: 0 },
  { query: 'math.FA', category: 'Mathematics', maxResults: 0 },
  { query: 'math.GM', category: 'Mathematics', maxResults: 0 },
  { query: 'math.GN', category: 'Mathematics', maxResults: 0 },
  { query: 'math.GR', category: 'Mathematics', maxResults: 0 },
  { query: 'math.GT', category: 'Mathematics', maxResults: 0 },
  { query: 'math.HO', category: 'Mathematics', maxResults: 0 },
  { query: 'math.IT', category: 'Mathematics', maxResults: 0 },
  { query: 'math.KT', category: 'Mathematics', maxResults: 0 },
  { query: 'math.LO', category: 'Mathematics', maxResults: 0 },
  { query: 'math.MP', category: 'Mathematics', maxResults: 0 },
  { query: 'math.NA', category: 'Mathematics', maxResults: 0 },
  { query: 'math.NT', category: 'Mathematics', maxResults: 0 },
  { query: 'math.OA', category: 'Mathematics', maxResults: 0 },
  { query: 'math.OC', category: 'Mathematics', maxResults: 0 },
  { query: 'math.QA', category: 'Mathematics', maxResults: 0 },
  { query: 'math.RA', category: 'Mathematics', maxResults: 0 },
  { query: 'math.RT', category: 'Mathematics', maxResults: 0 },
  { query: 'math.SG', category: 'Mathematics', maxResults: 0 },
  { query: 'math.SP', category: 'Mathematics', maxResults: 0 },
  { query: 'math.ST', category: 'Mathematics', maxResults: 0 },
  { query: 'stat.AP', category: 'Statistics', maxResults: 0 },
  { query: 'stat.CO', category: 'Statistics', maxResults: 0 },
  { query: 'stat.ME', category: 'Statistics', maxResults: 0 },
  { query: 'stat.OT', category: 'Statistics', maxResults: 0 },
  { query: 'stat.TH', category: 'Statistics', maxResults: 0 },
  { query: 'econ.EM', category: 'Economics', maxResults: 0 },
  { query: 'q-fin.EC', category: 'Finance', maxResults: 0 },
  { query: 'q-fin.GN', category: 'Finance', maxResults: 0 },
  { query: 'q-fin.MF', category: 'Finance', maxResults: 0 },
  { query: 'q-fin.PM', category: 'Finance', maxResults: 0 },
  { query: 'q-fin.PR', category: 'Finance', maxResults: 0 },
  { query: 'q-fin.RM', category: 'Finance', maxResults: 0 },
  { query: 'q-fin.ST', category: 'Finance', maxResults: 0 },
  { query: 'q-fin.TR', category: 'Finance', maxResults: 0 },
  { query: 'cond-mat.dis-nn', category: 'Materials / Chemistry', maxResults: 0 },
  { query: 'cond-mat.mes-hall', category: 'Materials / Chemistry', maxResults: 0 },
  { query: 'cond-mat.mtrl-sci', category: 'Materials / Chemistry', maxResults: 0 },
  { query: 'cond-mat.other', category: 'Materials / Chemistry', maxResults: 0 },
  { query: 'cond-mat.quant-gas', category: 'Materials / Chemistry', maxResults: 0 },
  { query: 'cond-mat.soft', category: 'Materials / Chemistry', maxResults: 0 },
  { query: 'cond-mat.stat-mech', category: 'Materials / Chemistry', maxResults: 0 },
  { query: 'cond-mat.str-el', category: 'Materials / Chemistry', maxResults: 0 },
  { query: 'cond-mat.supr-con', category: 'Materials / Chemistry', maxResults: 0 },
  { query: 'hep-th', category: 'Theoretical Physics', maxResults: 0 },
  { query: 'hep-ph', category: 'Theoretical Physics', maxResults: 0 },
  { query: 'hep-ex', category: 'Theoretical Physics', maxResults: 0 },
  { query: 'hep-lat', category: 'Theoretical Physics', maxResults: 0 },
  { query: 'nucl-ex', category: 'Nuclear Physics', maxResults: 0 },
  { query: 'nucl-th', category: 'Nuclear Physics', maxResults: 0 },
  { query: 'gr-qc', category: 'Gravitation / Cosmology', maxResults: 0 },
  { query: 'cs.DC', category: 'Distributed Computing', maxResults: 0 },
  { query: 'cs.DS', category: 'Data Structures', maxResults: 0 },
  { query: 'cs.DB', category: 'Databases', maxResults: 0 },
  { query: 'cs.DM', category: 'Discrete Mathematics', maxResults: 0 },
  { query: 'cs.ET', category: 'Emerging Technologies', maxResults: 0 },
  { query: 'cs.FL', category: 'Formal Languages', maxResults: 0 },
  { query: 'cs.GL', category: 'General Literature', maxResults: 0 },
  { query: 'cs.GR', category: 'Graphics', maxResults: 0 },
  { query: 'cs.GT', category: 'Game Theory', maxResults: 0 },
  { query: 'cs.HC', category: 'Human-Computer Interaction', maxResults: 0 },
  { query: 'cs.IR', category: 'Information Retrieval', maxResults: 0 },
  { query: 'cs.IT', category: 'Information Theory', maxResults: 0 },
  { query: 'cs.LO', category: 'Logic in Computer Science', maxResults: 0 },
  { query: 'cs.MA', category: 'Multiagent Systems', maxResults: 0 },
  { query: 'cs.MM', category: 'Multimedia', maxResults: 0 },
  { query: 'cs.MS', category: 'Mathematical Software', maxResults: 0 },
  { query: 'cs.NA', category: 'Numerical Analysis', maxResults: 0 },
  { query: 'cs.NI', category: 'Networking', maxResults: 0 },
  { query: 'cs.OH', category: 'Other Computer Science', maxResults: 0 },
  { query: 'cs.OS', category: 'Operating Systems', maxResults: 0 },
  { query: 'cs.PF', category: 'Performance', maxResults: 0 },
  { query: 'cs.PL', category: 'Programming Languages', maxResults: 0 },
  { query: 'cs.SC', category: 'Symbolic Computation', maxResults: 0 },
  { query: 'cs.SD', category: 'Sound', maxResults: 0 },
  { query: 'cs.SI', category: 'Social and Information Networks', maxResults: 0 },
  { query: 'cs.SY', category: 'Systems and Control', maxResults: 0 }
];

interface Article {
  id: string; // Stable unique identifier
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

interface Digest {
  success: boolean;
  date: string;
  totalArticles: number;
  sources: {
    arxiv: number;
    scienceDaily: number;
  };
  articles: Article[];
  categoryCounts: Record<string, number>;
  error?: string;
}

interface SummaryStats {
  total: number;
  withSummaries: number;
  percentage: number;
}

// Utility function to generate stable unique IDs for articles
const generateStableId = (link: string, title: string, index: number): string => {
  // Try to extract arXiv ID from link
  const arxivMatch = link.match(/arxiv\.org\/abs\/(\d+\.\d+)/);
  if (arxivMatch) {
    return arxivMatch[1];
  }
  
  // Generate hash from link and title
  const content = `${link}-${title}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Add index as tie-breaker
  return `${Math.abs(hash)}-${index}`;
};

// Ensure all articles have unique IDs
const ensureUniqueIds = (articles: Omit<Article, 'id'>[]): Article[] => {
  const idMap = new Map<string, number>();
  
  return articles.map((article, index) => {
    const baseId = generateStableId(article.link, article.title, index);
    const count = idMap.get(baseId) || 0;
    idMap.set(baseId, count + 1);
    
    const uniqueId = count === 0 ? baseId : `${baseId}-${count}`;
    
    return {
      ...article,
      id: uniqueId
    };
  });
};

const mapArxivToHighLevel = (arxivCategory: string): string => {
  const category = ARXIV_CATEGORIES.find(cat => arxivCategory.startsWith(cat.query));
  return category ? category.category : 'Other';
};

const getCategoryColor = (category: string): string => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const fetchMultiDisciplinaryDigest = async (): Promise<Digest> => {
  try {
    const allArticles: Omit<Article, 'id'>[] = [];
    
    // Fetch articles from arXiv for each category
    for (const category of ARXIV_CATEGORIES) {
      try {
        const response = await fetch(
          `https://export.arxiv.org/api/query?search_query=all:${category.query}&start=0&max_results=${category.maxResults}&sortBy=submittedDate&sortOrder=descending`
        );
        
        if (!response.ok) {
          console.warn(`Failed to fetch ${category.query}: ${response.statusText}`);
          continue;
        }
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const entries = xmlDoc.querySelectorAll('entry');
        entries.forEach((entry) => {
          const title = entry.querySelector('title')?.textContent?.trim() || '';
          const summary = entry.querySelector('summary')?.textContent?.trim() || '';
          const link = entry.querySelector('id')?.textContent?.trim() || '';
          const author = entry.querySelector('author name')?.textContent?.trim() || 'Unknown Author';
          const published = entry.querySelector('published')?.textContent?.trim() || '';
          
          // Extract arXiv category from link
          const arxivCategory = link.split('/').pop()?.split('v')[0] || '';
          
          allArticles.push({
            title,
            summary,
            tag: category.category,
            link,
            author,
            published,
            source: 'arXiv',
            arxivCategory
          });
        });
      } catch (error) {
        console.warn(`Error fetching ${category.query}:`, error);
      }
    }
    
    // Ensure unique IDs
    const articlesWithIds = ensureUniqueIds(allArticles);
    
    // Group articles by category
    const categoryCounts: Record<string, number> = {};
    articlesWithIds.forEach(article => {
      const category = article.tag;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return {
      success: true,
      date: new Date().toISOString(),
      totalArticles: articlesWithIds.length,
      sources: {
        arxiv: articlesWithIds.length,
        scienceDaily: 0
      },
      articles: articlesWithIds,
      categoryCounts
    };
  } catch (error) {
    console.error('Error fetching digest:', error);
    return {
      success: false,
      date: new Date().toISOString(),
      totalArticles: 0,
      sources: { arxiv: 0, scienceDaily: 0 },
      articles: [],
      categoryCounts: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

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

export default function DailyDigestPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({ total: 0, withSummaries: 0, percentage: 0 });
  const [starredArticles, setStarredArticles] = useState<Set<string>>(new Set());
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const loadUserPreferences = () => {
    try {
      const storedFavorites = localStorage.getItem('favoriteCategories');
      const storedExpanded = localStorage.getItem('expandedCategories');
      const storedStarred = localStorage.getItem('starredArticles');
      const storedSaved = localStorage.getItem('savedArticles');
      
      if (storedFavorites) {
        setFavoriteCategories(JSON.parse(storedFavorites));
      }
      if (storedExpanded) {
        setExpandedCategories(JSON.parse(storedExpanded));
      }
      if (storedStarred) {
        setStarredArticles(new Set(JSON.parse(storedStarred)));
      }
      if (storedSaved) {
        setSavedArticles(new Set(JSON.parse(storedSaved)));
      }
    } catch (error) {
      console.warn('Error loading user preferences:', error);
    }
  };

  const saveUserPreferences = (newFavorites: string[], newExpanded: Record<string, boolean>, newStarred: Set<string>, newSaved: Set<string>) => {
    try {
      localStorage.setItem('favoriteCategories', JSON.stringify(newFavorites));
      localStorage.setItem('expandedCategories', JSON.stringify(newExpanded));
      localStorage.setItem('starredArticles', JSON.stringify(Array.from(newStarred)));
      localStorage.setItem('savedArticles', JSON.stringify(Array.from(newSaved)));
    } catch (error) {
      console.warn('Error saving user preferences:', error);
    }
  };

  const toggleFavorite = (category: string) => {
    const newFavorites = favoriteCategories.includes(category)
      ? favoriteCategories.filter(c => c !== category)
      : [...favoriteCategories, category];
    
    setFavoriteCategories(newFavorites);
    saveUserPreferences(newFavorites, expandedCategories, starredArticles, savedArticles);
  };

  const toggleExpanded = (category: string) => {
    const newExpanded = {
      ...expandedCategories,
      [category]: !expandedCategories[category]
    };
    setExpandedCategories(newExpanded);
    saveUserPreferences(favoriteCategories, newExpanded, starredArticles, savedArticles);
  };

  const toggleStarred = (articleId: string) => {
    const newStarred = new Set(starredArticles);
    if (newStarred.has(articleId)) {
      newStarred.delete(articleId);
    } else {
      newStarred.add(articleId);
    }
    setStarredArticles(newStarred);
    saveUserPreferences(favoriteCategories, expandedCategories, newStarred, savedArticles);
  };

  const toggleSaved = (articleId: string) => {
    const newSaved = new Set(savedArticles);
    if (newSaved.has(articleId)) {
      newSaved.delete(articleId);
    } else {
      newSaved.add(articleId);
    }
    setSavedArticles(newSaved);
    saveUserPreferences(favoriteCategories, expandedCategories, starredArticles, newSaved);
  };

  const loadDigest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const digestData = await fetchMultiDisciplinaryDigest();
      setDigest(digestData);
      
      // Save all articles to localStorage for saved/history pages
      localStorage.setItem('allArticles', JSON.stringify(digestData.articles));
      
      // Calculate summary stats
      const stats = getSummaryStats(digestData.articles);
      setSummaryStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load digest');
    } finally {
      setLoading(false);
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

  const refreshDigest = async () => {
    await loadDigest();
  };

  useEffect(() => {
    loadUserPreferences();
    loadDigest();
    
    // Log UI scale for verification
    if (typeof window !== 'undefined') {
      const scale = getUiScale();
      const htmlFontSize = getComputedStyle(document.documentElement).fontSize;
      console.log('Digest Page UI Scale:', scale);
      console.log('HTML Font Size:', htmlFontSize);
      console.log('Expected Font Size:', `${16 * scale}px`);
    }
  }, []);

  // Filter articles based on selected category and favorites
  const filteredArticles = useMemo(() => {
    if (!digest?.articles) return [];
    
    let filtered = digest.articles;
    
    // Filter by favorites if enabled
    if (showFavoritesOnly) {
      filtered = filtered.filter((article: Article) => favoriteCategories.includes(article.tag));
    }
    
    // Filter by selected category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((article: Article) => article.tag === selectedCategory);
    }
    
    return filtered;
  }, [digest?.articles, selectedCategory, showFavoritesOnly, favoriteCategories]);

  // Get the hero article (first article)
  const heroArticle = useMemo(() => {
    return filteredArticles.length > 0 ? filteredArticles[0] : null;
  }, [filteredArticles]);

  // Get remaining articles (excluding the hero)
  const remainingArticles = useMemo(() => {
    return filteredArticles.slice(1);
  }, [filteredArticles]);

  // Group remaining articles by category for display
  const groupedArticles = useMemo(() => {
    return remainingArticles.reduce((acc: Record<string, Article[]>, article: Article) => {
      const category = article.tag;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(article);
      return acc;
    }, {});
  }, [remainingArticles]);

  // Flatten remaining articles for grid display
  const gridArticles = useMemo(() => {
    return Object.values(groupedArticles).flat();
  }, [groupedArticles]);

  // Get trending categories
  const trendingCategories = Object.entries(digest?.categoryCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Get all available categories
  const allCategories = useMemo(() => {
    if (!digest?.categoryCounts) return [];
    return Object.keys(digest.categoryCounts).sort();
  }, [digest?.categoryCounts]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return allCategories;
    return allCategories.filter((category: string) =>
      category.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [allCategories, categorySearch]);

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
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Error Loading Digest</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={loadDigest}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
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

      {/* Main Layout */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-12xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <aside className="lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <nav className="space-y-2">
                  <a href="/digest" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/20 text-black dark:text-gray-300 font-medium">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Discover
                  </a>
                  <a href="/saved" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
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
            <main className="lg:col-span-6">
              {/* Hero Section - Compact Rectangle */}
              {heroArticle && (
                <article className="mb-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Hero Image - Top */}
                  <div className="relative aspect-[7/3] w-full">
                    <div 
                        className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                        style={{
                          background: '#E5E3DF'
                        }}
                        role="img"
                      aria-label={`Featured research in ${heroArticle.tag}`}
                    >
                      <div className="text-center p-4">
                        <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                          {heroArticle.tag}
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          Featured Research
                        </div>
                      </div>
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
                        {heroArticle.published ? timeSince(new Date(heroArticle.published)) : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {heroArticle.author.split(',').slice(0, 2).join(', ')}
                        {heroArticle.author.split(',').length > 2 && ' +'}
                      </div>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs font-medium rounded-full">
                        {heroArticle.tag}
                      </span>
                    </div>

                    {/* Hero Headline */}
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 leading-tight line-clamp-2">
                      {heroArticle.title}
                    </h1>

                    {/* Hero Summary */}
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 leading-relaxed">
                      {heroArticle.summary}
                    </p>

                    {/* CTA Button */}
                    <button 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                      onClick={() => handleArticleClick(heroArticle)}
                    >
                      Read More
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </article>
              )}

              {/* Grid for Remaining Articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {gridArticles.map((article: any) => (
                  <article 
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
                          {article.published ? timeSince(new Date(article.published)) : ''}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          {article.author.split(',')[0].trim() || 'Unknown Author'}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-black dark:group-hover:text-gray-300 transition-colors flex-1">
                        {article.title}
                      </h2>
                      
                      {/* Summary */}
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          {/* Save Button */}
                          <button 
                            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaved(article.id);
                            }}
                          >
                            <svg 
                              className={`h-3 w-3 ${savedArticles.has(article.id) ? 'text-black-500 fill-current' : 'text-neutral-500 dark:text-neutral-400'}`} 
                              fill={savedArticles.has(article.id) ? 'currentColor' : 'none'} 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400 group-hover:text-black-500 transition-colors">
                          <span className="text-xs font-medium">Read more</span>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              
              {/* Load More Button */}
              {gridArticles.length > 0 && (
                <div className="mt-8 text-center">
                  <button className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors font-medium">
                    Load More Articles
                  </button>
                </div>
              )}
            </main>

            {/* Right Sidebar */}
            <aside className="lg:col-span-2">
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
                    {trendingCategories.slice(0, 5).map(([cat, count], i) => (
                      <div key={cat} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">#{i + 1}</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{cat}</span>
                        </div>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{count} articles</span>
                      </div>
                    ))}
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
                      {filteredCategories.map((category) => (
                        <div 
                          key={category} 
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                            selectedCategory === category 
                              ? 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800' 
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                          onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
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
                                {digest?.categoryCounts[category] || 0} articles
                              </span>
                            </div>
                          </div>
                          {selectedCategory === category && (
                            <div className="w-2 h-2 bg-black dark:bg-gray-300 rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
} 