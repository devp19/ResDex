import React, { useEffect, useState, useMemo } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import DailyDigestCard from '../components/DailyDigestCard';
import DigestSidebar from '../components/DigestSidebar';
import { getAISummaries, mergeAISummariesWithArticles, getSummaryStats } from '../services/aiSummaryService';
import '../App.css';
import './DailyDigest.css';

const db = getFirestore();

// arXiv categories and their mappings to high-level categories
const ARXIV_CATEGORIES = [
  { query: 'cs.AI', category: 'AI / ML', maxResults: 8 },
  { query: 'cs.LG', category: 'AI / ML', maxResults: 8 },
  { query: 'stat.ML', category: 'AI / ML', maxResults: 5 },
  { query: 'physics.space-ph', category: 'Space / Physics', maxResults: 6 },
  { query: 'astro-ph', category: 'Space / Physics', maxResults: 6 },
  { query: 'q-bio', category: 'Biology / Health', maxResults: 6 },
  { query: 'quant-ph', category: 'Quantum', maxResults: 6 },
  { query: 'econ.GN', category: 'Economics', maxResults: 4 },
  { query: 'econ.TH', category: 'Economics', maxResults: 4 },
  { query: 'cond-mat', category: 'Materials / Chemistry', maxResults: 5 },
  { query: 'math.PR', category: 'Mathematics', maxResults: 4 },
  { query: 'cs.CR', category: 'Cybersecurity', maxResults: 4 },
  { query: 'cs.CV', category: 'Computer Vision', maxResults: 5 },
  { query: 'cs.NE', category: 'AI / ML', maxResults: 4 },
  { query: 'cs.RO', category: 'Robotics', maxResults: 4 },
  { query: 'cs.SE', category: 'Software Engineering', maxResults: 4 },
  { query: 'physics.app-ph', category: 'Applied Physics', maxResults: 4 },
  { query: 'physics.chem-ph', category: 'Chemistry / Physics', maxResults: 4 },
  { query: 'physics.comp-ph', category: 'Computational Physics', maxResults: 4 },
  { query: 'physics.flu-dyn', category: 'Fluid Dynamics', maxResults: 3 },
  { query: 'physics.optics', category: 'Optics / Photonics', maxResults: 3 },
  { query: 'physics.plasm-ph', category: 'Plasma Physics', maxResults: 3 },
  { query: 'physics.soc-ph', category: 'Social Physics', maxResults: 3 },
  { query: 'q-bio.BM', category: 'Biology / Health', maxResults: 3 },
  { query: 'q-bio.CB', category: 'Biology / Health', maxResults: 3 },
  { query: 'q-bio.GN', category: 'Biology / Health', maxResults: 3 },
  { query: 'q-bio.NC', category: 'Biology / Health', maxResults: 3 },
  { query: 'q-bio.PE', category: 'Biology / Health', maxResults: 3 },
  { query: 'q-bio.QM', category: 'Biology / Health', maxResults: 3 },
  { query: 'q-bio.SC', category: 'Biology / Health', maxResults: 3 },
  { query: 'q-bio.TO', category: 'Biology / Health', maxResults: 3 },
  { query: 'math.AP', category: 'Mathematics', maxResults: 3 },
  { query: 'math.AT', category: 'Mathematics', maxResults: 3 },
  { query: 'math.CA', category: 'Mathematics', maxResults: 3 },
  { query: 'math.CO', category: 'Mathematics', maxResults: 3 },
  { query: 'math.CT', category: 'Mathematics', maxResults: 3 },
  { query: 'math.DG', category: 'Mathematics', maxResults: 3 },
  { query: 'math.DS', category: 'Mathematics', maxResults: 3 },
  { query: 'math.FA', category: 'Mathematics', maxResults: 3 },
  { query: 'math.GM', category: 'Mathematics', maxResults: 3 },
  { query: 'math.GN', category: 'Mathematics', maxResults: 3 },
  { query: 'math.GR', category: 'Mathematics', maxResults: 3 },
  { query: 'math.GT', category: 'Mathematics', maxResults: 3 },
  { query: 'math.HO', category: 'Mathematics', maxResults: 3 },
  { query: 'math.IT', category: 'Mathematics', maxResults: 3 },
  { query: 'math.KT', category: 'Mathematics', maxResults: 3 },
  { query: 'math.LO', category: 'Mathematics', maxResults: 3 },
  { query: 'math.MP', category: 'Mathematics', maxResults: 3 },
  { query: 'math.NA', category: 'Mathematics', maxResults: 3 },
  { query: 'math.NT', category: 'Mathematics', maxResults: 3 },
  { query: 'math.OA', category: 'Mathematics', maxResults: 3 },
  { query: 'math.OC', category: 'Mathematics', maxResults: 3 },
  { query: 'math.PR', category: 'Mathematics', maxResults: 3 },
  { query: 'math.QA', category: 'Mathematics', maxResults: 3 },
  { query: 'math.RA', category: 'Mathematics', maxResults: 3 },
  { query: 'math.RT', category: 'Mathematics', maxResults: 3 },
  { query: 'math.SG', category: 'Mathematics', maxResults: 3 },
  { query: 'math.SP', category: 'Mathematics', maxResults: 3 },
  { query: 'math.ST', category: 'Mathematics', maxResults: 3 },
  { query: 'stat.AP', category: 'Statistics', maxResults: 3 },
  { query: 'stat.CO', category: 'Statistics', maxResults: 3 },
  { query: 'stat.ME', category: 'Statistics', maxResults: 3 },
  { query: 'stat.ML', category: 'AI / ML', maxResults: 3 },
  { query: 'stat.OT', category: 'Statistics', maxResults: 3 },
  { query: 'stat.TH', category: 'Statistics', maxResults: 3 },
  { query: 'econ.EM', category: 'Economics', maxResults: 3 },
  { query: 'econ.GN', category: 'Economics', maxResults: 3 },
  { query: 'econ.TH', category: 'Economics', maxResults: 3 },
  { query: 'q-fin.CP', category: 'Finance', maxResults: 3 },
  { query: 'q-fin.EC', category: 'Finance', maxResults: 3 },
  { query: 'q-fin.GN', category: 'Finance', maxResults: 3 },
  { query: 'q-fin.MF', category: 'Finance', maxResults: 3 },
  { query: 'q-fin.PM', category: 'Finance', maxResults: 3 },
  { query: 'q-fin.PR', category: 'Finance', maxResults: 3 },
  { query: 'q-fin.RM', category: 'Finance', maxResults: 3 },
  { query: 'q-fin.ST', category: 'Finance', maxResults: 3 },
  { query: 'q-fin.TR', category: 'Finance', maxResults: 3 },
  { query: 'cond-mat.dis-nn', category: 'Materials / Chemistry', maxResults: 3 },
  { query: 'cond-mat.mes-hall', category: 'Materials / Chemistry', maxResults: 3 },
  { query: 'cond-mat.mtrl-sci', category: 'Materials / Chemistry', maxResults: 3 },
  { query: 'cond-mat.other', category: 'Materials / Chemistry', maxResults: 3 },
  { query: 'cond-mat.quant-gas', category: 'Materials / Chemistry', maxResults: 3 },
  { query: 'cond-mat.soft', category: 'Materials / Chemistry', maxResults: 3 },
  { query: 'cond-mat.stat-mech', category: 'Materials / Chemistry', maxResults: 3 },
  { query: 'cond-mat.str-el', category: 'Materials / Chemistry', maxResults: 3 },
  { query: 'cond-mat.supr-con', category: 'Materials / Chemistry', maxResults: 3 },
  { query: 'hep-th', category: 'Theoretical Physics', maxResults: 3 },
  { query: 'hep-ph', category: 'Theoretical Physics', maxResults: 3 },
  { query: 'hep-ex', category: 'Theoretical Physics', maxResults: 3 },
  { query: 'hep-lat', category: 'Theoretical Physics', maxResults: 3 },
  { query: 'nucl-th', category: 'Nuclear Physics', maxResults: 3 },
  { query: 'nucl-ex', category: 'Nuclear Physics', maxResults: 3 },
  { query: 'gr-qc', category: 'Gravitation / Cosmology', maxResults: 3 },
  { query: 'cs.AR', category: 'Computer Architecture', maxResults: 3 },
  { query: 'cs.CC', category: 'Computational Complexity', maxResults: 3 },
  { query: 'cs.CE', category: 'Computational Engineering', maxResults: 3 },
  { query: 'cs.CG', category: 'Computational Geometry', maxResults: 3 },
  { query: 'cs.CL', category: 'Computational Linguistics', maxResults: 3 },
  { query: 'cs.CR', category: 'Cryptography / Security', maxResults: 3 },
  { query: 'cs.CV', category: 'Computer Vision', maxResults: 3 },
  { query: 'cs.CY', category: 'Computers / Society', maxResults: 3 },
  { query: 'cs.DB', category: 'Databases', maxResults: 3 },
  { query: 'cs.DC', category: 'Distributed Computing', maxResults: 3 },
  { query: 'cs.DL', category: 'Digital Libraries', maxResults: 3 },
  { query: 'cs.DM', category: 'Discrete Mathematics', maxResults: 3 },
  { query: 'cs.DS', category: 'Data Structures', maxResults: 3 },
  { query: 'cs.ET', category: 'Emerging Technologies', maxResults: 3 },
  { query: 'cs.FL', category: 'Formal Languages', maxResults: 3 },
  { query: 'cs.GL', category: 'General Literature', maxResults: 3 },
  { query: 'cs.GR', category: 'Graphics', maxResults: 3 },
  { query: 'cs.GT', category: 'Computer Science / Game Theory', maxResults: 3 },
  { query: 'cs.HC', category: 'Human-Computer Interaction', maxResults: 3 },
  { query: 'cs.IR', category: 'Information Retrieval', maxResults: 3 },
  { query: 'cs.IT', category: 'Information Theory', maxResults: 3 },
  { query: 'cs.LG', category: 'Machine Learning', maxResults: 3 },
  { query: 'cs.LO', category: 'Logic in Computer Science', maxResults: 3 },
  { query: 'cs.MA', category: 'Multiagent Systems', maxResults: 3 },
  { query: 'cs.MM', category: 'Multimedia', maxResults: 3 },
  { query: 'cs.MS', category: 'Mathematical Software', maxResults: 3 },
  { query: 'cs.NA', category: 'Numerical Analysis', maxResults: 3 },
  { query: 'cs.NE', category: 'Neural Computing', maxResults: 3 },
  { query: 'cs.NI', category: 'Networking', maxResults: 3 },
  { query: 'cs.OH', category: 'Other Computer Science', maxResults: 3 },
  { query: 'cs.OS', category: 'Operating Systems', maxResults: 3 },
  { query: 'cs.PF', category: 'Performance', maxResults: 3 },
  { query: 'cs.PL', category: 'Programming Languages', maxResults: 3 },
  { query: 'cs.RO', category: 'Robotics', maxResults: 3 },
  { query: 'cs.SC', category: 'Symbolic Computation', maxResults: 3 },
  { query: 'cs.SD', category: 'Sound', maxResults: 3 },
  { query: 'cs.SE', category: 'Software Engineering', maxResults: 3 },
  { query: 'cs.SI', category: 'Social Information', maxResults: 3 },
  { query: 'cs.SY', category: 'Systems / Control', maxResults: 3 }
];

