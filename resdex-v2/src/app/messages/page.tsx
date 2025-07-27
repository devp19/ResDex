"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Navbar, NavBody, NavbarLogo, NavItems, MessageBadge, NotificationBadge } from "@/components/ui/navbar";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

export type User = { id: string; name: string; avatar_url?: string; username?: string };

export default function MessagesPage() {
  const [currentUserProfile, setCurrentUserProfile] = useState<{ display_name: string; avatar_url: string; username: string; bio?: string; organization?: string; location?: string } | null>(null);
  const [gradient, setGradient] = useState("linear-gradient(to right, #fbe6b2, #f6b47b)");
  const imgRef = useRef<HTMLImageElement>(null);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    // Example mock: you can fetch/set the current user profile from Supabase here if you wish
    // You might need to update to real fetch logic for current user
    setCurrentUserProfile({
      display_name: "Jane Doe",
      avatar_url: "/empty-pic.webp",
      username: "janedoe",
      bio: "Bio example",
      organization: "ResDex",
      location: "Toronto"
    });
  }, []);

  // Color gradient helper
  const darkenColor = (rgbArr: number[], amount = 0.15): number[] => {
    return rgbArr.map((c: number) => Math.max(0, Math.floor(c * (1 - amount))));
  };
  const extractColors = () => {
    // @ts-ignore
    const ColorThief = window.ColorThief || (globalThis as any).ColorThief;
    const colorThief = new ColorThief();
    const img = imgRef.current;
    if (img && img.complete) {
      try {
        const dominant = colorThief.getColor(img);
        const rgb1 = `rgb(${dominant.join(",")})`;
        const darker = darkenColor(dominant, 0.15);
        const rgb2 = `rgb(${darker.join(",")})`;
        setGradient(`linear-gradient(to right, ${rgb1}, ${rgb2})`);
      } catch (e) {
        setGradient("linear-gradient(to right, #fbe6b2, #f6b47b)");
      }
    }
  };

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Network", link: "/network" },
    { name: "Jobs", link: "/jobs" },
  ];

  return (
    <>
      <Navbar>
        <NavBody>
          <div className="flex items-center w-full">
            <div className="flex items-center gap-6 min-w-0">
              <NavbarLogo />
              <div className="relative w-full max-w-xs">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="rounded-full bg-white/30 backdrop-blur-md border-none shadow-none focus-visible:ring-2 focus-visible:ring-blue-200 placeholder:text-gray-400 px-6 py-3 h-12 w-full text-base !outline-none pr-12"
                  style={{ boxShadow: "0 2px 16px 0 rgba(80, 72, 72, 0.04)", background: "rgba(255,255,255,0.35)" }}
                />
              </div>
            </div>
            <div className="flex-grow" />
            <NavItems items={navItems} className="static flex justify-end flex-1 space-x-2" />
            <MessageBadge />
            <NotificationBadge />
            {currentUserProfile && (
              <Link href={`/profile/${currentUserProfile.username}`} className="ml-4">
                <Image
                  src={currentUserProfile.avatar_url || "/empty-pic.webp"}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border border-gray-300 cursor-pointer"
                />
              </Link>
            )}
          </div>
        </NavBody>
      </Navbar>
      <div className="flex h-[80vh] max-w-6xl mx-auto mt-10">
        
        <div className="flex flex-1 h-full border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg bg-[var(--card)]">
          <div className="w-72 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] flex flex-col">
            <h3 className="px-6 py-4 text-lg font-semibold text-[var(--sidebar-foreground)] border-b border-[var(--sidebar-border)]">Chat</h3>
            <div className="px-4 py-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full px-4 py-2 rounded-lg border border-[var(--input)] bg-[var(--muted)] text-[var(--sidebar-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)]"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Placeholder for sidebar user list */}
              <div className="text-center text-gray-400 py-8">No users found.</div>
            </div>
          </div>
          {/* Empty chat area */}
          <div className="flex-1 flex flex-col bg-[var(--card)]">
            <div className="flex flex-col items-center justify-center mt-50 h-full">
              <img
                src="/transparent-black.png"
                alt="ResDex Logo"
                className="w-24 h-24 mb-6 opacity-20 grayscale"
              />
              <div className="text-center text-gray-400 ml-20 mr-20">Start a conversation! ResDex is a place to share your thoughts and ideas with others.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
