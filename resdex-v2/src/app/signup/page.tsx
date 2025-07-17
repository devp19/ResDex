"use client";

import React, { useState, useRef, useEffect } from "react";
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


  

  // REMOVE THIS BLOCK TO RESTORE SIGNUP PAGE FUNCTIONALITY
    // REMOVE THIS BLOCK TO RESTORE SIGNUP PAGE FUNCTIONALITY

      // REMOVE THIS BLOCK TO RESTORE SIGNUP PAGE FUNCTIONALITY

        // REMOVE THIS BLOCK TO RESTORE SIGNUP PAGE FUNCTIONALITY

          // REMOVE THIS BLOCK TO RESTORE SIGNUP PAGE FUNCTIONALITY

  useEffect(() => {
    // --- TEMPORARY REDIRECT: Remove this block to restore signup page functionality ---
    router.replace("/waitlist");
    // --- END TEMPORARY REDIRECT ---
  }, [router]);

    // REMOVE THIS BLOCK ABOVE TO RESTORE SIGNUP PAGE FUNCTIONALITY
        // REMOVE THIS BLOCK ABOVE TO RESTORE SIGNUP PAGE FUNCTIONALITY

            // REMOVE THIS BLOCK ABOVE TO RESTORE SIGNUP PAGE FUNCTIONALITY

                // REMOVE THIS BLOCK ABOVE TO RESTORE SIGNUP PAGE FUNCTIONALITY

                    // REMOVE THIS BLOCK ABOVE TO RESTORE SIGNUP PAGE FUNCTIONALITY

                        // REMOVE THIS BLOCK ABOVE TO RESTORE SIGNUP PAGE FUNCTIONALITY





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
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      {/* Left Side */}
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen w-full bg-[#f7f6f3] px-6 lg:w-1/2 lg:px-20 py-0 border-r border-gray-200 text-center gap-3 lg:rounded-l-3xl">
        <div className="flex flex-col items-center mb-4">
          <div ref={tiltLogo.ref} onMouseMove={tiltLogo.onMouseMove} onMouseLeave={tiltLogo.onMouseLeave} className="inline-block">
            <Image src="/beige-logo.png" alt="ResDex Logo" width={80} height={80} className="rounded-xl mb-2" />
          </div>
        </div>
        <TextAnimate
          animation="slideUp"
          by="word"
          as="h1"
          className="title-2 mb-4"
          duration={0.7}
        >
          Create your account
        </TextAnimate>
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
      {/* Right Side (optional: can add a graphic or testimonials) */}
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center">
        {/* You can add a graphic, illustration, or testimonials here */}
      </div>
    </div>
  );
};

export default SignupPage; 