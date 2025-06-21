import React from "react";

/**
 * Reusable component for displaying error and success messages
 * @param {string} error - Error message to display
 * @param {string} success - Success message to display
 * @param {string} errorClassName - CSS class for error styling
 * @param {string} successClassName - CSS class for success styling
 */
const MessageDisplay = ({
  error,
  success,
  errorClassName = "error-text primary",
  successClassName = "success-text primary",
}) => {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <strong className={errorClassName}>
          {error}
          <br />
        </strong>
      )}
      {success && (
        <strong className={successClassName}>
          {success}
          <br />
        </strong>
      )}
    </>
  );
};

export default MessageDisplay;
