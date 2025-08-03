"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useEffect, useState } from "react";
import { delay, motion } from "framer-motion";
import { FaEnvelope, FaRegSadTear, FaUserGraduate, FaUser, FaBook, FaRegLightbulb } from "react-icons/fa";
import { TextAnimate } from "@/components/magicui/text-animate";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BlurFade } from "@/components/magicui/blur-fade";
import { use3dTilt } from "@/hooks/use3dTilt";
import { useRouter } from 'next/navigation';

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


// Flat testimonial card grid section
function FlatTestimonials() {
  return (
    <section className="w-full flex flex-col items-center justify-center mb-24 relative">
      <div className="w-full max-w-4xl columns-1 sm:columns-2 lg:columns-3 gap-6">
        {reviews.map((review, idx) => (
          <BlurFade key={review.username} delay={0.1 * idx} inView>
            <div
              className="bg-[#f5f5f5] rounded-2xl flex flex-col p-6 mb-6 break-inside-avoid"
              style={{ background: "#f5f5f5" }}
            >
              {/* Header with Image, Name, and Role */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  className="rounded-full w-10 h-10 object-cover"
                  width="40"
                  height="40"
                  alt={review.name}
                  src={review.img}
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-neutral-800 leading-tight">
                    {review.name}
                  </span>
                  <span className="text-xs text-neutral-500">{review.role}</span>
                </div>
              </div>

              {/* Quote Body */}
              <blockquote className="text-sm text-neutral-700 leading-relaxed">
                “{review.body}”
              </blockquote>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}


// Add import for Image at the top if not already present
// import Image from "next/image";

// Add reviews data (copy from home page)
const reviews = [
  {
    name: "Ava Edwards",
    username: "@avaed",
    body: "ResDex gave me the confidence to explore opportunities beyond campus. Within a week, I was co-authoring a paper with a faculty mentor!",
    img: "https://i.pravatar.cc/150?img=26",
    role: "Computer Science, UofT"
  },
  {
    name: "Lucas Kim",
    username: "@lucaskim",
    body: "The built‑in profile matching in ResDex made connections easy. I landed my first research role without sending dozens of emails.",
    img: "https://i.pravatar.cc/150?img=12",
    role: "Biomedical Engineering, McMaster"
  },
  {
    name: "Adam Garcia",
    username: "@imadamg",
    body: "As someone new to research, I appreciated the transparency and guidance. I found a lab fit and got fast help when I needed it.",
    img: "https://i.pravatar.cc/150?img=57",
    role: "Health Sci, Laurier"
  },
  {
    name: "Mateo Alvarez",
    username: "@mateoa",
    body: "ResDex’s community helped me build connections that mattered. Joining a climate lab early led to a publication!",
    img: "https://i.pravatar.cc/150?img=68",
    role: "Environmental Studies, UOttawa"
  },
  {
    name: "Emily Chen",
    username: "@emchen",
    body: "The UX is polished and student-first. The powerful filters surfaced opportunities I would never have discovered otherwise.",
    img: "https://i.pravatar.cc/150?img=38",
    role: "Data Science, UofT"
  },
  {
    name: "Noah Williams",
    username: "@noahw",
    body: "I always felt my privacy was respected on ResDex. The platforms verified opportunity tags gave me peace of mind before applying, and I never felt pressured to share more than I was comfortable with. It felt like a safe space to showcase my achievements, explore roles that aligned with my goals, and connect with mentors who genuinely cared about student growth.",
    img: "https://i.pravatar.cc/150?img=55",
    role: "Comp Engineering, Laurier"
  },
  {
    name: "Sara Müller",
    username: "@saramuller",
    body: "I was able to stay organized through the messaging system. Now I co-moderate an AI research group I discovered here.",
    img: "https://i.pravatar.cc/150?img=36",
    role: "Cognitive Science, McMaster"
  },
  {
    name: "Omar Farouk",
    username: "@omarfarouk",
    body: "As a second-year student, I thought research was out of reach. ResDex made it accessible and shaped my academic path.",
    img: "https://i.pravatar.cc/150?img=56",
    role: "Life Sciences, UOttawa"
  },
  {
    name: "Julia Rossi",
    username: "@juliarossi",
    body: "From opportunity discovery to application prep, ResDex was everything I wish I had in first year.",
    img: "https://i.pravatar.cc/150?img=32",
    role: "Psychology, Laurier"
  },
];



// TestimonialCard component styled like the attached image
function TestimonialCard({ img, name, role, body }: { img: string; name: string; role: string; body: string }) {
  return (
    <div className="bg-[#f7f7f8] rounded-xl p-6 max-w-sm min-h-[220px] flex flex-col items-start justify-between" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
      <span className="text-4xl text-gray-200 mb-4 select-none">&ldquo;</span>
      <blockquote className="text-base text-gray-800 mb-6" style={{ fontFamily: 'GellixMedium, sans-serif' }}>{body}</blockquote>
      <div className="flex items-center gap-3 mt-auto w-full pt-2">
        <img src={img} alt={name} className="w-8 h-8 rounded-full object-cover mt-2" />
        <div className="flex flex-col mt-2">
          <span className="font-bold text-sm text-gray-900" style={{ fontFamily: 'GellixMedium, sans-serif' }}>{name}</span>
          <span className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'GellixMedium, sans-serif' }}>{role}</span>
        </div>
      </div>
    </div>
  );
}

// Testimonials section
function TestimonialsSection() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-32 bg-white">
      <h2 className="text-4xl md:text-6xl font-bold mb-20 text-center" style={{ fontFamily: 'GellixMedium, sans-serif', lineHeight: 1.15 }}>
        Used by 10,000+ businesses, creators,<br className="hidden md:block" />
        <span className="text-gray-400 font-bold">and other brands</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
        {reviews.slice(0, 9).map((review, idx) => (
          <TestimonialCard key={review.name + idx} {...review} />
        ))}
      </div>
    </section>
  );

  
}

export default function CanopyDemo() {
  // For background fade
  const productsRef = useRef<HTMLDivElement | null>(null);
  const [bgColor, setBgColor] = useState('#fff'); // initial white
  const tiltLogo = use3dTilt();

  useEffect(() => {
    const section = productsRef.current;
    if (!section) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setBgColor('#13141A');
        } else {
          setBgColor('#fff');
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const router = useRouter();
  
    const handleClick = () => {
    router.push('/waitlist');
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Navbar */}  
      <nav className="relative z-10 flex items-center py-6 px-8 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image src="/beige-logo.png" alt="ResDex Logo" width={32} height={32} />
          <span className="ml-1 text-xl font-semibold">ResDex</span>
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
          <button onClick={async () => {
    const pw = prompt("Enter developer password:");
    if (!pw) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        localStorage.setItem("devAccess", "true");
        alert("Access granted! Redirecting to signup page...");
        router.push("/signup");
      } else {
        alert("Incorrect password!");
      }
    } catch (err) {
      alert("Something went wrong.");
    }
  }} className="rounded-full p-2 hover:bg-gray-100 transition">

            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#23272A"/><path d="M8.5 15.5C8.5 15.5 9.5 16 12 16C14.5 16 15.5 15.5 15.5 15.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><ellipse cx="9.5" cy="12" rx="1" ry="1.5" fill="#fff"/><ellipse cx="14.5" cy="12" rx="1" ry="1.5" fill="#fff"/></svg>
          </button>
          <button  onClick={handleClick} className="rounded-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium transition" style={{ fontFamily: 'GellixMedium, sans-serif', cursor: 'pointer' }}>
            Join Waitlist ↗
          </button>
        </div>
      </nav>
     
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-100px)] flex-1 -mt-12" style={{ fontFamily: 'GellixMedium, sans-serif', minHeight: 'calc(100vh - 100px)' }}>
        {/* SVG Curved Streaks Background - now only in hero section */}
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
          <TextAnimate
            animation="fadeIn"
            by="line"
            as="h1"
            className="text-5xl md:text-7xl font-bold text-center leading-tight text-gray-900 mb-6 max-w-2xl mx-auto"
            style={{ fontFamily: 'Satoshi-Bold, sans-serif' }}
          >
            {`Rediscover the world of research.`}
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            by="line"
            as="p"
            className="mt-2 text-base md:text-lg text-gray-600 text-center max-w-xl mb-8 satoshi-medium"
          >
            The new way to explore, connect, and stay updated with the latest in research and academia.
          </TextAnimate>
          <motion.div
            className="flex gap-4 mt-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {},
            }}
          >
            <motion.a
              href="/waitlist"
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-none satoshi-medium"
              style={{ background: PRIMARY_BTN_BG, border: 'none' }}
              onMouseOver={e => e.currentTarget.style.background = '#23272F'}
              onMouseOut={e => e.currentTarget.style.background = PRIMARY_BTN_BG}
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
              }}
            >
              Join Waitlist
              <span className="ml-1">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </span>
            </motion.a>
            <motion.a
              href="#"
              className="flex items-center gap-2 bg-[#f7f7f9] text-[#101117] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#ececec] transition shadow-none satoshi-medium"
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
              }}
            >
              Explore ResDex
              <span className="ml-1">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </span>
            </motion.a>
          </motion.div>
        </div>
      </section>
      {/* Partnered Universities - straight line */}
      <motion.div
        className="relative w-full flex flex-col items-center justify-center -mt-16 mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {},
        }}
      >
        <motion.div
          className="mt-8 text-gray-500 text-sm"
          style={{ fontFamily: 'GellixMedium, sans-serif' }}
          variants={{
            hidden: { opacity: 0, y: 32 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
          }}
        >
          Trusted by students at
        </motion.div>
        <motion.div
          className="flex flex-row items-center justify-center gap-32 mt-6 w-full max-w-3xl mx-auto"
          variants={{
            hidden: { opacity: 0, y: 32 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
          }}
        >
          <motion.img src="/McMaster.png" alt="McMaster" className="w-20 h-20 object-contain" />
          <motion.img src="/TMU.png" alt="TMU" className="w-20 h-20 object-contain" />
          <motion.img src="/Laurier.png" alt="Laurier" className="w-20 h-20 object-contain" />
          <motion.img src="/UOFT.png" alt="UofT" className="w-20 h-20 object-contain" />
          <motion.img src="/UOttawa.png" alt="Ottawa" className="w-20 h-20 object-contain" />
        </motion.div>
      </motion.div>

      {/* Minimalist Hero Section (inspired by screenshot) */}
      <section className="w-full flex flex-col items-center justify-center py-32 bg-[#FAFAF8] relative overflow-hidden">
        {/* Maze SVG background */}
        <svg className="absolute left-[-15%] top-0 w-[70%] h-full z-0 pointer-events-none" width="70%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="maze-fade" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="80%" stopColor="white" stopOpacity="0.2" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="maze-mask">
              <rect x="0" y="0" width="800" height="400" fill="url(#maze-fade)" />
            </mask>
          </defs>
          <g opacity="0.07" mask="url(#maze-mask)">
            <path d="M 100 50 Q 200 100 100 150 Q 0 200 100 250 Q 200 300 100 350" stroke="#101117" strokeWidth="2" fill="none"/>
            <path d="M 300 50 Q 400 100 300 150 Q 200 200 300 250 Q 400 300 300 350" stroke="#101117" strokeWidth="2" fill="none"/>
            <path d="M 500 50 Q 600 100 500 150 Q 400 200 500 250 Q 600 300 500 350" stroke="#101117" strokeWidth="2" fill="none"/>
            <path d="M 700 50 Q 800 100 700 150 Q 600 200 700 250 Q 800 300 700 350" stroke="#101117" strokeWidth="2" fill="none"/>
            <circle cx="400" cy="200" r="120" stroke="#101117" strokeWidth="1.5" fill="none"/>
            <rect x="50" y="100" width="700" height="200" rx="100" stroke="#101117" strokeWidth="1" fill="none"/>
          </g>
        </svg>
        <div className="max-w-4xl w-full flex flex-col items-start justify-center px-4 mx-auto relative z-10">
          <BlurFade delay={0.1} inView>
            <span className="uppercase tracking-widest text-xs text-gray-400 mb-6 satoshi-medium">ResDex</span>
          </BlurFade>
          <BlurFade delay={0.15} inView>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2 satoshi-bold text-left">
              Finding research shouldn't feel like a <span className="satoshi-bold-italic">maze</span>.  <span className="text-5xl md:text-6xl font-bold text-gray-500 mb-8 satoshi-bold text-left">  Now it doesn't.</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <a
              href="#"
              className="flex items-center gap-2 bg-[#6B7280] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#52525b] transition shadow-none mt-12 satoshi-medium"
            >
              Explore ResDex
              <span className="ml-1">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </span>
            </a>
          </BlurFade>
        </div>
      </section>

  {/* Products Section (dark, horizontally scrollable cards) */}
  <section
        ref={productsRef}
        className="w-full min-h-[900px] flex flex-col items-start justify-start py-40 px-0 relative"
        style={{ background: bgColor, transition: 'background 0.4s linear' }}
      >
        <div className="w-full max-w-7xl mx-auto px-8">
          <BlurFade delay={0.1} inView>
            <div className="uppercase text-xs tracking-widest text-gray-400 mb-4 satoshi-medium">Discover, showcase, and collaborate on research — all in one place.</div>
          </BlurFade>
          <BlurFade delay={0.15} inView>
            <h2
              className="text-4xl md:text-5xl font-bold mb-16 satoshi-bold max-w-3xl leading-tight"
              style={{
                color: bgColor === '#13141A' ? '#fff' : '#181818',
                transition: 'color 0.4s linear',
              }}
            >
              A research-based platform built to scale past the classroom.
            </h2>
          </BlurFade>
        </div>
        <div className="w-full overflow-x-auto pb-8 px-32 custom-scrollbar">
          <div className="flex flex-row gap-8 min-w-[900px]" style={{ width: 'max-content' }}>
            {/* Card 1 */}
            <div className="bg-[#181922] rounded-2xl p-8 min-w-[350px] max-w-[400px] flex flex-col justify-between shadow-lg border border-[#23242c] relative" style={{ height: '320px' }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <FaUser size={22} color="#fff" />
                  <span className="text-xs tracking-widest text-gray-200 satoshi-medium">RESDEX PROFILES</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#23242c] flex items-center justify-center text-gray-300 hover:bg-[#23242c]/80 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <div className="text-2xl font-semibold text-white mb-2 satoshi-bold leading-snug">Build your research identity.</div>
                <div className="text-gray-400 text-sm mt-2 satoshi-medium">Create a professional research profile to showcase your work, papers, and projects. ResDex makes you discoverable by peers, mentors, and institutions.</div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-[#181922] rounded-2xl p-8 min-w-[350px] max-w-[400px] flex flex-col justify-between shadow-lg border border-[#23242c] relative" style={{ height: '320px' }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <FaBook size={22} color="#fff" />
                  <span className="text-xs tracking-widest text-gray-200 satoshi-medium">PROJECT HUB</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#23242c] flex items-center justify-center text-gray-300 hover:bg-[#23242c]/80 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <div className="text-2xl font-semibold text-white mb-2 satoshi-bold leading-snug">Connect and collaborate on projects.</div>
                <div className="text-gray-400 text-sm mt-2 satoshi-medium">Join or start research projects. ResDex helps you find collaborators, share updates, and manage academic work with your team.</div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-[#181922] rounded-2xl p-8 min-w-[350px] max-w-[400px] flex flex-col justify-between shadow-lg border border-[#23242c] relative" style={{ height: '320px' }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <FaRegLightbulb size={22} color="#fff" />
                  <span className="text-xs tracking-widest text-gray-200 satoshi-medium">INSIGHTS & OPPORTUNITIES</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#23242c] flex items-center justify-center text-gray-300 hover:bg-[#23242c]/80 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <div className="text-2xl font-semibold text-white mb-2 satoshi-bold leading-snug">Surface the opportunities that matter.</div>
                <div className="text-gray-400 text-sm mt-2 satoshi-medium">Get matched with labs, supervisors, and open calls for papers. ResDex curates recommendations based on your interests and activity.</div>
              </div>
            </div>
           {/* Card 4 */}
<div className="bg-[#181922] rounded-2xl p-8 min-w-[350px] max-w-[400px] flex flex-col justify-between shadow-lg border border-[#23242c] relative" style={{ height: '320px' }}>
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" />
        <polyline points="7 10 12 13 17 10" />
        <rect x="7" y="18" width="2" height="2" />
        <rect x="15" y="18" width="2" height="2" />
      </svg>
      <span className="text-xs tracking-widest text-gray-300 satoshi-medium">KEYNOTE SESSIONS</span>
    </div>
    <button className="w-8 h-8 rounded-full bg-[#23242c] flex items-center justify-center text-gray-300 hover:bg-[#23242c]/80 transition">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </button>
  </div>
  <div className="flex-1 flex flex-col justify-end">
    <div className="text-2xl font-semibold text-white mb-2 satoshi-bold leading-snug">Join us for live keynote sessions.</div>
    <div className="text-gray-400 text-sm mt-2 satoshi-medium">Hear directly from the ResDex team at conferences, student showcases, and AMAs. We talk about research, student success, and what’s next in academia.</div>
  </div>
</div>

            {/* Card 5 */}
<div className="bg-[#181922] rounded-2xl p-8 min-w-[350px] max-w-[400px] flex flex-col justify-between shadow-lg border border-[#23242c] relative" style={{ height: '320px' }}>
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
      <span className="text-xs tracking-widest text-gray-300 satoshi-medium">MENTOR MATCH</span>
    </div>
    <button className="w-8 h-8 rounded-full bg-[#23242c] flex items-center justify-center text-gray-300 hover:bg-[#23242c]/80 transition">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
    </button>
  </div>
  <div className="flex-1 flex flex-col justify-end">
    <div className="text-2xl font-semibold text-white mb-2 satoshi-bold leading-snug">Find the right mentor for you.</div>
    <div className="text-gray-400 text-sm mt-2 satoshi-medium">Use our intelligent match system to connect with faculty, researchers, and peers aligned with your interests and goals.</div>
  </div>
</div>

            {/* Card 6 */}
<div className="bg-[#181922] rounded-2xl p-8 min-w-[350px] max-w-[400px] flex flex-col justify-between shadow-lg border border-[#23242c] relative" style={{ height: '320px' }}>
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
      <span className="text-xs tracking-widest text-gray-300 satoshi-medium">RESEARCH EVENTS</span>
    </div>
    <button className="w-8 h-8 rounded-full bg-[#23242c] flex items-center justify-center text-gray-300 hover:bg-[#23242c]/80 transition">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
    </button>
  </div>
  <div className="flex-1 flex flex-col justify-end">
    <div className="text-2xl font-semibold text-white mb-2 satoshi-bold leading-snug">Stay updated with research events.</div>
    <div className="text-gray-400 text-sm mt-2 satoshi-medium">Discover conferences, calls for papers, funding deadlines, and workshops; all personalized to your academic interests.</div>
  </div>
</div>

          </div>
        </div>
      </section>



      {/* Flows Section (inspired by attached image) */}
      <section className="w-full flex flex-col items-center justify-center py-24 bg-white">
        <BlurFade delay={0.1} inView>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 satoshi-bold">
            Modernizing research <br></br> one step at a time.
          </h2>
        </BlurFade>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mx-auto justify-center">
          {/* Card 1 */}
          <div className="flex-1 bg-[#F5F5F5] rounded-2xl flex flex-col items-center p-8 min-w-[320px]">
            <div className="w-[220px] h-[400px] bg-black rounded-xl flex items-center justify-center mb-8 overflow-hidden">
              <video
          src="https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/sign/video/video-shortform.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lM2U5NzhjNy0wODE4LTRmNjItOTA3Mi0wYTMyYzJjMzA5NGEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby92aWRlby1zaG9ydGZvcm0ubXA0IiwiaWF0IjoxNzUzMzc1ODU3LCJleHAiOjE5MTEwNTU4NTd9.r5SSLsi8tszAkq0VM2YDW8tr7tEhZINzvg0eRjwG4y0"
          width={220}
          height={400}
          className="w-[220px] h-[400px] object-cover rounded-xl"
          autoPlay
          loop
          muted
          playsInline
          style={{ background: 'black' }}
              />
            </div>
            <div className="w-full">
              <div className="text-lg font-bold satoshi-bold mb-2">Short-Form</div>
              <div className="text-gray-500 text-base satoshi-medium">
We know you love scrolling, so we made it easy to share and discover research videos. From short-form clips to in-depth lectures, ResDex has you covered.
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="flex-1 bg-[#F5F5F5] rounded-2xl flex flex-col items-center p-8 min-w-[320px]">
            <div className="w-[220px] h-[400px] bg-black rounded-xl flex items-center justify-center mb-8 overflow-hidden">
              <video
          src="https://mhnughbveavfihztvfvb.supabase.co/storage/v1/object/sign/video/topics.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lM2U5NzhjNy0wODE4LTRmNjItOTA3Mi0wYTMyYzJjMzA5NGEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlby90b3BpY3MubXA0IiwiaWF0IjoxNzUzNTYxMTM5LCJleHAiOjE4NDgxNjkxMzl9.MW_8tJJ3VBf4iYV0NwjODJhFfSIMwI9CceAg0NVqigk"
          width={220}
          height={400}
          className="w-[220px] h-[400px] object-cover rounded-xl"
          autoPlay
          loop
          muted
          playsInline
          style={{ background: 'black' }}
              />
            </div>
            <div className="w-full">
              <div className="text-lg font-bold satoshi-bold mb-2">Personalization</div>
              <div className="text-gray-500 text-base satoshi-medium">
No more noise. Customize your ResDex experience to see the topics, researchers, and projects that matter most to you. Discover content tailored to your interests.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (inspired by attached image) */}
      <section className="w-full flex flex-col items-center justify-center py-20 bg-white">
         <BlurFade delay={0.1} inView>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 satoshi-bold">
            Let the numbers<br></br>do the talking.
          </h2>
        </BlurFade>
        <BlurFade delay={0.1} inView>
          <div className="flex flex-col md:flex-row gap-12 w-full max-w-6xl mx-auto justify-center items-start md:items-stretch">
            {/* Stat 1 */}
            <div className="flex-1 flex flex-col items-start text-left px-4">
              <span className="inline-flex items-center px-4 py-2 mb-6 rounded-lg bg-[#f5f5f5] text-[#181818] font-semibold satoshi-medium text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="#181818" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8zm0 0v4m0 4h.01"/></svg>
                Researchers
              </span>
              <div className="relative flex items-baseline mb-2 mt-2">
                <span className="text-7xl font-medium gellix-medium leading-none"> 8.<NumberTicker value={9} startValue={0} />M</span>
                <span className="absolute right-[-1.5rem] top-0 text-lg font-bold satoshi-bold text-gray-500">+</span>
              </div>
              <div className="text-gray-500 text-base satoshi-medium">Researchers worldwide that ResDex can impact positively.</div>
            </div>
            {/* Stat 2 */}
            <div className="flex-1 flex flex-col items-start text-left px-15 border-l border-r border-gray-200">
              <span className="inline-flex items-center px-4 py-2 mb-6 rounded-lg bg-[#f5f5f5] text-[#181818] font-semibold satoshi-medium text-sm">
<svg className="w-4 h-4 mr-2" fill="none" stroke="#181818" strokeWidth="2" viewBox="0 0 24 24">
  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
  <polyline points="22,6 12,13 2,6" />
</svg>
                Emails
              </span>
              <div className="relative flex items-baseline mb-2 mt-2">
                <span className="text-7xl font-medium gellix-medium leading-none"> <NumberTicker value={99} startValue={50} />%</span>
                {/* <span className="absolute right-[-1.5rem] top-0 text-lg font-bold satoshi-bold text-gray-500">+</span> */}
              </div>
              <div className="text-gray-500 text-base satoshi-medium">Of cold-emails go unnoticed or straight to spam.</div>
            </div>
            {/* Stat 3 */}
            <div className="flex-1 flex flex-col items-start text-left px-4">
              <span className="inline-flex items-center px-4 py-2 mb-6 rounded-lg bg-[#f5f5f5] text-[#181818] font-semibold satoshi-medium text-sm">
<svg className="w-4 h-4 mr-2" fill="none" stroke="#181818" strokeWidth="2" viewBox="0 0 24 24">
  <path d="M3 17l5-5 4 4 7-7" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M16 7h4v4" strokeLinecap="round" strokeLinejoin="round" />
</svg>
                Responses
              </span>
              <div className="relative flex items-baseline mb-2 mt-2">
                <span className="text-7xl font-medium gellix-medium leading-none"> <NumberTicker value={300} startValue={150} /></span>
                <span className="absolute right-[-2.9rem] bottom-0 text-lg text-gray-500">times</span>
              </div>
              <div className="text-gray-500 text-base satoshi-medium">More likely to get responses when contacted via verified profiles.</div>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Testimonials Section */}
      <BlurFade delay={0.1} inView style={{ marginTop: '10rem' }}>
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 satoshi-bold mt-20">Why we love<br></br> doing what we do.</h2>
      </BlurFade>
        <FlatTestimonials />


        

     
      
      {/* Modern Rounded Rectangle Section */}
      <section className="w-full flex flex-col items-center justify-center py-24 bg-transparent">
        <BlurFade delay={0.1} inView>
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
              <BlurFade delay={0.1} inView>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 satoshi-bold" style={{ color: '#fff' }}>
                  We're building the biggest research hub in the world.<br />
                  <span className="text-[#f5f5f5]">and you're in the center of it.</span>
                </h2>
              </BlurFade>
              <BlurFade delay={0.15} inView>
                <p className="text-gray-300 text-md max-w-xl mb-8 mt-8 satoshi-medium">
                  Purpose built for students and researchers, our modern platform lets you discover, connect, and grow your academic impact with ease.
                </p>
              </BlurFade>
              <BlurFade delay={0.2} inView>
                <a
                  href="/waitlist"
                  className="inline-flex items-center gap-1 bg-[#f5f5f5] text-[#101117] px-6 py-3 rounded-xl text-base hover:bg-[#c7c7c7] transition shadow-none"
                  style={{ fontFamily: 'GellixMedium, sans-serif' }}
                >
                  Get Started
                  <span className="ml-1">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                  </span>
                </a>
              </BlurFade>
            </div>
          </div>
        </BlurFade>
      </section>
     

      
    </div>
  );
} 