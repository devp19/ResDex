"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Navbar, NavBody, NavbarLogo, NavItems, NotificationBadge, MessageBadge } from "@/components/ui/navbar";
import { Input } from "@/components/ui/input";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
// @ts-ignore
import ColorThief from "colorthief";
import { Building, Tag, Search as SearchIcon, TrendingUp, Sparkles, ChevronDown, Check, Pencil, MessageCircleIcon } from "lucide-react";
import { ChartCard } from "@/components/ChartCard";
import { Tabs } from "@/components/ui/tabs";
import CardPost from "@/components/customized/card/card-06";
import PaginationWithSecondaryButton from "@/components/customized/pagination/pagination-03";
import BlogCard from "@/components/customized/card/blog-card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AvatarDropdown } from "@/components/ui/AvatarDropdown";
import { FollowButton } from "@/components/ui/FollowButton";
import { ProfileStatsCard } from "@/components/ui/ProfileStatsCard";
import { ProfileOrgInterestsCard } from "@/components/ui/ProfileOrgInterestsCard";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Network", link: "/network" },
  { name: "Jobs", link: "/jobs" },
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

// List of available interests
const INTEREST_OPTIONS = [
  "Automation",
  "AI",
  "Finance",
  "Web Development",
  "Healthcare",
  "Education",
  "Design",
  "Research",
  "Data Science",
  "Blockchain",
  "Biotech",
  "Climate",
  "Product Management",
  "Cloud Computing",
  "Marketing",
  "Energy",
];

