"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaRegSadTear, FaUserGraduate } from "react-icons/fa";

// Custom color for primary button
const PRIMARY_BTN_BG = '#101828';

// Placeholder SVGs for floating shapes
const FloatingShape = ({ className, style, children }: any) => (
  <div className={className} style={{ position: 'absolute', ...style }}>
    {children}
  </div>
);

const features = [
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#101828" strokeWidth="2"/><path d="M8 12h8M12 8v8" stroke="#101828" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    title: "Discovery",
    desc: "Find research opportunities, labs, and mentors across universities.",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#101828" strokeWidth="2"/><path d="M8 16v-4a4 4 0 118 0v4" stroke="#101828" strokeWidth="2"/></svg>
    ),
    title: "Portfolio",
    desc: "Showcase your work, skills, and academic journey.",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="8" cy="12" r="3" stroke="#101828" strokeWidth="2"/><circle cx="16" cy="12" r="3" stroke="#101828" strokeWidth="2"/><path d="M8 15c-2.5 0-4 1.5-4 3v1h8v-1c0-1.5-1.5-3-4-3zm8 0c-2.5 0-4 1.5-4 3v1h8v-1c0-1.5-1.5-3-4-3z" stroke="#101828" strokeWidth="2"/></svg>
    ),
    title: "Community",
    desc: "Connect with peers, join discussions, and get feedback.",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#101828" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="#12B76A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: "Verified",
    desc: "All listings are vetted for authenticity and relevance.",
  },
];

