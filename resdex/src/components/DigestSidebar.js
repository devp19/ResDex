import React, { useState, useEffect } from 'react';
import './DigestSidebar.css';

const DigestSidebar = ({ 
  selectedCategory, 
  onCategoryChange, 
  selectedSource, 
  onSourceChange, 
  categories = {}, 
  sources = {},
  allCategories = [],
  favoriteCategories = [],
  onToggleFavorite = () => {}
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Function to get category color class
  const getCategoryColorClass = (category) => {
    const categoryMap = {
      'AI / ML': 'ai',
      'Space / Physics': 'space',
      'Biology / Health': 'bio',
      'Quantum': 'quantum',
      'Economics': 'economics',
      'Materials / Chemistry': 'materials',
      'Mathematics': 'math',
      'Cybersecurity': 'security',
      'Computer Vision': 'vision',
      'Robotics': 'robotics',
      'Software Engineering': 'software',
      'Applied Physics': 'physics',
      'Chemistry / Physics': 'chemistry',
      'Computational Physics': 'comp-physics',
      'Fluid Dynamics': 'fluid',
      'Optics / Photonics': 'optics',
      'Plasma Physics': 'plasma',
      'Social Physics': 'social',
      'Statistics': 'stats',
      'Finance': 'finance',
      'Theoretical Physics': 'theoretical',
      'Nuclear Physics': 'nuclear',
      'Gravitation / Cosmology': 'cosmology',
      'Computer Architecture': 'architecture',
      'Computational Complexity': 'complexity',
      'Computational Engineering': 'comp-eng',
      'Computational Geometry': 'geometry',
      'Computational Linguistics': 'linguistics',
      'Cryptography / Security': 'crypto',
      'Computers / Society': 'society',
      'Databases': 'databases',
      'Distributed Computing': 'distributed',
      'Digital Libraries': 'libraries',
      'Discrete Mathematics': 'discrete',
      'Data Structures': 'structures',
      'Emerging Technologies': 'emerging',
      'Formal Languages': 'languages',
      'General Literature': 'literature',
      'Graphics': 'graphics',
      'Computer Science / Game Theory': 'game-theory',
      'Human-Computer Interaction': 'hci',
      'Information Retrieval': 'ir',
      'Information Theory': 'info-theory',
      'Logic in Computer Science': 'logic',
      'Multiagent Systems': 'agents',
      'Multimedia': 'multimedia',
      'Mathematical Software': 'math-software',
      'Numerical Analysis': 'numerical',
      'Neural Computing': 'neural',
      'Networking': 'networking',
      'Other Computer Science': 'other-cs',
      'Operating Systems': 'os',
      'Performance': 'performance',
      'Programming Languages': 'programming',
      'Symbolic Computation': 'symbolic',
      'Sound': 'sound',
      'Social Information': 'social-info',
      'Systems / Control': 'systems'
    };
    
    return categoryMap[category] || 'default';
  };

  // Get all unique categories from the data
  const allCategoryLabels = allCategories.map(cat => cat.label);
  
  // Create a complete list of categories with counts (including 0 counts)
  const completeCategories = allCategoryLabels.map(category => ({
    name: category,
    count: categories[category] || 0,
    color: getCategoryColorClass(category),
    isFavorite: favoriteCategories.includes(category)
  }));

  // Sort categories by count (descending), then alphabetically
  const sortedCategories = completeCategories.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name);
  });

  // Get top categories for collapsed view (top 3-4 with most articles)
  const topCategories = sortedCategories.slice(0, 4);

  const totalArticles = Object.values(categories).reduce((sum, count) => sum + count, 0);
  const totalSources = Object.values(sources).reduce((sum, count) => sum + count, 0);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && !event.target.closest('.digest-sidebar')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={toggleMobile}></div>
      )}

      {/* Mobile Toggle Button */}
      <button 
        className="mobile-sidebar-toggle"
        onClick={toggleMobile}
        aria-label="Toggle sidebar"
      >
        <svg className="hamburger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`digest-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-content">
          {/* Header with toggle */}
          <div className="sidebar-header">
            <div className="header-top">
              <h2>Research Digest</h2>
              <button
                className="collapse-toggle"
                onClick={toggleCollapse}
                title={isCollapsed ? 'Expand categories' : 'Collapse categories'}
              >
                <svg 
                  className={`chevron-icon ${isCollapsed ? 'collapsed' : ''}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="sr-only">{isCollapsed ? 'Expand' : 'Collapse'}</span>
              </button>
            </div>
            
            <div className="stats">
              <div className="stat">
                <span className="stat-number">{totalArticles}</span>
                <span className="stat-label">Articles</span>
              </div>
              <div className="stat">
                <span className="stat-number">{totalSources}</span>
                <span className="stat-label">Sources</span>
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          {favoriteCategories.length > 0 && (
            <div className="sidebar-section favorites-section">
              <h3>
                <span className="star-icon">⭐</span>
                Favorites
              </h3>
              <div className="category-list">
                {favoriteCategories.map((category) => {
                  const categoryData = completeCategories.find(cat => cat.name === category);
                  if (!categoryData) return null;
                  
                  return (
                    <button
                      key={category}
                      className={`category-item favorite ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => onCategoryChange(category)}
                    >
                      <div className="category-info">
                        <span className={`category-dot category-dot-${categoryData.color}`}></span>
                        <span className="category-name">{category}</span>
                      </div>
                      <div className="category-actions">
                        <span className="category-count">{categoryData.count}</span>
                        <button
                          className="favorite-toggle"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(category);
                          }}
                          title="Remove from favorites"
                        >
                          ★
                        </button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categories Section */}
          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="category-list">
              <button
                className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => onCategoryChange('all')}
              >
                <span className="category-name">All Categories</span>
                <span className="category-count">{totalArticles}</span>
              </button>
              
              {/* Show different content based on collapsed state */}
              {(isCollapsed ? topCategories : sortedCategories).map((category) => (
                <button
                  key={category.name}
                  className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
                  onClick={() => onCategoryChange(category.name)}
                >
                  <div className="category-info">
                    <span className={`category-dot category-dot-${category.color}`}></span>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-actions">
                    <span className={`category-count ${category.count === 0 ? 'zero' : ''}`}>
                      {category.count}
                    </span>
                    <button
                      className={`favorite-toggle ${category.isFavorite ? 'favorited' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(category.name);
                      }}
                      title={category.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {category.isFavorite ? '★' : '☆'}
                    </button>
                  </div>
                </button>
              ))}
              
              {/* Show collapse/expand button at the end of categories */}
              {sortedCategories.length > 4 && (
                <button
                  className="see-more-button"
                  onClick={toggleCollapse}
                >
                  <span>{isCollapsed ? 'See All Categories' : 'Show Less'}</span>
                  <svg 
                    className={`chevron-down ${!isCollapsed ? 'collapsed' : ''}`} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Sources Section */}
          <div className="sidebar-section">
            <h3>Sources</h3>
            <div className="source-list">
              <button
                className={`source-item ${selectedSource === 'all' ? 'active' : ''}`}
                onClick={() => onSourceChange('all')}
              >
                <span className="source-name">All Sources</span>
                <span className="source-count">{totalSources}</span>
              </button>
              
              {Object.entries(sources).map(([source, count]) => (
                <button
                  key={source}
                  className={`source-item ${selectedSource === source ? 'active' : ''}`}
                  onClick={() => onSourceChange(source)}
                >
                  <span className="source-name">{source}</span>
                  <span className="source-count">{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-footer">
            <p className="last-updated">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="digest-info">
              Multi-disciplinary research from arXiv across all academic fields
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DigestSidebar; 