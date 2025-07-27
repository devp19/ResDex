"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { ChevronRightIcon, CheckIcon } from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { use3dTilt } from "@/hooks/use3dTilt";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const tiltLogo = use3dTilt();

  // Memoize animated heading so animation doesn't restart each render
  const memoizedHeading = useMemo(
    () => (
      <TextAnimate
        animation="fadeIn"
        by="line"
        as="h1"
        className="text-4xl md:text-3xl font-bold text-center leading-tight text-gray-900 mb-4 max-w-xl mx-auto"
        style={{ fontFamily: 'Satoshi-Bold, sans-serif' }}
      >
        Welcome back
      </TextAnimate>
    ),
    []
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setLoginSuccess(false);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message || "Login failed");
      setLoading(false);
      return;
    }
    // Fetch the user's profile to get the username
    const userId = data.user?.id;
    let username = null;
    if (userId) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();
      username = profileData?.username;
    }
    setLoginSuccess(true);
    setTimeout(() => {
      if (username) {
        router.push(`/profile/${username}`);
      } else {
        router.push("/");
      }
    }, 1500);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("Google login is not yet set up with Supabase.");
  };

  return (
    <div className="min-h-screen bg-white flex items-stretch justify-center relative" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
      {/* SVG Curved Streaks Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M0 200 Q720 400 1440 200" stroke="#ececec" strokeWidth="2" fill="none" />
          <path d="M0 400 Q720 600 1440 400" stroke="#f3f3f3" strokeWidth="2" fill="none" />
          <path d="M0 600 Q720 800 1440 600" stroke="#f5f5f5" strokeWidth="2" fill="none" />
        </svg>
      </div>
      {/* Right vertical split (now on the left) */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 relative z-10 order-1 md:order-2 bg-[#f5f5f5]">
        <div className="w-full max-w-md mx-auto rounded-2xl p-8 flex flex-col items-center">
          {/* Top content: logo, heading, description */}
          <div className="mb-6 w-full flex flex-col items-center">
            <div ref={tiltLogo.ref} onMouseMove={tiltLogo.onMouseMove} onMouseLeave={tiltLogo.onMouseLeave} className="mb-6 inline-block">
              <Image src="/beige-logo.png" alt="ResDex Logo" width={56} height={56} className="rounded-xl" />
            </div>
            {memoizedHeading}
            <p className="text-md text-gray-600 text-center max-w-md mb-4 satoshi-medium">
              Sign in to access your research dashboard, connect with mentors, and discover new opportunities.
            </p>
          </div>
          <AnimatedSubscribeButton
            className="w-full max-w-md rounded-full cursor-pointer bg-white border border-black text-black hover:bg-gray-100 transition-colors duration-300 group outline outline-1 outline-gray-300 mb-4"
            onClick={handleGoogleLogin}
            disabled={true}
          >
            <span className="inline-flex items-center group">
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_17_40)">
                  <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.5H37.5C36.8 33.1 34.3 36.1 30.9 38.1V44.1H38.3C43.1 39.7 47.5 32.9 47.5 24.5Z" fill="#4285F4"/>
                  <path d="M24 48C30.6 48 36.1 45.9 38.3 44.1L30.9 38.1C29.7 38.9 28.1 39.5 24 39.5C17.7 39.5 12.2 35.4 10.3 29.9H2.7V36.1C5.9 42.2 14.2 48 24 48Z" fill="#34A853"/>
                  <path d="M10.3 29.9C9.8 28.1 9.5 26.1 9.5 24C9.5 21.9 9.8 19.9 10.3 18.1V11.9H2.7C1 15.1 0 18.4 0 24C0 29.6 1 32.9 2.7 36.1L10.3 29.9Z" fill="#FBBC05"/>
                  <path d="M24 8.5C28.1 8.5 30.7 10.2 32.2 11.6L38.4 5.4C36.1 3.2 30.6 0 24 0C14.2 0 5.9 5.8 2.7 11.9L10.3 18.1C12.2 12.6 17.7 8.5 24 8.5Z" fill="#EA4335"/>
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="48" height="48" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span className="ml-2 text-md text-gray-900 satoshi-medium">Continue with Google</span>
              <ChevronRightIcon className="ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <span className="inline-flex items-center">
              <CheckIcon className="mr-2 size-5" />
              Signed in with Google
            </span>
          </AnimatedSubscribeButton>
          <div className="flex items-center w-full max-w-xs my-5">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-4 text-gray-400 font-medium">or</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full max-w-md items-center">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-base bg-gray-100 w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-base bg-gray-100 w-full"
              required
            />
            <AnimatedSubscribeButton
              type="submit"
              className="w-full max-w-md bg-neutral-800 text-white border-black rounded-full cursor-pointer hover:bg-neutral-700 transition-colors duration-300 text-center justify-center group"
              disabled={loading}
              subscribeStatus={loginSuccess}
            >
              <span className="inline-flex items-center group satoshi-medium">
                {loading ? "Logging in..." : "Login"}
                <ChevronRightIcon className="ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="inline-flex items-center">
                <CheckIcon className="mr-2 size-5" />
                Logged in!
              </span>
            </AnimatedSubscribeButton>
          </form>
          {error && (
            <p className="mt-6 text-left w-full max-w-md text-[15px] font-medium text-neutral-700 dark:text-neutral-200">
              {error}
            </p>
          )}
          <div className="w-full max-w-md flex justify-start mt-2">
            <a href="/forgot-password" className="text-sm text-neutral-500 hover:text-black underline transition-colors duration-200">Forgot your password?</a>
          </div>
          <p className="mt-8 text-xs text-gray-500 w-full max-w-md text-center">
            By logging in, you agree to ResDex's <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
          <div className="w-full max-w-md flex justify-center mt-4">
            <a href="/signup" className="text-sm text-neutral-500 hover:text-black underline transition-colors duration-200">Don't have an account? Sign up</a>
          </div>
        </div>
      </div>
      {/* Left vertical split (now empty, appears on the right for md+) */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 relative z-10 order-2 md:order-1">
        <img
          src="/logincover.webp"
          alt="Logo"
          className="object-cover w-full h-full rounded-2xl"
          style={{ transition: "transform 0.2s", willChange: "transform" }}
        />
      </div>
    </div>
  );
}
