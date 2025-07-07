import React from "react";
import { Building, Tag } from "lucide-react";
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

interface ProfileOrgInterestsCardProps {
  organization: string;
  interests: string[];
  className?: string;
  disableTilt?: boolean;
}

export const ProfileOrgInterestsCard: React.FC<ProfileOrgInterestsCardProps> = ({ organization, interests, className = "", disableTilt = false }) => {
  const tilt = use3dTiltNoScale();
  const tiltProps = disableTilt ? {} : { ref: tilt.ref, onMouseMove: tilt.onMouseMove, onMouseLeave: tilt.onMouseLeave };
  return (
    <div
      {...tiltProps}
      className={`flex flex-col w-full max-w-xs bg-[rgba(230,230,230,0.18)] dark:bg-[rgba(24,24,27,0.28)] backdrop-blur-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 outline outline-1 outline-gray-300/20 dark:outline-zinc-700/20 p-5 ${className}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Building size={18} className="text-neutral-500" />
        <div className="text-base text-gray-800 dark:text-gray-100">{organization}</div>
      </div>
      <div className="flex items-start gap-2">
        <Tag size={16} className="text-neutral-500 mt-1" />
        <div className="flex flex-wrap gap-2">
          {interests && interests.length > 0 ? (
            interests.map((interest, idx) => (
              <span key={idx} className="rounded-full px-3 py-1 bg-gray-200 dark:bg-zinc-700 font-medium text-gray-700 dark:text-gray-200 text-xs">{interest}</span>
            ))
          ) : (
            <span className="italic text-gray-400 text-xs">No interests added...</span>
          )}
        </div>
      </div>
    </div>
  );
}; 