import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  style?: React.CSSProperties;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  className = "flex flex-col items-center justify-center",
  style = {},
}) => {
  return (
    <div className={className} style={style}>
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#2a2a2a] mb-3" />
      <p className="text-[#2a2a2a] text-base font-medium mt-1">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 