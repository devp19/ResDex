"use client";
import React, { useState } from "react";
import { Navbar, NavBody, NavItems, NavbarLogo } from "@/components/ui/navbar";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { TextAnimate } from "@/components/magicui/text-animate";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Blog", link: "/blog" },
  { name: "Contact", link: "/contact" },
];

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  // Placeholder for live count (replace with real fetch logic)
  const [waitlistCount] = useState(438);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add waitlist submission logic
    alert("You have been added to the waitlist!");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          
          <NavItems items={navItems} />
        </NavBody>
      </Navbar>
      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="title text-center">
            <span className="whitespace-nowrap">
              <TextAnimate animation="fadeIn" by="text" as="span" className="inline">
                {`Change the way `}
              </TextAnimate>
              <PointerHighlight pointerClassName="text-[#2a2a2a]">
                <TextAnimate animation="fadeIn" by="text" as="span" className="inline px-2 py-1">
                  {`you`}
                </TextAnimate>
              </PointerHighlight>
            </span>
            <br />
            <TextAnimate animation="fadeIn" by="text" as="span" className="inline">
              {`do research.`}
            </TextAnimate>
          </h1>
        </div>
        
        <p className="text-base sm:text-lg text-gray-400 text-center mb-8 mt-4 max-w-md">Be the first to discover new research opportunities and get early access to our platform.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full max-w-md">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 px-6 py-3 rounded-full border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#2a2a2a] shadow-sm placeholder:text-gray-400 transition w-full sm:w-auto"
            style={{ minWidth: 0 }}
          />
          <ShimmerButton type="submit" className="px-6 py-3 rounded-full text-base whitespace-nowrap">Join Waitlist</ShimmerButton>
        </form>
        <div className="flex items-center gap-2 mt-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-gray-500">{waitlistCount.toLocaleString()} people are changing the way they do research.</span>
        </div>
      </div>
    </div>
  );
} 