"use client";
import React, { useState, useEffect, memo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { BlurFade } from "@/components/magicui/blur-fade";
import { TextAnimate } from "@/components/magicui/text-animate";
import { use3dTilt } from "@/hooks/use3dTilt";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Digest", link: "/blog" },
  { name: "Brainwave", link: "/contact" },
  { name: "Discovery ↗", link: "/discovery" },
];

const AnimatedHeading = memo(() => (
  <TextAnimate
    animation="fadeIn"
    by="line"
    as="h1"
    className="text-5xl md:text-7xl font-bold text-center leading-tight text-gray-900 mb-6 max-w-2xl mx-auto"
    style={{ fontFamily: 'Satoshi-Bold, sans-serif' }}
  >
    {`Changing the way you do research.`}
  </TextAnimate>
));

const AnimatedSubheading = memo(() => (
  <TextAnimate
    animation="fadeIn"
    by="line"
    as="p"
    className="mt-2 text-base md:text-lg text-gray-600 text-center max-w-xl mb-8 satoshi-medium"
  >
    Be the first to discover new research opportunities and get early access to our platform.
  </TextAnimate>
));

export default function WaitlistPage() {
    const tiltLogo = use3dTilt();
  const [email, setEmail] = useState("");
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [joined, setJoined] = useState(false);

  const fetchCount = async () => {
    try {
      const res = await fetch('/api/waitlist-count');
      const data = await res.json();
      setWaitlistCount(data.count);
    } catch (error) {
      console.error("Error fetching waitlist count:", error);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("waitlist")
      .insert([{ email }]);
    if (error) {
      alert("There was an error. Please try again.");
    } else {
      setEmail("");
      setJoined(true);
      setTimeout(() => setJoined(false), 2000);
      setTimeout(fetchCount, 200);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
      {/* Navbar */}
      {/* Navbar */}
            <nav className="relative z-10 flex items-center py-6 px-8 w-full max-w-7xl mx-auto">
              {/* Logo */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Image src="/beige-logo.png" alt="ResDex Logo" width={32} height={32} />
                <span className="ml-1 font-bold text-lg" style={{ fontFamily: 'GellixMedium, sans-serif' }}>ResDex</span>
              </div>
              {/* Nav Links - centered absolutely */}
              <div className="hidden md:flex gap-6 bg-gray-50 rounded-full px-4 py-2 text-sm font-medium absolute left-1/2 -translate-x-1/2" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
                <a href="/" className="px-3 py-2 rounded-full hover:bg-gray-100 transition text-black bg-white shadow">Home</a>
                <a href="/waitlist" className="px-3 py-2 rounded-full hover:bg-gray-100 transition">Digest</a>
                <a href="/waitlist" className="px-3 py-2 rounded-full hover:bg-gray-100 transition">Brainwave</a>
                <a href="/waitlist" className="px-3 py-2 rounded-full hover:bg-gray-100 transition">Discovery ↗</a>
              </div>
              {/* Right side: Discord + Wallet */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                <button className="rounded-full p-2 hover:bg-gray-100 transition">
                  {/* Discord icon (placeholder) */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#23272A"/><path d="M8.5 15.5C8.5 15.5 9.5 16 12 16C14.5 16 15.5 15.5 15.5 15.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><ellipse cx="9.5" cy="12" rx="1" ry="1.5" fill="#fff"/><ellipse cx="14.5" cy="12" rx="1" ry="1.5" fill="#fff"/></svg>
                </button>
                {/* <button className="rounded-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium transition" style={{ fontFamily: 'GellixMedium, sans-serif', cursor: 'pointer' }}>
                  Join Waitlist ↗
                </button> */}
              </div>
            </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-100px)] flex-1 -mt-12">
        {/* SVG Curved Streaks Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0 200 Q720 400 1440 200" stroke="#ececec" strokeWidth="2" fill="none" />
            <path d="M0 400 Q720 600 1440 400" stroke="#f3f3f3" strokeWidth="2" fill="none" />
            <path d="M0 600 Q720 800 1440 600" stroke="#f5f5f5" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="relative z-10 w-full flex flex-col items-center">
          <div ref={tiltLogo.ref} onMouseMove={tiltLogo.onMouseMove} onMouseLeave={tiltLogo.onMouseLeave} className="mb-6 inline-block">
                      <Image src="/beige-logo.png" alt="ResDex Logo" width={56} height={56} className="rounded-xl" />
          </div>
          <AnimatedHeading />
          <AnimatedSubheading />
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 mb-4 w-full max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#2a2a2a] shadow-sm placeholder:text-gray-400 transition w-full"
              style={{ minWidth: 0, fontFamily: 'GellixMedium, sans-serif' }}
            />
            <button
              type="submit"
              className={`px-6 py-3 rounded-full text-base whitespace-nowrap w-full sm:w-auto transition-all duration-300 font-semibold ${joined ? "bg-green-500 text-white scale-105" : "bg-[#101828] text-white"}`}
              disabled={joined}
              style={{ fontFamily: 'GellixMedium, sans-serif', cursor: 'pointer' }}
            >
              {joined ? "Joined Waitlist!" : "Join Waitlist"}
            </button>
          </form>
          <div className="flex items-center gap-2 mt-2 justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-500">{waitlistCount.toLocaleString()} people already have shown interest</span>
          </div>

        

        </div>
      </section>
    </div>
  );
}