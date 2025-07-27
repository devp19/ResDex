import React from "react";
import { use3dTilt } from "@/hooks/use3dTilt";

interface ProfileStatsCardProps {
  followers: number;
  following: number;
  contributions: number;
  noShadow?: boolean;
  className?: string;
  disableTilt?: boolean;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

// Custom tilt hook without scale
function use3dTiltNoScale(max = 15) {
  const ref = React.useRef<HTMLDivElement>(null);
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * max;
    const rotateY = ((x - centerX) / centerX) * -max;
    node.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }
  function handleMouseLeave() {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "";
  }
  return {
    ref,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}

export const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({
  followers,
  following,
  contributions,
  noShadow = false,
  className = "",
  disableTilt = false,
  onFollowersClick,
  onFollowingClick
}) => {
  const tilt = use3dTiltNoScale();
  const tiltProps = disableTilt
    ? {}
    : { ref: tilt.ref, onMouseMove: tilt.onMouseMove, onMouseLeave: tilt.onMouseLeave };
  return (
    <div
      {...tiltProps}
      className={`flex w-full max-w-md bg-[rgba(230,230,230,0.18)] dark:bg-[rgba(24,24,27,0.28)] backdrop-blur-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 outline outline-1 outline-gray-300/20 dark:outline-zinc-700/20 p-3 ${noShadow ? "" : "shadow-2xl"} ${className}`}
    >
      <div className="flex-1 flex flex-col items-start justify-center mx-3">
        <button
          type="button"
          onClick={onFollowersClick}
          className="text-2xl font-bold focus:outline-none focus:underline hover:underline transition"
          style={{ background: "none", border: 0, padding: 0, margin: 0, cursor: onFollowersClick ? "pointer" : "default" }}
          tabIndex={0}
        >
          {followers}
        </button>
        <span className="text-sm mt-1 text-neutral-400">Followers</span>
      </div>
      <div className="w-px bg-zinc-200 dark:bg-zinc-700 mx-6" />
      <div className="flex-1 flex flex-col items-start justify-center">
        <button
          type="button"
          onClick={onFollowingClick}
          className="text-2xl font-bold focus:outline-none focus:underline hover:underline transition"
          style={{ background: "none", border: 0, padding: 0, margin: 0, cursor: onFollowingClick ? "pointer" : "default" }}
          tabIndex={0}
        >
          {following}
        </button>
        <span className="text-sm mt-1 text-neutral-400">Following</span>
      </div>
      <div className="w-px bg-zinc-200 dark:bg-zinc-700 mx-6" />
      <div className="flex-1 flex flex-col items-start justify-center">
        <span className="text-2xl font-bold">{contributions}</span>
        <span className="text-sm mt-1 text-neutral-400">Contributions</span>
      </div>
    </div>
  );
};
