import React from 'react';
import './LotusLoader.css';

const LotusLoader = ({ text = "Loading..." }) => {
  return (
    <div className="lotus-loader-overlay">
      <div className="lotus-container">
        <svg className="lotus-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Petals */}
          {[...Array(8)].map((_, i) => (
            <path
              key={i}
              className="lotus-petal"
              d="M 50,5 C 30,10 20,40 50,50 C 80,40 70,10 50,5"
              transform={`rotate(${i * 45} 50 50)`}
            />
          ))}
          {/* Center */}
          <circle className="lotus-center" cx="50" cy="50" r="5" />
        </svg>
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
};

export default LotusLoader; 