// High-level category definitions
const HIGH_LEVEL_CATEGORIES = [
  { id: 'ai-ml', label: 'AI / ML', color: 'ai' },
  { id: 'space-physics', label: 'Space / Physics', color: 'space' },
  { id: 'biology-health', label: 'Biology / Health', color: 'bio' },
  { id: 'quantum', label: 'Quantum', color: 'quantum' },
  { id: 'economics', label: 'Economics', color: 'economics' },
  { id: 'materials-chemistry', label: 'Materials / Chemistry', color: 'materials' },
  { id: 'mathematics', label: 'Mathematics', color: 'math' },
  { id: 'cybersecurity', label: 'Cybersecurity', color: 'security' },
  { id: 'computer-vision', label: 'Computer Vision', color: 'vision' },
  { id: 'robotics', label: 'Robotics', color: 'robotics' },
  { id: 'software-engineering', label: 'Software Engineering', color: 'software' },
  { id: 'applied-physics', label: 'Applied Physics', color: 'physics' },
  { id: 'chemistry-physics', label: 'Chemistry / Physics', color: 'chemistry' },
  { id: 'computational-physics', label: 'Computational Physics', color: 'comp-physics' },
  { id: 'fluid-dynamics', label: 'Fluid Dynamics', color: 'fluid' },
  { id: 'optics-photonics', label: 'Optics / Photonics', color: 'optics' },
  { id: 'plasma-physics', label: 'Plasma Physics', color: 'plasma' },
  { id: 'social-physics', label: 'Social Physics', color: 'social' },
  { id: 'statistics', label: 'Statistics', color: 'stats' },
  { id: 'finance', label: 'Finance', color: 'finance' },
  { id: 'theoretical-physics', label: 'Theoretical Physics', color: 'theoretical' },
  { id: 'nuclear-physics', label: 'Nuclear Physics', color: 'nuclear' },
  { id: 'gravitation-cosmology', label: 'Gravitation / Cosmology', color: 'cosmology' },
  { id: 'computer-architecture', label: 'Computer Architecture', color: 'architecture' },
  { id: 'computational-complexity', label: 'Computational Complexity', color: 'complexity' },
  { id: 'computational-engineering', label: 'Computational Engineering', color: 'comp-eng' },
  { id: 'computational-geometry', label: 'Computational Geometry', color: 'geometry' },
  { id: 'computational-linguistics', label: 'Computational Linguistics', color: 'linguistics' },
  { id: 'cryptography-security', label: 'Cryptography / Security', color: 'crypto' },
  { id: 'computers-society', label: 'Computers / Society', color: 'society' },
  { id: 'databases', label: 'Databases', color: 'databases' },
  { id: 'distributed-computing', label: 'Distributed Computing', color: 'distributed' },
  { id: 'digital-libraries', label: 'Digital Libraries', color: 'libraries' },
  { id: 'discrete-mathematics', label: 'Discrete Mathematics', color: 'discrete' },
  { id: 'data-structures', label: 'Data Structures', color: 'structures' },
  { id: 'emerging-technologies', label: 'Emerging Technologies', color: 'emerging' },
  { id: 'formal-languages', label: 'Formal Languages', color: 'languages' },
  { id: 'general-literature', label: 'General Literature', color: 'literature' },
  { id: 'graphics', label: 'Graphics', color: 'graphics' },
  { id: 'game-theory', label: 'Computer Science / Game Theory', color: 'game-theory' },
  { id: 'human-computer-interaction', label: 'Human-Computer Interaction', color: 'hci' },
  { id: 'information-retrieval', label: 'Information Retrieval', color: 'ir' },
  { id: 'information-theory', label: 'Information Theory', color: 'info-theory' },
  { id: 'logic-computer-science', label: 'Logic in Computer Science', color: 'logic' },
  { id: 'multiagent-systems', label: 'Multiagent Systems', color: 'agents' },
  { id: 'multimedia', label: 'Multimedia', color: 'multimedia' },
  { id: 'mathematical-software', label: 'Mathematical Software', color: 'math-software' },
  { id: 'numerical-analysis', label: 'Numerical Analysis', color: 'numerical' },
  { id: 'neural-computing', label: 'Neural Computing', color: 'neural' },
  { id: 'networking', label: 'Networking', color: 'networking' },
  { id: 'other-computer-science', label: 'Other Computer Science', color: 'other-cs' },
  { id: 'operating-systems', label: 'Operating Systems', color: 'os' },
  { id: 'performance', label: 'Performance', color: 'performance' },
  { id: 'programming-languages', label: 'Programming Languages', color: 'programming' },
  { id: 'symbolic-computation', label: 'Symbolic Computation', color: 'symbolic' },
  { id: 'sound', label: 'Sound', color: 'sound' },
  { id: 'social-information', label: 'Social Information', color: 'social-info' },
  { id: 'systems-control', label: 'Systems / Control', color: 'systems' }
];

