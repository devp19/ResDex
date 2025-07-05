import React, { useState, useEffect } from 'react';
import { getTodaysDigest, fetchDailyResearchDigest } from '../services/researchDigestService';
import './ResearchDigest.css';

const ResearchDigest = () => {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDigest();
  }, []);

  const loadDigest = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodaysDigest();
      setDigest(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshDigest = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await fetchDailyResearchDigest({ storeInFirestore: true });
      setDigest(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateSummary = (summary, maxLength = 200) => {
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="research-digest-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading today's research digest...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="research-digest-container">
        <div className="error-message">
          <h3>Error Loading Research Digest</h3>
          <p>{error}</p>
          <button onClick={loadDigest} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="research-digest-container">
      <div className="digest-header">
        <h2>Daily Research Digest</h2>
        <div className="header-info">
          <span className="date">{formatDate(digest?.date || new Date())}</span>
          <span className="article-count">
            {digest?.totalArticles || 0} articles
          </span>
        </div>
        <button 
          onClick={refreshDigest} 
          disabled={refreshing}
          className="refresh-button"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {digest?.sources && (
        <div className="sources-summary">
          <span>From: </span>
          <span className="source-tag arxiv">
            arXiv ({digest.sources.arxiv || 0})
          </span>
          <span className="source-tag sciencedaily">
            ScienceDaily ({digest.sources.scienceDaily || 0})
          </span>
        </div>
      )}

      <div className="articles-container">
        {digest?.articles?.map((article, index) => (
          <div key={index} className="article-card">
            <div className="article-header">
              <h3 className="article-title">
                <a 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {article.title}
                </a>
              </h3>
              <span className={`source-badge ${article.source.toLowerCase()}`}>
                {article.source}
              </span>
            </div>
            
            <div className="article-meta">
              <span className="authors">
                <strong>Authors:</strong> {article.authors}
              </span>
              <span className="published-date">
                <strong>Published:</strong> {formatDate(article.publishedDate)}
              </span>
            </div>
            
            <p className="article-summary">
              {truncateSummary(article.summary)}
            </p>
            
            <div className="article-footer">
              <span className="category">{article.category}</span>
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="read-more"
              >
                Read Full Article →
              </a>
            </div>
          </div>
        ))}
      </div>

      {digest?.articles?.length === 0 && (
        <div className="no-articles">
          <p>No articles found for today's digest.</p>
          <button onClick={refreshDigest} className="retry-button">
            Fetch New Articles
          </button>
        </div>
      )}
    </div>
  );
};

export default ResearchDigest; 