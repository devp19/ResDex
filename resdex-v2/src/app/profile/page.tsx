"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Navbar, NavBody, NavbarLogo, NavItems } from "@/components/ui/navbar";
import { Input } from "@/components/ui/input";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
// @ts-ignore
import ColorThief from "colorthief";
import { Briefcase, Tag, Search as SearchIcon, TrendingUp } from "lucide-react";
import { ChartCard } from "@/components/ChartCard";

const navItems = [
  { name: "Home", link: "/" },
  { name: "My Network", link: "/network" },
  { name: "Jobs", link: "/jobs" },
  { name: "Messaging", link: "/messaging" },
];

export default function ProfilePage() {
  const [subscribed, setSubscribed] = useState(false);
  const [gradient, setGradient] = useState("linear-gradient(to right, #fbe6b2, #f6b47b)");
  const imgRef = useRef<HTMLImageElement>(null);
  const profileImgSrc = "/jess-avatar.jpeg";

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      extractColors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileImgSrc]);

  const darkenColor = (rgbArr: number[], amount = 0.15): number[] => {
    // amount: 0.15 means 15% darker
    return rgbArr.map((c: number) => Math.max(0, Math.floor(c * (1 - amount))));
  };

  const extractColors = () => {
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
        // fallback in case of error
        setGradient("linear-gradient(to right, #fbe6b2, #f6b47b)");
      }
    }
  };

  // Example avatar URLs from randomuser.me for demo purposes
  const recommendedProfiles = [
    {
      name: "Jesselyn Wang",
      title: "Lead Product Designer at Apple",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Amanda Reyes",
      title: "Marketing Manager at Alibaba Group",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      name: "Han Ryujin",
      title: "CTO at Google",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Paul Arriola",
      title: "Lead Engineer at Tesla",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    },
    {
      name: "Tafari Sans",
      title: "Principal Designer at Spotify",
      avatar: "https://randomuser.me/api/portraits/men/76.jpg",
    },
    {
      name: "Velasco Timmbber",
      title: "Sr. Product Designer at Netflix",
      avatar: "https://randomuser.me/api/portraits/men/85.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col items-center py-8">
      {/* Navbar */}
      <Navbar>
        <NavBody>
          <div className="flex items-center w-full">
            {/* Left group: Logo + Search */}
            <div className="flex items-center gap-6 min-w-0">
              <NavbarLogo />
              <div className="relative w-full max-w-xs">
                <Input
                  type="text"
                  placeholder="Search"
                  className="rounded-full bg-white/30 backdrop-blur-md border-none shadow-none focus-visible:ring-2 focus-visible:ring-blue-200 placeholder:text-gray-400 px-6 py-3 h-12 w-full text-base !outline-none pr-12"
                  style={{ boxShadow: "0 2px 16px 0 rgba(80, 72, 72, 0.04)", background: "rgba(255,255,255,0.35)" }}
                />
                <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
            {/* Spacer */}
            <div className="flex-grow" />
            {/* Nav items on the right */}
            <NavItems items={navItems} className="static flex justify-end flex-1 space-x-2" />
          </div>
        </NavBody>
      </Navbar>
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 mt-8">
        {/* Main Column: Profile Card + Posts */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Main Profile Card */}
          <div className="w-full bg-white rounded-3xl overflow-hidden flex flex-col" style={{ minHeight: 420 }}>
            {/* Banner */}
            <div
              className="w-full h-40 rounded-t-3xl"
              style={{ background: gradient }}
            />
            {/* Avatar - left-aligned and overlapping banner & info */}
            <div className="relative w-full">
              <div className="absolute -top-20 left-10 z-10">
                <div className="w-36 h-36 rounded-full border-8 border-white overflow-hidden bg-gray-300">
                  <Image
                    src={profileImgSrc}
                    alt="Profile Avatar"
                    width={144}
                    height={144}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                  {/* Hidden img for color extraction */}
                  <img
                    ref={imgRef}
                    src={profileImgSrc}
                    alt="Profile Avatar Color Extract"
                    crossOrigin="anonymous"
                    style={{ display: "none" }}
                    onLoad={extractColors}
                  />
                </div>
              </div>
              {/* Info Section - left-aligned below avatar */}
              <div className="flex flex-col items-start w-full mt-20 ml-12 pr-25 pb-8">
                {/* Name and Follow button row */}
                <div className="flex w-full items-center mb-2">
                  <div className="text-3xl font-bold text-neutral-800 flex-1">Cathie Woods</div>
                  <AnimatedSubscribeButton
                    className="ml-20 rounded-full px-8 py-3 border transition-colors duration-200"
                    style={{ background: subscribed ? '#2a2a2a' : '#2a2a2a', color: subscribed ? '#fff' : '#fff', border: 'none' }}
                    subscribeStatus={subscribed}
                    onClick={() => setSubscribed((s) => !s)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.color = '#2a2a2a';
                      e.currentTarget.style.border = '1px solid #d1d5db';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#2a2a2a';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.border = 'none';
                    }}
                  >
                    <span>Follow</span>
                    <span>Following</span>
                  </AnimatedSubscribeButton>
                </div>
                {/* Title */}
                <div className="text-lg text-neutral-600 mb-1">Chief Operating Officer at Google</div>
                {/* Location */}
                <div className="text-md text-neutral-400 mb-4">Toronto, Canada</div>
                {/* Stats row */}
                <div className="flex gap-6 mb-6">
                  <div className="text-base text-neutral-700 font-semibold"><span className="font-bold">6,476</span> fellows</div>
                  <div className="text-base text-neutral-700 font-semibold"><span className="font-bold">500+</span> contributions</div>
                </div>
                {/* Organization section */}
                <div className="mb-2 flex items-center gap-2">
                  <Briefcase size={16} className="text-neutral-500" />
                  <span className="rounded-full px-4 py-2 bg-gray-100 font-medium text-gray-700">Google</span>
                </div>
                {/* Interests section */}
                <div className="mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-neutral-500" />
                  <div className="flex gap-2 flex-wrap">
                    <span className="rounded-full px-4 py-2 bg-gray-100 font-medium text-gray-700">Automation</span>
                    <span className="rounded-full px-4 py-2 bg-gray-100 font-medium text-gray-700">AI</span>
                    <span className="rounded-full px-4 py-2 bg-gray-100 font-medium text-gray-700">Finance</span>
                    <span className="rounded-full px-4 py-2 bg-gray-100 font-medium text-gray-700">Web Development</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Posts Section Placeholder */}
          <div className="bg-white rounded-xl min-h-[200px] flex items-center justify-center">
            <span className="text-gray-400">Posts Section</span>
          </div>
        </div>
        {/* Sidebar: People Also Viewed */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 min-h-[300px] flex flex-col">
            <div className="flex items-center gap-2 text-lg font-semibold text-neutral-800 mb-4">
              Trending Topics
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <ul className="flex flex-col">
              <li className="py-2">
                <div className="font-medium text-gray-800">AI & Machine Learning</div>
                <div className="text-xs text-gray-500 mt-1">1842 related posts in the past day</div>
              </li>
              <div className="h-px bg-gray-200 my-2 w-full" />
              <li className="py-2">
                <div className="font-medium text-gray-800">Product Management</div>
                <div className="text-xs text-gray-500 mt-1">1275 related posts in the past day</div>
              </li>
              <div className="h-px bg-gray-200 my-2 w-full" />
              <li className="py-2">
                <div className="font-medium text-gray-800">Cloud Computing</div>
                <div className="text-xs text-gray-500 mt-1">968 related posts in the past day</div>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 mt-2">
            <div className="text-lg font-semibold text-neutral-800 mb-4">Recommended for you</div>
            {/* List of recommended profiles */}
            <div className="flex flex-col">
              {recommendedProfiles.map((profile, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <Image src={profile.avatar} alt={profile.name} width={40} height={40} style={{ objectFit: "cover", width: "100%", height: "100%" }} unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-neutral-800 truncate">{profile.name}</div>
                      <div className="text-xs text-neutral-500 truncate">{profile.title}</div>
                    </div>
                    <button className="rounded-full bg-gray-100 text-gray-700 px-4 py-2 text-xs font-semibold hover:bg-gray-200 transition whitespace-nowrap">Visit</button>
                  </div>
                  {i < recommendedProfiles.length - 1 && <div className="h-px bg-gray-200 my-2 w-full" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 