// Function to map arXiv category to high-level category
const mapArxivToHighLevel = (arxivCategory) => {
  const category = ARXIV_CATEGORIES.find(cat => cat.query === arxivCategory);
  return category ? category.category : 'Other';
};

// Function to get category color
const getCategoryColor = (category) => {
  const highLevelCat = HIGH_LEVEL_CATEGORIES.find(cat => cat.label === category);
  return highLevelCat ? highLevelCat.color : 'default';
};

// Enhanced fetch function for multiple disciplines
const fetchMultiDisciplinaryDigest = async () => {
  try {
    const allArticles = [];
    
    // Fetch from multiple arXiv categories
    for (const category of ARXIV_CATEGORIES) {
      try {
        // Updated API call with proper sorting and limiting
        const response = await fetch(
          `https://export.arxiv.org/api/query?search_query=cat:${category.query}&start=0&max_results=${Math.min(category.maxResults, 10)}&sortBy=submittedDate&sortOrder=descending`,
          {
            headers: {
              'User-Agent': 'ResDex-Research-Digest/1.0'
            }
          }
        );
        
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/xml');
        
        const entries = Array.from(doc.querySelectorAll('entry')).map(entry => {
          const title = entry.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() || 'No title available';
          const summary = entry.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim() || 'No summary available';
          
          return {
            title,
            summary: summary.length > 200 ? summary.substring(0, 200) + '...' : summary,
            tag: category.category,
            link: entry.querySelector('id')?.textContent || '',
            author: Array.from(entry.querySelectorAll('author')).map(author => 
              author.querySelector('name')?.textContent
            ).filter(Boolean).join(', ') || 'Unknown authors',
            published: entry.querySelector('published')?.textContent || 
                      entry.querySelector('updated')?.textContent || 
                      new Date().toISOString(),
            source: 'arXiv',
            arxivCategory: category.query
          };
        });
        
        allArticles.push(...entries);
        
        // Add a small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.warn(`Failed to fetch ${category.query}:`, error.message);
      }
    }

    // Sort by published date (newest first)
    allArticles.sort((a, b) => new Date(b.published) - new Date(a.published));

    // Calculate category counts
    const categoryCounts = allArticles.reduce((acc, article) => {
      acc[article.tag] = (acc[article.tag] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      date: new Date().toISOString().split('T')[0],
      totalArticles: allArticles.length,
      sources: {
        arxiv: allArticles.length,
        scienceDaily: 0
      },
      articles: allArticles,
      categoryCounts,
      storedInFirestore: false,
      firestoreDocId: null
    };

  } catch (error) {
    console.error('Error fetching multi-disciplinary digest:', error);
    return {
      success: false,
      error: error.message,
      date: new Date().toISOString().split('T')[0],
      totalArticles: 0,
      articles: [],
      categoryCounts: {}
    };
  }
};

// LocalStorage keys
const FAVORITE_CATEGORIES_KEY = 'resdex_favorite_categories';
const EXPANDED_CATEGORIES_KEY = 'resdex_expanded_categories';

export default function DailyDigest() {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [legacyDigest, setLegacyDigest] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  
  // New state for favorites and expanded categories
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // AI Summary state
  const [aiSummaries, setAiSummaries] = useState([]);
  const [summaryStats, setSummaryStats] = useState({ total: 0, withSummaries: 0, percentage: 0 });

  useEffect(() => {
    loadDigest();
    loadUserPreferences();
    // Also listen for legacy digest format
    const unsubscribe = onSnapshot(doc(db, 'dailyDigests', 'latest'), (docSnap) => {
      setLegacyDigest(docSnap.exists() ? docSnap.data() : null);
    });
    return () => unsubscribe();
  }, []);

  const loadUserPreferences = () => {
    try {
      // Load favorite categories
      const storedFavorites = localStorage.getItem(FAVORITE_CATEGORIES_KEY);
      if (storedFavorites) {
        setFavoriteCategories(JSON.parse(storedFavorites));
      }
      
      // Load expanded categories
      const storedExpanded = localStorage.getItem(EXPANDED_CATEGORIES_KEY);
      if (storedExpanded) {
        setExpandedCategories(JSON.parse(storedExpanded));
      }
    } catch (error) {
      console.warn('Error loading user preferences:', error);
    }
  };

  const saveUserPreferences = (newFavorites, newExpanded) => {
    try {
      localStorage.setItem(FAVORITE_CATEGORIES_KEY, JSON.stringify(newFavorites));
      localStorage.setItem(EXPANDED_CATEGORIES_KEY, JSON.stringify(newExpanded));
    } catch (error) {
      console.warn('Error saving user preferences:', error);
    }
  };

  const toggleFavorite = (category) => {
    const newFavorites = favoriteCategories.includes(category)
      ? favoriteCategories.filter(cat => cat !== category)
      : [...favoriteCategories, category];
    
    setFavoriteCategories(newFavorites);
    saveUserPreferences(newFavorites, expandedCategories);
  };

  const toggleExpanded = (category) => {
    const newExpanded = {
      ...expandedCategories,
      [category]: !expandedCategories[category]
    };
    
    setExpandedCategories(newExpanded);
    saveUserPreferences(favoriteCategories, newExpanded);
  };

  const loadDigest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the enhanced multi-disciplinary fetch method
      const data = await fetchMultiDisciplinaryDigest();
      setDigest(data);
      
      // Fetch AI summaries for today's date
      try {
        const today = new Date().toISOString().split('T')[0];
        const summaries = await getAISummaries(today);
        setAiSummaries(summaries);
        
        // Calculate summary statistics
        if (data?.articles) {
          const mergedArticles = mergeAISummariesWithArticles(data.articles, summaries);
          const stats = getSummaryStats(mergedArticles);
          setSummaryStats(stats);
        }
      } catch (summaryError) {
        console.warn('Could not load AI summaries:', summaryError);
        // Don't fail the entire load if summaries fail
      }
      
    } catch (err) {
      console.error('Error loading digest:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshDigest = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Use the enhanced multi-disciplinary fetch method
      const data = await fetchMultiDisciplinaryDigest();
      setDigest(data);
      
    } catch (err) {
      console.error('Error refreshing digest:', err);
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter articles based on selected category and source, and merge with AI summaries
  const filteredArticles = useMemo(() => {
    if (!digest?.articles) return [];
    
    // Merge AI summaries with articles
    const articlesWithSummaries = mergeAISummariesWithArticles(digest.articles, aiSummaries);
    
    return articlesWithSummaries.filter(article => {
      const categoryMatch = selectedCategory === 'all' || article.tag === selectedCategory;
      const sourceMatch = selectedSource === 'all' || article.source === selectedSource;
      
      return categoryMatch && sourceMatch;
    });
  }, [digest?.articles, aiSummaries, selectedCategory, selectedSource]);

  // Group articles by category for display
  const groupedArticles = useMemo(() => {
    if (!filteredArticles.length) return {};
    
    return filteredArticles.reduce((acc, article) => {
      if (!acc[article.tag]) {
        acc[article.tag] = [];
      }
      acc[article.tag].push(article);
      return acc;
    }, {});
  }, [filteredArticles]);

  // Sort categories: favorites first, then by article count, then alphabetically
  const sortedCategories = useMemo(() => {
    if (!groupedArticles) return [];
    
    return Object.keys(groupedArticles).sort((a, b) => {
      const aIsFavorite = favoriteCategories.includes(a);
      const bIsFavorite = favoriteCategories.includes(b);
      
      // Favorites first
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Then by article count (descending)
      const aCount = groupedArticles[a].length;
      const bCount = groupedArticles[b].length;
      if (aCount !== bCount) return bCount - aCount;
      
      // Finally alphabetically
      return a.localeCompare(b);
    });
  }, [groupedArticles, favoriteCategories]);

  if (loading) {
    return (
      <div className="digest-layout">
        <div className="digest-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading multi-disciplinary research digest...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="digest-layout">
        <div className="digest-main">
          <div className="error-container">
            <h3>Error Loading Research Digest</h3>
            <p>{error}</p>
            <button onClick={loadDigest} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="digest-layout">
      <DigestSidebar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        categories={digest?.categoryCounts}
        sources={digest?.sources}
        allCategories={HIGH_LEVEL_CATEGORIES}
        favoriteCategories={favoriteCategories}
        onToggleFavorite={toggleFavorite}
      />
      
      <main className="digest-main">
        <div className="digest-header">
          <div className="header-content">
            <h1>Multi-Disciplinary Research Digest</h1>
            <p className="header-subtitle">
              Latest research papers across all academic disciplines, curated daily
            </p>
            {summaryStats.total > 0 && (
              <div className="summary-stats">
                <span className="stats-badge">
                  🤖 {summaryStats.withSummaries} of {summaryStats.total} articles have AI summaries
                </span>
              </div>
            )}
          </div>
          <div className="header-actions">
            <button 
              onClick={refreshDigest} 
              disabled={refreshing}
              className="refresh-button"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="digest-content">
          {sortedCategories.length > 0 ? (
            <div className="articles-feed">
              {/* Favorites Section */}
              {favoriteCategories.length > 0 && (
                <div className="favorites-section-main">
                  <div className="favorites-header">
                    <h2 className="favorites-title">
                      <span className="star-icon">⭐</span>
                      Your Favorites
                    </h2>
                    <p className="favorites-subtitle">
                      Your starred research categories
                    </p>
                  </div>
                  
                  <div className="favorites-categories">
                    {favoriteCategories.map((category) => {
                      const articles = groupedArticles[category];
                      if (!articles || articles.length === 0) return null;
                      
                      const isExpanded = expandedCategories[category];
                      const displayArticles = isExpanded ? articles : articles.slice(0, 5);
                      const hasMoreArticles = articles.length > 5;
                      
                      return (
                        <div key={`favorite-${category}`} className="category-section favorite-category">
                          <div className="category-header">
                            <div className="category-header-content">
                              <h3>{category}</h3>
                              <button
                                className={`favorite-button favorited`}
                                onClick={() => toggleFavorite(category)}
                                title="Remove from favorites"
                              >
                                ★
                              </button>
                            </div>
                            <span className="category-count-badge">
                              {articles.length} article{articles.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className="category-articles">
                            {displayArticles.map((article, index) => (
                              <DailyDigestCard
                                key={`favorite-${category}-${index}`}
                                title={article.title}
                                summary={article.summary}
                                tag={article.tag}
                                link={article.link}
                                author={article.author}
                                published={article.published}
                                source={article.source}
                                aiSummary={article.aiSummary}
                              />
                            ))}
                            
                            {hasMoreArticles && (
                              <div className="see-all-container">
                                <button
                                  className="see-all-button"
                                  onClick={() => toggleExpanded(category)}
                                >
                                  {isExpanded ? 'Show Less' : `See All ${articles.length} Articles`}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Regular Categories Section */}
              <div className="all-categories-section">
                <div className="section-header">
                  <h2 className="section-title">All Categories</h2>
                  <p className="section-subtitle">
                    Browse research across all academic disciplines
                  </p>
                </div>
                
                {sortedCategories.map((category) => {
                  const articles = groupedArticles[category];
                  const isExpanded = expandedCategories[category];
                  const isFavorite = favoriteCategories.includes(category);
                  const displayArticles = isExpanded ? articles : articles.slice(0, 5);
                  const hasMoreArticles = articles.length > 5;
                  
                  return (
                    <div key={category} className="category-section">
                      <div className="category-header">
                        <div className="category-header-content">
                          <h2>{category}</h2>
                          <button
                            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
                            onClick={() => toggleFavorite(category)}
                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {isFavorite ? '★' : '☆'}
                          </button>
                        </div>
                        <span className="category-count-badge">
                          {articles.length} article{articles.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="category-articles">
                        {displayArticles.map((article, index) => (
                          <DailyDigestCard
                            key={`${category}-${index}`}
                            title={article.title}
                            summary={article.summary}
                            tag={article.tag}
                            link={article.link}
                            author={article.author}
                            published={article.published}
                            source={article.source}
                            aiSummary={article.aiSummary}
                          />
                        ))}
                        
                        {hasMoreArticles && (
                          <div className="see-all-container">
                            <button
                              className="see-all-button"
                              onClick={() => toggleExpanded(category)}
                            >
                              {isExpanded ? 'Show Less' : `See All ${articles.length} Articles`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="no-articles">
              <p>No articles found for the selected filters.</p>
              <button onClick={refreshDigest} className="retry-button">
                Fetch New Articles
              </button>
            </div>
          )}
        </div>

        {/* Legacy Digest Format (fallback) */}
        {legacyDigest && (!digest?.articles || digest.articles.length === 0) && (
          <div className="legacy-digest">
            <h3>Legacy Digest Format</h3>
            <p>{legacyDigest.summary}</p>
            <small>Articles included:</small>
            <ul>
              {legacyDigest.papers && legacyDigest.papers.map((article, i) => (
                <li key={i}>
                  <strong>{article.title}</strong><br/>
                  <em>{article.source}</em> | <a href={article.link} target="_blank" rel="noopener noreferrer">View</a>
                  <p style={{marginTop: 4}}>{article.abstract}</p>
                </li>
              ))}
            </ul>
            <div style={{marginTop: 16, fontSize: '0.9em', color: '#888'}}>
              {legacyDigest.date && (new Date(legacyDigest.date.seconds * 1000)).toLocaleString()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 