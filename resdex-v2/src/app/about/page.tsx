"use client";

import React, { useEffect, useState, useRef } from "react";
import Tilt from "react-parallax-tilt";
import { TextAnimate } from "@/components/magicui/text-animate";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { TrendingDown } from "lucide-react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { ChartCard } from "../page";
import { Navbar, NavBody, NavItems, NavbarLogo } from "@/components/ui/navbar";
import { Footer7 } from "@/components/footer7";
import { signOut, onAuthStateChanged, User, linkWithPopup, unlink, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function About() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDoc, setUserDoc] = useState<any>(null);
  const avatarUrl = userDoc?.profilePicture || currentUser?.photoURL || "/beige-logo.png";
  const isGoogleLinked = currentUser?.providerData?.some((p) => p.providerId === "google.com");

  // User info for dropdown
  const fullName = userDoc?.fullName || currentUser?.displayName || "";
  let username = userDoc?.username;
  if (!username && currentUser?.email) {
    username = currentUser.email.split("@")[0];
  }
  username = username ? `@${username}` : "";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setUserDoc(null);
      return;
    }
    const fetchUserDoc = async () => {
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserDoc(snap.data());
      } else {
        setUserDoc(null);
      }
    };
    fetchUserDoc();
  }, [currentUser]);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Blog", link: "/blog" },
    { name: "Contact", link: "/contact" },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 xl:px-0 max-w-5xl mx-auto relative">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 focus:outline-none rounded-full transition-colors duration-150 hover:bg-gray-200/60 dark:hover:bg-neutral-800/60 cursor-pointer px-2 py-1"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-neutral-700"
                  />
                </button>
                {/* Add dropdown logic here if needed */}
              </div>
            ) : null}
          </div>
        </NavBody>
      </Navbar>
      {/* About Content */}
      <div className="w-full flex flex-col items-center mt-40 mb-64">
        <TextAnimate
          animation="fadeIn"
          by="line"
          as="h2"
          className="title-2 text-center mb-12"
        >
          {`Built by students, backed by passion.`}
        </TextAnimate>
        <div className="w-full flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
            <Tilt glareEnable={true} glareMaxOpacity={0.08} glareColor="#fff" glarePosition="all" scale={1.01} transitionSpeed={2500} className="w-full flex justify-center">
              <ChartCard />
            </Tilt>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center gap-6">
            <div className="flex flex-row items-center gap-4">
              <span className="text-xs text-gray-500 mr-2">Acceptance Rate</span>
              <span className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <NumberTicker value={95} startValue={18.5} decimalPlaces={1} direction="down" className="whitespace-pre-wrap tracking-tighter" />%
                <TrendingDown className="h-5 w-5 text-black dark:text-white" />
              </span>
            </div>
            <TextAnimate
              animation="fadeIn"
              by="word"
              as="p"
              className="max-w-2xl text-left text-base text-gray-700"
              delay={0.4}
            >
              {`As students, we know how frustrating it is to cold-email countless professors just to get a shot at research. With AI and emerging fields driving explosive growth in research, competition has never been tougher—and acceptance rates are shrinking. That's why we built a student-led platform to make research more accessible. Everything you need to find opportunities, showcase your work, and build your research portfolio—all in one place.`}
            </TextAnimate>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <InteractiveHoverButton className="bg-black border-black hover:text-black" dotClassName="bg-white" hoverArrowClassName="text-black">
                <span className="text-white group-hover:text-black">Join our Student Team</span>
              </InteractiveHoverButton>
              <InteractiveHoverButton className="bg-white text-black border-black">Read More</InteractiveHoverButton>
            </div>
          </div>
        </div>
      </div>
      <Footer7
        logo={{
          url: "/",
          src: "/beige-logo.png",
          alt: "ResDex Logo",
          title: "ResDex"
        }}
      />
    </div>
  );
} 