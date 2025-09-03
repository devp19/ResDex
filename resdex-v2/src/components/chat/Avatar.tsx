import React from "react";

export default function Avatar({
  src,
  alt,
  size = 24,
}: { src?: string | null; alt: string; size?: number }) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={style}
        className="rounded-full object-cover ring-2 ring-white"
      />
    );
  }
  // Fallback initials
  const initials =
    alt
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0]?.toUpperCase())
      .join("") || "?";
  return (
    <div
      style={style}
      className="rounded-full bg-gray-300 text-gray-700 grid place-items-center text-[10px] font-semibold ring-2 ring-white"
      aria-label={alt}
    >
      {initials}
    </div>
  );
}
