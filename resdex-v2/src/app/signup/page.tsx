"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { ChevronRightIcon, CheckIcon } from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { use3dTilt } from "@/hooks/use3dTilt";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<null | boolean>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const tiltLogo = use3dTilt();

  // Function to check username availability
  async function checkUsernameAvailability(username: string) {
    const { data, error } = await supabase.rpc('is_username_available', { username_to_check: username });
    if (error) {
      setError('Error checking username: ' + error.message);
      return false;
    }
    return data;
  }

  // Handler for username input blur
  async function handleUsernameBlur() {
    setError("");
    setUsernameAvailable(null);
    if (username.length >= 3) {
      const isAvailable = await checkUsernameAvailability(username.toLowerCase());
      setUsernameAvailable(isAvailable);
    }
  }

  // Handler for form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic validation
    if (!email || !password || !confirmPassword || !username) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      setLoading(false);
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError("Username can only contain letters, numbers, and underscores.");
      setLoading(false);
      return;
    }

    // Final check for username availability (lowercased)
    const usernameLower = username.toLowerCase();
    const isAvailable = await checkUsernameAvailability(usernameLower);
    if (!isAvailable) {
      setError("Username is already taken. Please choose another.");
      setLoading(false);
      setUsernameAvailable(false);
      if (usernameInputRef.current) {
        usernameInputRef.current.focus();
      }
      return;
    }

    // Proceed with registration (Supabase Auth will handle duplicate emails)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: usernameLower,
          display_name: displayName || usernameLower,
        },
      },
    });
    if (signUpError) {
      setError(signUpError.message || "Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    setSuccess(
      "Signup successful! Please check your email to confirm your account."
    );
    setLoading(false);
    setTimeout(() => {
      router.push("/login");
    }, 3500);
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
      {/* Right vertical split (signup form) */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 relative z-10 order-1 md:order-2 bg-[#f5f5f5]">
        <div className="w-full max-w-md mx-auto rounded-2xl p-8 flex flex-col items-center">
          {/* Top content: logo, heading, description */}
          <div className="mb-6 w-full flex flex-col items-center">
            <div ref={tiltLogo.ref} onMouseMove={tiltLogo.onMouseMove} onMouseLeave={tiltLogo.onMouseLeave} className="mb-6 inline-block">
              <Image src="/beige-logo.png" alt="ResDex Logo" width={56} height={56} className="rounded-xl" />
            </div>
            <TextAnimate
              animation="fadeIn"
              by="line"
              as="h1"
              className="text-4xl md:text-3xl font-bold text-center leading-tight text-gray-900 mb-4 max-w-xl mx-auto"
              style={{ fontFamily: 'Satoshi-Bold, sans-serif' }}
            >
              Create your account
            </TextAnimate>
            <p className="text-md text-gray-600 text-center max-w-md mb-4 satoshi-medium">
              Join the largest growing community of ResDex users. Sign up to discover, connect, and share with others.
            </p>
          </div>
          <form onSubmit={handleSignup} className="flex flex-col gap-6 w-full max-w-md items-center">
            <input
              type="text"
              placeholder="Username"
              value={username}
              ref={usernameInputRef}
              onChange={e => { setUsername(e.target.value); setUsernameAvailable(null); }}
              onBlur={handleUsernameBlur}
              className="border border-gray-300 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-base bg-gray-100 w-full"
              required
            />
            {username.length >= 3 && usernameAvailable === true && (
              <div className="text-sm w-full max-w-mda text-left" style={{ color: '#2a2a2a', marginTop: '-13px', marginLeft: '13px' }}>Nice! Username is available!</div>
            )}
            {username.length >= 3 && usernameAvailable === false && (
              <div className="text-sm w-full max-w-md text-left" style={{ color: '#2a2a2a', marginTop: '-13px', marginLeft: '13px' }}>Oops! Username is already taken!</div>
            )}
            <input
              type="text"
              placeholder="Display Name (optional)"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="border border-gray-300 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-base bg-gray-100 w-full"
            />
            <input
              type="email"
              placeholder="Email"
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
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-gray-300 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-base bg-gray-100 w-full"
              required
            />
            <AnimatedSubscribeButton
              type="submit"
              className="w-full max-w-md bg-neutral-800 text-white border-black rounded-full cursor-pointer hover:bg-neutral-700 transition-colors duration-300 text-center justify-center group"
              disabled={loading}
              subscribeStatus={!!success}
            >
              <span className="inline-flex items-center group">
                {loading ? "Signing up..." : "Sign Up"}
                <ChevronRightIcon className="ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="inline-flex items-center">
                <CheckIcon className="mr-2 size-5" />
                Signed up!
              </span>
            </AnimatedSubscribeButton>
          </form>
          {error && (
            <p className="mt-6 text-left w-full max-w-md text-[15px] font-medium" style={{ color: '#2a2a2a', marginTop: '0px' }}>
              {error}
            </p>
          )}
          {success && (
            <p className="mt-6 text-left w-full max-w-md text-[15px] font-medium" style={{ color: '#2a2a2a', marginTop: '0px' }}>
              {success}
            </p>
          )}
          <div className="w-full max-w-md flex justify-center mt-4">
            <a href="/login" className="text-sm text-neutral-500 hover:text-black underline transition-colors duration-200">Already have an account? Login</a>
          </div>
        </div>
      </div>
      {/* Left vertical split with cover image filling the side */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 relative z-10 order-2 md:order-1 p-0">
        <Image
          src="/logincover.png"
          alt="Signup Cover"
          fill
          className="object-cover w-full h-full rounded-2xl"
          priority
          sizes="50vw"
        />
      </div>
    </div>
  );
};

export default SignupPage;