export default function CanopyDemo() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* SVG Curved Streaks Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M0 200 Q720 400 1440 200" stroke="#ececec" strokeWidth="2" fill="none" />
          <path d="M0 400 Q720 600 1440 400" stroke="#f3f3f3" strokeWidth="2" fill="none" />
          <path d="M0 600 Q720 800 1440 600" stroke="#f5f5f5" strokeWidth="2" fill="none" />
        </svg>
      </div>
      {/* Navbar */}
      <nav className="relative z-10 flex items-center py-6 px-8 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image src="/beige-logo.png" alt="ResDex Logo" width={32} height={32} />
          <span className="ml-1 font-bold text-lg" style={{ fontFamily: 'GellixMedium, sans-serif' }}>ResDex</span>
        </div>
        {/* Nav Links - centered absolutely */}
        <div className="hidden md:flex gap-6 bg-gray-50 rounded-full px-4 py-2 text-sm font-medium absolute left-1/2 -translate-x-1/2" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
          <a href="#" className="px-2 py-1 rounded-full hover:bg-gray-100 transition text-black bg-white shadow">Home</a>
          <a href="#" className="px-2 py-1 rounded-full hover:bg-gray-100 transition">Digest</a>
          <a href="#" className="px-2 py-1 rounded-full hover:bg-gray-100 transition">Brainwave</a>
          <a href="#" className="px-2 py-1 rounded-full hover:bg-gray-100 transition">Discovery ↗</a>
        </div>
        {/* Right side: Discord + Wallet */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button className="rounded-full p-2 hover:bg-gray-100 transition">
            {/* Discord icon (placeholder) */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#23272A"/><path d="M8.5 15.5C8.5 15.5 9.5 16 12 16C14.5 16 15.5 15.5 15.5 15.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><ellipse cx="9.5" cy="12" rx="1" ry="1.5" fill="#fff"/><ellipse cx="14.5" cy="12" rx="1" ry="1.5" fill="#fff"/></svg>
          </button>
          <button className="rounded-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium transition" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
            Join Waitlist ↗
          </button>
        </div>
      </nav>
     
      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] flex-1 -mt-12" style={{ fontFamily: 'GellixMedium, sans-serif', minHeight: 'calc(100vh - 100px)' }}>
        <Image src="/beige-logo.png" alt="ResDex Logo" width={56} height={56} className="rounded-xl mb-6" />
        <h1 className="text-5xl md:text-7xl font-bold text-center leading-tight text-gray-900 mb-6" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
          Rediscover<br className="sm:hidden" /> the <br></br>world of <br className="sm:hidden" /> research.
        </h1>
        <p className="mt-2 text-base md:text-lg text-gray-600 text-center max-w-xl mb-8" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
          ResDex is the new way to explore, connect, and stay updated with the latest in research and academia.
        </p>
        <div className="flex gap-4 mt-2">
          <a
            href="#"
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-none"
            style={{ fontFamily: 'GellixMedium, sans-serif', background: PRIMARY_BTN_BG, border: 'none' }}
            onMouseOver={e => e.currentTarget.style.background = '#23272F'}
            onMouseOut={e => e.currentTarget.style.background = PRIMARY_BTN_BG}
          >
            Join Waitlist
            <span className="ml-1">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 bg-[#f7f7f9] text-[#101117] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#ececec] transition shadow-none"
            style={{ fontFamily: 'GellixMedium, sans-serif' }}
          >
            Explore ResDex
            <span className="ml-1">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </span>
          </a>
        </div>
        
      </section>
       {/* Partnered Universities - straight line */}
       <div className="relative w-full flex flex-col items-center justify-center -mt-16 mb-8">
        <div className="mt-8 text-gray-500 text-sm" style={{ fontFamily: 'GellixMedium, sans-serif' }}>Trusted by students at</div>
        <div className="flex flex-row items-center justify-center gap-32 mt-6 w-full max-w-3xl mx-auto">
          <img src="/McMaster.png" alt="McMaster" className="w-20 h-20 object-contain" />
          <img src="/TMU.png" alt="TMU" className="w-20 h-20 object-contain" />
          <img src="/Laurier.png" alt="Laurier" className="w-20 h-20 object-contain" />
          <img src="/UOFT.png" alt="UofT" className="w-20 h-20 object-contain" />
          <img src="/UOttawa.png" alt="Ottawa" className="w-20 h-20 object-contain" />
        </div>
      </div>

      {/* Problem Showcase Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-center py-24 bg-transparent max-w-6xl mx-auto">
        {/* Left: Floating message cards */}
        <div className="relative flex-1 flex flex-col items-center justify-center min-h-[340px] w-full md:w-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: "spring" }}
            className="absolute left-0 top-8 md:left-8 md:top-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 w-72 flex flex-row items-center gap-3 border border-gray-100"
            style={{ fontFamily: 'GellixMedium, sans-serif' }}
          >
            <FaEnvelope className="text-2xl" style={{ color: '#c4c4bc' }} />
            <div>
              <div className="font-semibold text-gray-800">Cold Email</div>
              <div className="text-gray-500 text-sm">Hi Professor, I’m interested in your research. Are there any open positions in your lab?</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: "spring", delay: 0.2 }}
            className="absolute right-0 top-40 md:right-8 md:top-40 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 w-72 flex flex-row items-center gap-3 border border-gray-100"
            style={{ fontFamily: 'GellixMedium, sans-serif' }}
          >
            <FaRegSadTear className="text-2xl" style={{ color: '#c4c4bc' }} />
            <div>
              <div className="font-semibold text-gray-800">No Response</div>
              <div className="text-gray-500 text-sm">(2 weeks later) Still waiting for a reply...</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: "spring", delay: 0.4 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 w-72 flex flex-row items-center gap-3 border border-gray-100"
            style={{ fontFamily: 'GellixMedium, sans-serif' }}
          >
            <FaUserGraduate className="text-2xl" style={{ color: '#c4c4bc' }} />
            <div>
              <div className="font-semibold text-gray-800">Student</div>
              <div className="text-gray-500 text-sm">I wish there was an easier way to find research opportunities...</div>
            </div>
          </motion.div>
        </div>
        {/* Right: Headline and Description */}
        <div className="flex-1 flex flex-col items-center md:items-start justify-center mt-96 md:mt-0 px-4 md:px-12">
          <div className="inline-block mb-3">
            <span className="px-4 py-1 rounded-lg text-xs font-thin" style={{ background: '#c4c4bc', color: '#fff', fontFamily: 'GellixMedium, sans-serif' }}>
              Problem
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center md:text-left" style={{ fontFamily: 'GellixMedium, sans-serif', color: '#101117' }}>
            Research is hard.<br />
            <span className="text-gray-400">Cold emailing is harder.</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mb-4 text-center md:text-left" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
            You send dozens of emails, wait for replies, and rarely hear back. Finding research opportunities shouldn’t be this difficult.
          </p>
          <p className="text-base max-w-xl text-center md:text-left" style={{ fontFamily: 'GellixMedium, sans-serif', color: '#c4c4bc' }}>
            What if there was a better way to connect with mentors and labs?
          </p>
        </div>
      </section>
      
      {/* Modern Rounded Rectangle Section */}
      <section className="w-full flex flex-col items-center justify-center py-24 bg-transparent">
        <div className="relative bg-[#101117] rounded-3xl shadow-xl max-w-4xl w-full mx-auto px-8 py-20 flex flex-col items-center justify-center" style={{ minHeight: '380px' }}>
          {/* Subtle grid background pattern */}
          <svg className="absolute inset-0 w-full h-full z-0" style={{ borderRadius: 'inherit' }} width="100%" height="100%" viewBox="0 0 800 400" fill="none">
            <g opacity="0.08">
              <rect x="0" y="0" width="800" height="400" fill="none" />
              {[...Array(9)].map((_, i) => (
                <line key={i} x1={i*100} y1="0" x2={i*100} y2="400" stroke="#fff" strokeWidth="1" />
              ))}
              {[...Array(5)].map((_, i) => (
                <line key={i} x1="0" y1={i*80} x2="800" y2={i*80} stroke="#fff" strokeWidth="1" />
              ))}
            </g>
          </svg>
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'GellixMedium, sans-serif', color: '#fff' }}>
            We're building the biggest research hub in the world.<br />
              <span className="text-[#c4c4bc]">and you're in the center of it.</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-xl mb-8" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
              Purpose built for students and researchers, our modern platform lets you discover, connect, and grow your academic impact with ease.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-[#c4c4bc] text-[#101117] px-6 py-3 rounded-xl font-semibold text-base hover:bg-[#b0b0a8] transition shadow-none"
              style={{ fontFamily: 'GellixMedium, sans-serif' }}
            >
              Explore Initiatives
              <span className="ml-1">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </span>
            </a>
          </div>
        </div>
      </section>
     
      
     
    </div>
  );
} 