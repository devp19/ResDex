"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Navbar, NavBody, NavbarLogo, NavItems } from "@/components/ui/navbar";
import { Input } from "@/components/ui/input";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
// @ts-ignore
import ColorThief from "colorthief";
import { Briefcase, Tag, Search as SearchIcon, TrendingUp, Sparkles } from "lucide-react";
import { ChartCard } from "@/components/ChartCard";
import { Tabs } from "@/components/ui/tabs";
import CardPost from "@/components/customized/card/card-06";
import PaginationWithSecondaryButton from "@/components/customized/pagination/pagination-03";
import BlogCard from "@/components/customized/card/blog-card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ProfileStatsCard } from "@/components/ui/ProfileStatsCard";
import { ProfileOrgInterestsCard } from "@/components/ui/ProfileOrgInterestsCard";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Network", link: "/network" },
  { name: "Jobs", link: "/jobs" },
  { name: "Messaging", link: "/messaging" },
];

// Responsive hook for small screens
function useIsSmallScreen() {
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isSmall;
}

export default function ProfilePage() {
  const [subscribed, setSubscribed] = useState(false);
  const [gradient, setGradient] = useState("linear-gradient(to right, #fbe6b2, #f6b47b)");
  const imgRef = useRef<HTMLImageElement>(null);
  const profileImgSrc = "/jess-avatar.jpeg";

  // Posts data and pagination state
  const [page, setPage] = useState(1);
  const posts = [
    <CardPost
      key={0}
      avatar="/jess-avatar.jpeg"
      name="Cathie Woods"
      username="@cathiewoods"
      title="AI in Healthcare"
      content="Our latest research explores how machine learning models can predict patient outcomes and personalize treatment plans. #AI #Healthcare #Research"
      hashtags={["#AI", "#Healthcare", "#Research"]}
    />,
    <CardPost
      key={1}
      avatar="/jess-avatar.jpeg"
      name="Cathie Woods"
      username="@cathiewoods"
      title="Quantum Computing Breakthrough"
      content="We achieved a new milestone in quantum error correction, paving the way for more reliable quantum computers. #QuantumComputing #Innovation"
      hashtags={["#QuantumComputing", "#Innovation"]}
    />,
    <CardPost
      key={2}
      avatar="/jess-avatar.jpeg"
      name="Cathie Woods"
      username="@cathiewoods"
      title="Renewable Energy Storage"
      content="Our team developed a new battery technology that increases storage capacity for solar and wind energy. #Renewables #EnergyStorage"
      hashtags={["#Renewables", "#EnergyStorage"]}
    />,
    <CardPost
      key={3}
      avatar="/jess-avatar.jpeg"
      name="Cathie Woods"
      username="@cathiewoods"
      title="Blockchain for Scientific Data Integrity"
      content="Exploring how blockchain technology can ensure the integrity and reproducibility of scientific research data. #Blockchain #Science #DataIntegrity"
      hashtags={["#Blockchain", "#Science", "#DataIntegrity"]}
    />,
    <CardPost
      key={4}
      avatar="/jess-avatar.jpeg"
      name="Cathie Woods"
      username="@cathiewoods"
      title="CRISPR and the Future of Gene Editing"
      content="A review of recent advances in CRISPR technology and its implications for medicine and agriculture. #CRISPR #GeneEditing #Biotech"
      hashtags={["#CRISPR", "#GeneEditing", "#Biotech"]}
    />,
    <CardPost
      key={5}
      avatar="/jess-avatar.jpeg"
      name="Cathie Woods"
      username="@cathiewoods"
      title="Climate Modeling with AI"
      content="How artificial intelligence is improving the accuracy of climate models and predictions. #ClimateChange #AI #Modeling"
      hashtags={["#ClimateChange", "#AI", "#Modeling"]}
    />
  ];
  const isSmallScreen = useIsSmallScreen();
  const postsPerPage = isSmallScreen ? 1 : 2;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;

  const postsTabContent = (
    <div className="w-full h-full p-4 text-lg">
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#2a2a2a' }}>Research Papers</h2>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {posts.slice(start, end)}
      </div>
      <div className="flex justify-center">
        <PaginationWithSecondaryButton
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );

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
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col items-center py-8 mx-4 sm:mx-4 lg:mx-auto">
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
      {/* Profile Stats Card + Org/Interests Card */}
      <div className="w-full flex justify-center mt-8 mb-8 gap-6">
        <ProfileStatsCard followers={123} following={45} contributions={19} />
        <ProfileOrgInterestsCard organization="Google" interests={["Automation", "AI", "Finance", "Web Development"]} />
      </div>
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 mt-8">
        {/* Main Column: Profile Card + Posts */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Main Profile Card */}
          <div className="w-full bg-white rounded-xl overflow-hidden flex flex-col border border-gray-200" style={{ minHeight: 420 }}>
            {/* Banner */}
            <div
              className="w-full h-40 rounded-t-xl"
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
                  <div className="text-3xl font-bold text-neutral-800 flex-1 flex items-center gap-2">
                    Cathie Woods
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center">
                          <Image src="/beige-logo.png" alt="ResDex Staff" width={24} height={24} className="ml-1 rounded-md" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>ResDex Team Member</TooltipContent>
                    </Tooltip>
                  </div>
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
                {/* Stats row replaced with ProfileStatsCard */}
                <div className="w-full flex justify-center mb-6">
                  <ProfileStatsCard followers={6476} following={0} contributions={500} />
                  <ProfileOrgInterestsCard organization="Google" interests={["Automation", "AI", "Finance", "Web Development"]} className="ml-6" />
                </div>
              </div>
            </div>
          </div>
          {/* Posts Section Placeholder */}
          <div className="bg-white rounded-xl min-h-[800px] flex flex-col p-6 w-full overflow-x-auto border border-gray-200">
            <Tabs
              tabs={[
                {
                  title: "Research",
                  value: "posts",
                  content: postsTabContent,
                },
                {
                  title: "Blogs",
                  value: "blogs",
                  content: (
                    <div className="w-full h-full p-4 text-lg">
                      <h2 className="text-2xl font-bold mb-4" style={{ color: '#2a2a2a' }}>Blogs</h2>
                      <div className="relative">
                        <div className="max-h-[600px] overflow-y-auto pr-2">
                          <BlogCard
                            avatar="/jess-avatar.jpeg"
                            title="The Future of AI in Everyday Life"
                            excerpt="Exploring how artificial intelligence is shaping our daily routines, from smart assistants to personalized recommendations."
                            author="Cathie Woods"
                            date="May 2024"
                            link="https://example.com/ai-in-everyday-life"
                          />
                          <BlogCard
                            avatar="/jess-avatar.jpeg"
                            title="5 Breakthroughs in Renewable Energy"
                            excerpt="A look at the most exciting advancements in solar, wind, and battery technology this year."
                            author="Cathie Woods"
                            date="April 2024"
                            link="https://example.com/renewable-energy-breakthroughs"
                          />
                          <BlogCard
                            avatar="/jess-avatar.jpeg"
                            title="How Quantum Computing Will Change Research"
                            excerpt="Quantum computers are set to revolutionize data analysis and scientific discovery. Here's what you need to know."
                            author="Cathie Woods"
                            date="March 2024"
                            link="https://example.com/quantum-computing-research"
                          />
                          <BlogCard
                            avatar="/jess-avatar.jpeg"
                            title="The Ethics of AI: What Researchers Need to Know"
                            excerpt="A discussion on the ethical considerations and responsibilities of AI researchers in 2024."
                            author="Cathie Woods"
                            date="February 2024"
                            link="https://example.com/ethics-of-ai"
                          />
                          <BlogCard
                            avatar="/jess-avatar.jpeg"
                            title="Data Visualization Best Practices for Scientists"
                            excerpt="Tips and tools for creating clear, impactful data visualizations in scientific publications."
                            author="Cathie Woods"
                            date="January 2024"
                            link="https://example.com/data-visualization"
                          />
                          <BlogCard
                            avatar="/jess-avatar.jpeg"
                            title="Open Science: Sharing Research for Greater Impact"
                            excerpt="How open access and data sharing are transforming the research landscape."
                            author="Cathie Woods"
                            date="December 2023"
                            link="https://example.com/open-science"
                          />
                        </div>
                        {/* Fade-out effect at the bottom */}
                        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent" />
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Certifications",
                  value: "certifications",
                  content: (
                    <div className="w-full h-full p-4 text-lg">
                      <h2 className="text-2xl font-bold mb-4" style={{ color: '#2a2a2a' }}>Certifications</h2>
                      <p className="text-gray-700">No certifications yet.</p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
        {/* Sidebar: People Also Viewed */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 min-h-[300px] flex flex-col border border-gray-200">
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
          <div className="bg-white rounded-xl p-6 mt-2 border border-gray-200">
            <div className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              Matched opportunities
              <Briefcase className="w-5 h-5 text-gray-300" />
            </div>
            <ul className="flex flex-col gap-4">
              <li className="flex flex-col">
                <span className="font-medium text-gray-800">Research Assistant - AI in Healthcare</span>
                <span className="text-xs text-gray-500">Dr. Emily Zhang, Stanford AI Lab</span>
                <span className="text-sm text-gray-600 mt-5">Work on predictive models for patient outcomes using real-world hospital data.</span>
                <button className="rounded-full bg-gray-100 text-gray-700 px-4 py-2 text-xs font-semibold hover:bg-gray-200 transition whitespace-nowrap mt-3">Explore</button>
              </li>
              <div className="h-px bg-gray-200 my-2 w-full" />
              <li className="flex flex-col">
                <span className="font-medium text-gray-800">Data Science Intern - Renewable Energy</span>
                <span className="text-xs text-gray-500">Prof. Michael Lee, MIT Energy Initiative</span>
                <span className="text-sm text-gray-600 mt-5">Analyze and visualize large-scale energy grid data to optimize renewable integration.</span>
                <button className="rounded-full bg-gray-100 text-gray-700 px-4 py-2 text-xs font-semibold hover:bg-gray-200 transition whitespace-nowrap mt-3">Explore</button>
              </li>
              <div className="h-px bg-gray-200 my-2 w-full" />
              <li className="flex flex-col">
                <span className="font-medium text-gray-800">Lab Assistant - Genomics & CRISPR</span>
                <span className="text-xs text-gray-500">Dr. Priya Nair, Broad Institute</span>
                <span className="text-sm text-gray-600 mt-5">Support gene editing experiments and data analysis in a leading genomics lab.</span>
                <button className="rounded-full bg-gray-100 text-gray-700 px-4 py-2 text-xs font-semibold hover:bg-gray-200 transition whitespace-nowrap mt-3">Explore</button>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 mt-2 border border-gray-200">
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