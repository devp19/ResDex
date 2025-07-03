"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(229,227,223,0.95)] backdrop-blur-sm">
      <svg className="animate-spin mb-6" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="28" stroke="#181818" strokeWidth="6" opacity="0.15" />
        <path d="M60 32c0-15.464-12.536-28-28-28" stroke="#181818" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <span className="text-lg font-medium text-[#181818] tracking-wide">Loading...</span>
    </div>
  );
} 