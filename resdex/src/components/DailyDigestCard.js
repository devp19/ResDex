import React, { useState } from 'react';
import './DailyDigestCard.css';

const DailyDigestCard = ({ 
  title, 
  summary, 
  tag, 
  link, 
  author, 
  published, 
  source,
  aiSummary 
}) => {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  // Function to map category to CSS class
  const getCategoryClass = (category) => {
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const categoryClass = getCategoryClass(tag);

  return (
    <article className="digest-card">
      <div className="card-content">
        <div className="card-header">
          <span className={`tag tag-${categoryClass}`}>
            {tag}
          </span>
          <span className="source-badge">
            {source}
          </span>
        </div>
        
        <h3 className="card-title">
          <a href={link} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </h3>
        
        <p className="card-summary">
          {summary}
        </p>
        
        {/* AI Summary Section */}
        {aiSummary && (
          <div className="ai-summary-section">
            <button
              className="ai-summary-toggle"
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              aria-expanded={isSummaryExpanded}
            >
              <span className="toggle-icon">
                {isSummaryExpanded ? '−' : '+'}
              </span>
              <span className="toggle-text">
                {isSummaryExpanded ? 'Hide Summary' : 'Read Summary'}
              </span>
              <span className="ai-badge">AI</span>
            </button>
            
            {isSummaryExpanded && (
              <div className="ai-summary-content">
                <div className="ai-summary-header">
                  <span className="ai-icon">🤖</span>
                  <span className="ai-label">Summarized using AI</span>
                </div>
                <p className="ai-summary-text">
                  {aiSummary}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="card-footer">
          <div className="card-meta">
            <span className="author">{author}</span>
            <span className="date">{formatDate(published)}</span>
          </div>
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="read-more"
          >
            Read more ↗
          </a>
        </div>
      </div>
    </article>
  );
};

export default DailyDigestCard; 