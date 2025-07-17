"use client";
import React, { useState, useEffect } from "react";
import { Navbar, NavBody, NavItems, NavbarLogo } from "@/components/ui/navbar";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { TextAnimate } from "@/components/magicui/text-animate";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Blog", link: "/blog" },
  { name: "Contact", link: "/contact" },
];

const Tilt = dynamic(() => import("react-parallax-tilt"), { ssr: false });


export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [joined, setJoined] = useState(false);

  const fetchCount = async () => {
    try {
      const res = await fetch('/api/waitlist-count');
      const data = await res.json();
      setWaitlistCount(data.count);
      console.log("Waitlist count:", data.count);
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

  // Remove offset and displayCount logic from frontend

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden px-4 sm:px-6 md:px-8">
      {/* Navbar */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
        </NavBody>
      </Navbar>
      {/* Main Content */}
      <main className="flex flex-4 flex-col items-center justify-center w-full max-w-md mx-auto py-8 gap-4">
        <div className="w-full">
          <div className="flex justify-center mb-4">
            <Tilt glareEnable={true} glareMaxOpacity={0.08} glareColor="#fff" glarePosition="all" scale={1.01} transitionSpeed={2500}>
              <Image src="/beige-logo.png" alt="ResDex Logo" width={80} height={80} className="rounded-xl" />
            </Tilt>
          </div>
          <BlurFade delay={0.1} inView>
            <TextAnimate
              animation="fadeIn"
              by="line"
              as="h1"
              className="title text-center"
            >
              {`Changing the way you do research.`}
            </TextAnimate>
          </BlurFade>
        </div>
        <p className="text-base sm:text-lg text-gray-400 text-center mb-6 mt-2 max-w-xs sm:max-w-md mx-auto px-2">
          Be the first to discover new research opportunities and get early access to our platform.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 mb-4 w-full">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-full border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#2a2a2a] shadow-sm placeholder:text-gray-400 transition w-full"
            style={{ minWidth: 0 }}
          />
          <ShimmerButton
            type="submit"
            className={`px-6 py-3 rounded-full text-base whitespace-nowrap w-full sm:w-auto transition-all duration-300 ${joined ? "bg-green-500 text-white scale-105" : ""}`}
            disabled={joined}
          >
            {joined ? "Joined Waitlist!" : "Join Waitlist"}
          </ShimmerButton>
        </form>
        <div className="flex items-center gap-2 mt-2 justify-center">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-gray-500">{waitlistCount.toLocaleString()} people already have shown interest</span>
        </div>
      </main>
    </div>
  );
} 