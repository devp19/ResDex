import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface AvatarDropdownProps {
  userProfile: any; // profile row for logged-in user
  displayName: string;
  username: string;
  avatarUrl: string;
  onSignOut: () => Promise<void>;
  myProfileUrl?: string;
}

export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  userProfile,
  displayName,
  username,
  avatarUrl,
  onSignOut,
  myProfileUrl = "/profile/" + (userProfile?.username || ""),
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      setDropdownOpen(false);
      setConfirmSignOut(false);
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    setTimeout(async () => {
      await onSignOut();
      setSigningOut(false);
      setDropdownOpen(false);
      setConfirmSignOut(false);
    }, 900);
  };

  return (
    <div className="relative ml-4">
      <button
        className="flex items-center gap-2 focus:outline-none rounded-full transition-colors duration-150 hover:bg-gray-200/60 cursor-pointer px-2 py-1"
        onClick={e => {
          e.stopPropagation();
          setDropdownOpen(v => !v);
        }}
      >
        <Image
          src={avatarUrl || "/empty-pic.webp"}
          alt="Profile"
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover border border-gray-300"
        />
        <ChevronDown className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : "rotate-0"}`} size={20} />
      </button>
      {dropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-200 z-50 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <div className="font-semibold text-base text-black truncate">{displayName}</div>
            <div className="text-xs text-neutral-500 opacity-80 truncate mt-0.5">@{username}</div>
          </div>
          <motion.button
            key="my-profile-btn"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition border-b border-gray-100"
            onClick={() => window.location.href = myProfileUrl}
          >
            My Profile
          </motion.button>
          {/* Sign out logic */}
          <AnimatePresence mode="wait" initial={false}>
            {!signingOut && !confirmSignOut ? (
              <motion.button
                key="signout-btn"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition"
                onClick={() => setConfirmSignOut(true)}
              >
                Sign out
              </motion.button>
            ) : confirmSignOut ? (
              <motion.div
                key="confirm-pill"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex justify-center py-4"
              >
                <button
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#2a2a2a] text-white text-sm font-semibold shadow hover:bg-[#444] transition min-w-[150px] justify-center overflow-hidden"
                  style={{ minHeight: 40 }}
                  disabled={signingOut}
                  onClick={handleSignOut}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {!signingOut ? (
                      <motion.span
                        key="confirm"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-2"
                      >
                        Confirm Signout
                      </motion.span>
                    ) : (
                      <motion.span
                        key="signedout"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-5 h-5 text-white mr-1" /> Signed out
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown; 