export default function ProfilePage() {
  const params = useParams();
  const usernameParam = params.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [gradient, setGradient] = useState("linear-gradient(to right, #fbe6b2, #f6b47b)");
  const imgRef = useRef<HTMLImageElement>(null);
  const profileImgSrc = "/jess-avatar.jpeg";
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [aboutDraft, setAboutDraft] = useState("");
  const [locationDraft, setLocationDraft] = useState("");
  const [interestsDraft, setInterestsDraft] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [interestSearch, setInterestSearch] = useState("");
  const [myProfile, setMyProfile] = useState<any>(null);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [organizationDraft, setOrganizationDraft] = useState("");

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

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", usernameParam)
        .single();
      if (error || !data) {
        setNotFound(true);
        setProfile(null);
        setFollowingCount(0);
      } else {
        setProfile(data);
        // Fetch following count for this user
        const { count, error: followingError } = await supabase
          .from("followers")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", data.id)
          .eq("status", "accepted");
        setFollowingCount(followingError ? 0 : (count || 0));
      }
      setLoading(false);
    }
    if (usernameParam) fetchProfile();
  }, [usernameParam]);

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

  // Helper: is this my profile?
  const isOwnProfile = currentUser && profile && currentUser.user_metadata?.username === profile.username;

  // When opening edit modal, prefill interests
  useEffect(() => {
    if (editOpen && profile) {
      setInterestsDraft(Array.isArray(profile.interests) ? profile.interests : []);
      setOrganizationDraft(profile.organization || "");
    }
  }, [editOpen, profile]);

  // Edit handler
  const handleEditAbout = async () => {
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    const { error } = await supabase
      .from("profiles")
      .update({ bio: aboutDraft, location: locationDraft, interests: interestsDraft, organization: organizationDraft })
      .eq("id", profile.id);
    if (error) {
      setEditError(error.message || "Failed to update profile.");
    } else {
      setEditSuccess("Profile updated!");
      setProfile({ ...profile, bio: aboutDraft, location: locationDraft, interests: interestsDraft, organization: organizationDraft });
      setEditOpen(false);
    }
    setEditLoading(false);
  };

  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signoutConfirmed, setSignoutConfirmed] = useState(false);
  const avatarUrl = profile?.avatar_url || currentUser?.user_metadata?.avatar_url || "/empty-pic.webp";

  // Sign out handler
  const handleSignOut = async () => {
    setSigningOut(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      setSigningOut(false);
      setDropdownOpen(false);
      setConfirmSignOut(false);
      router.push("/");
    }, 900);
  };

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

  // Fetch the logged-in user's profile (by id) when currentUser changes
  useEffect(() => {
    if (currentUser) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single()
        .then(({ data }) => setMyProfile(data));
    } else {
      setMyProfile(null);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f5f6fa]">
        <LoadingSpinner />
      </div>
    );
  }
  if (notFound) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f5f6fa]">
        <div className="text-2xl font-bold text-neutral-700">User not found</div>
      </div>
    );
  }

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
            <MessageBadge />
            <NotificationBadge />
            {/* Avatar/Login button */}
            <div className="relative ml-4 flex items-center gap-2">
              {currentUser ? (
                <AvatarDropdown
                  userProfile={myProfile}
                  displayName={myProfile?.display_name || myProfile?.full_name || myProfile?.username || currentUser.email}
                  username={myProfile?.username || currentUser.email?.split("@")[0]}
                  avatarUrl={myProfile?.avatar_url || "/empty-pic.webp"}
                  onSignOut={handleSignOut}
                />
              ) : (
                <button
                  className="px-6 py-2 rounded-full bg-[#2a2a2a] text-white text-sm font-bold hover:bg-[#444] transition"
                  onClick={() => router.push("/login")}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </NavBody>
      </Navbar>
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 mt-8">
        {/* Main Column: Profile Card + Posts */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Main Profile Card */}
          <div className="w-full bg-white rounded-xl overflow-hidden flex flex-col border border-gray-200" style={{ minHeight: 420 }}>
            {/* Banner */}
            <div className="p-4">
              <div
                className="w-full h-40 rounded-xl"
                style={{ background: gradient }}
              />
            </div>
            {/* Avatar - left-aligned and overlapping banner & info */}
            <div className="relative w-full">
              <div className="absolute -top-20 left-10 z-10">
                <div className={`w-36 h-36 ${((profile?.username || '').toLowerCase() === 'resdex') ? 'rounded-xl' : 'rounded-full'} border-8 border-white overflow-hidden bg-gray-300`}>
                  <Image
                    src={profile.avatar_url}
                    alt="Profile Avatar"
                    width={144}
                    height={144}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                  {/* Hidden img for color extraction */}
                  <img
                    ref={imgRef}
                    src={profile?.avatar_url || "/empty-pic.webp"}
                    alt="Profile Avatar Color Extract"
                    crossOrigin="anonymous"
                    style={{ display: "none" }}
                    onLoad={extractColors}
                  />
                </div>
              </div>
              {/* Info Section - left-aligned below avatar */}
              <div className="flex flex-col items-start w-full mt-16 ml-12 pr-25 pb-8">
                {/* Name and Follow/Edit button row */}
                <div className="flex w-full items-center mb-2">
                  <div className="text-3xl font-bold text-neutral-800 flex-1 flex items-center gap-2">
                    <span className="flex items-center">
                      <span>
                        {profile?.display_name || profile?.full_name || profile?.username}
                      </span>
                      {isOwnProfile && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-1 rounded-full hover:bg-zinc-100 transition flex items-center ml-2 justify-center cursor-pointer group"
                              style={{ color: '#2a2a2a' }}
                              onClick={() => {
                                setAboutDraft(profile.bio || "");
                                setLocationDraft(profile.location || "");
                                setEditOpen(true);
                              }}
                              aria-label="Edit Profile"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Edit Profile</TooltipContent>
                        </Tooltip>
                      )}
                      {['dev','tirth','deep','bhavi','kush','jay','aaryan','darsh','fenil','resdex'].includes((profile?.username || '').toLowerCase()) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center">
                              <Image src="/beige-logo.png" alt="ResDex Staff" width={24} height={24} className="ml-1 rounded-md" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>ResDex Team Member</TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                  </div>
                  {/* Show Follow button only if not own profile and user is authenticated */}
                  {currentUser && !isOwnProfile && profile?.id && (
                    <>
                      <FollowButton userId={profile.id} />
                      <button
                        className="ml-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center gap-2 cursor-pointer"
                        title="Message"
                        onClick={() => router.push(`/messages?user=${profile.username}`)}
                        aria-label="Message"
                        type="button"
                      >
                        <span className="font-semibold text-[#2a2a2a]">Message</span>
                        <MessageCircleIcon className="w-6 h-6" style={{ color: '#2a2a2a' }} />
                      </button>
                    </>
                  )}
                </div>
                {/* Bio/Title (dynamic) */}
                <div className="text-lg text-neutral-600 mb-1">
                  {profile?.bio
                    ? (profile.bio.length > 90 ? profile.bio.slice(0, 90) + '…' : profile.bio)
                    : (isOwnProfile ? <span className="italic text-neutral-400">Add your title or bio</span> : <span className="italic text-neutral-400"></span>)}
                </div>
                {/* Location */}
                <div className="text-md text-neutral-400 mb-4">
                  {profile?.location ? profile.location : (isOwnProfile ? <span className="italic text-neutral-400">Add your location</span> : <span className="italic text-neutral-400"></span>)}
                </div>
                {/* Stats row replaced with ProfileStatsCard */}
                <div className="w-full flex mb-6 gap-6">
                  <ProfileStatsCard
                    followers={profile?.followers_count || 0}
                    following={followingCount}
                    contributions={profile?.contribution_count || 0}
                    noShadow
                    className="!mx-0"
                    disableTilt={true}
                  />
                  <ProfileOrgInterestsCard
                    organization={profile?.organization || "Google"}
                    interests={profile?.interests || []}
                    disableTilt={true}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Posts Section Placeholder (Replace with actual posts) */}
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
                            avatar={profile?.avatar_url || "/empty-pic.webp"}
                            title="The Future of AI in Everyday Life"
                            excerpt="Exploring how artificial intelligence is shaping our daily routines, from smart assistants to personalized recommendations."
                            author={profile?.display_name || profile?.full_name || profile?.username || ""}
                            date="May 2024"
                            link="https://example.com/ai-in-everyday-life"
                          />
                          <BlogCard
                            avatar={profile?.avatar_url || "/empty-pic.webp"}
                            title="5 Breakthroughs in Renewable Energy"
                            excerpt="A look at the most exciting advancements in solar, wind, and battery technology this year."
                            author={profile?.display_name || profile?.full_name || profile?.username || ""}
                            date="April 2024"
                            link="https://example.com/renewable-energy-breakthroughs"
                          />
                          <BlogCard
                            avatar={profile?.avatar_url || "/empty-pic.webp"}
                            title="How Quantum Computing Will Change Research"
                            excerpt="Quantum computers are set to revolutionize data analysis and scientific discovery. Here's what you need to know."
                            author={profile?.display_name || profile?.full_name || profile?.username || ""}
                            date="March 2024"
                            link="https://example.com/quantum-computing-research"
                          />
                          <BlogCard
                            avatar={profile?.avatar_url || "/empty-pic.webp"}
                            title="The Ethics of AI: What Researchers Need to Know"
                            excerpt="A discussion on the ethical considerations and responsibilities of AI researchers in 2024."
                            author={profile?.display_name || profile?.full_name || profile?.username || ""}
                            date="February 2024"
                            link="https://example.com/ethics-of-ai"
                          />
                          <BlogCard
                            avatar={profile?.avatar_url || "/empty-pic.webp"}
                            title="Data Visualization Best Practices for Scientists"
                            excerpt="Tips and tools for creating clear, impactful data visualizations in scientific publications."
                            author={profile?.display_name || profile?.full_name || profile?.username || ""}
                            date="January 2024"
                            link="https://example.com/data-visualization"
                          />
                          <BlogCard
                            avatar={profile?.avatar_url || "/empty-pic.webp"}
                            title="Open Science: Sharing Research for Greater Impact"
                            excerpt="How open access and data sharing are transforming the research landscape."
                            author={profile?.display_name || profile?.full_name || profile?.username || ""}
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
          {/* Edit Bio Modal */}
          <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
            <AlertDialogContent
              style={{ maxHeight: 620, minWidth: 360, overflowY: 'auto' }}
              className="!p-6"
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Profile</AlertDialogTitle>
              </AlertDialogHeader>
              <label className="block text-sm font-medium text-neutral-700 mb-1 mt-1">About</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-base min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#2a2a2a]"
                value={aboutDraft}
                onChange={e => {
                  if (e.target.value.length <= 90) setAboutDraft(e.target.value);
                }}
                maxLength={90}
                rows={2}
                placeholder="e.g. Chief Technology Officer at Google"
              />
              <div className="text-right text-xs text-neutral-400">{aboutDraft.length}/90</div>
              <label className="block text-sm font-medium text-neutral-700">Location</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2a2a2a]"
                value={locationDraft}
                onChange={e => setLocationDraft(e.target.value)}
                maxLength={60}
                placeholder="e.g. Toronto, Ontario"
                type="text"
              />
              <label className="block text-sm font-medium text-neutral-700 mb-1 mt-2">Interests (max 3)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 text-base mb-2 focus:outline-none focus:ring-2 focus:ring-[#2a2a2a]"
                placeholder={interestsDraft.length >= 3 ? "3/3 Selected! Remove to replace." : "Type to search interests..."}
                value={interestSearch}
                onChange={e => setInterestSearch(e.target.value)}
                disabled={interestsDraft.length >= 3}
              />
              <div className="flex gap-2 mb-2 min-h-[36px]">
                {interestsDraft.length === 0 ? (
                  <span className="italic text-neutral-400 text-sm">No interests selected...</span>
                ) : (
                  interestsDraft.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      className="px-4 py-2 rounded-full bg-[#2a2a2a] text-white text-sm font-medium flex items-center gap-1 hover:bg-[#444] transition group"
                      onClick={() => setInterestsDraft(interestsDraft.filter(i => i !== interest))}
                      title="Remove"
                    >
                      {interest}
                      <span className="ml-1 text-xs text-white/80 group-hover:text-red-300">×</span>
                    </button>
                  ))
                )}
              </div>
              {(() => {
                const search = interestSearch.trim().toLowerCase();
                const notSelected = INTEREST_OPTIONS.filter(opt => !interestsDraft.includes(opt));
                const matches = search
                  ? notSelected.filter(opt => opt.toLowerCase().includes(search))
                  : [];
                const rest = notSelected.filter(opt => !matches.includes(opt));
                const display = [...matches, ...rest];
                return (
                  <div
                    className="flex flex-wrap gap-2 mb-2 border border-gray-200 rounded-lg bg-gray-50 p-3"
                    style={{ maxHeight: 200, overflowY: 'auto', minHeight: 40 }}
                  >
                    {display.map(option => {
                      const selected = interestsDraft.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          className={
                            `px-4 py-2 rounded-full border text-sm font-medium transition ` +
                            (selected
                              ? 'bg-[#2a2a2a] text-white border-[#2a2a2a] shadow'
                              : 'bg-white text-[#2a2a2a] border-gray-300 hover:bg-gray-100')
                          }
                          disabled={selected || interestsDraft.length >= 3}
                          onClick={() => {
                            if (!selected && interestsDraft.length < 3) {
                              setInterestsDraft([...interestsDraft, option]);
                              setInterestSearch("");
                            }
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
              
              <div className="text-right text-xs text-neutral-400 mb-2">
                {interestsDraft.length}/3 selected
              </div>
              <label className="block text-sm font-medium text-neutral-700 mt-2">Organization</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2a2a2a]"
                value={organizationDraft}
                onChange={e => setOrganizationDraft(e.target.value)}
                maxLength={60}
                placeholder="e.g. Google, University of Toronto"
                type="text"
              />
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <button
                    className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <button
                    className="px-4 py-2 rounded-full bg-[#2a2a2a] text-white hover:bg-[#444] disabled:opacity-60"
                    onClick={handleEditAbout}
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving..." : "Save"}
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
              {editError && <div className="text-red-500 mt-2 text-sm">{editError}</div>}
              {editSuccess && <div className="text-green-600 mt-2 text-sm">{editSuccess}</div>}
            </AlertDialogContent>
          </AlertDialog>
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