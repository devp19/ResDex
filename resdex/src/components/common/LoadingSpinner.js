import React from "react";

/**
 * Reusable loading spinner component
 * @param {string} message - Loading message to display
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional styles to apply
 */
const LoadingSpinner = ({
  message = "Loading...",
  className = "text-center",
  style = {},
}) => {
  return (
    <div className={className} style={style}>
      <div className="spinner-border primary" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      <p className="primary mt-2">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
