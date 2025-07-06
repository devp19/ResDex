"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { ChevronRightIcon, CheckIcon } from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { use3dTilt } from "@/hooks/use3dTilt";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  { name: "Emily", university: "University of Toronto", body: "Found my first research project here. Super easy!", img: "https://avatar.vercel.sh/emily" },
  { name: "James", university: "McMaster University", body: "Great platform for students. Love the design!", img: "https://avatar.vercel.sh/james" },
  { name: "Olivia", university: "Western University", body: "I met my mentor through ResDex. Highly recommend!", img: "https://avatar.vercel.sh/olivia" },
  { name: "Liam", university: "Queen's University", body: "Easy to use and lots of real opportunities.", img: "https://avatar.vercel.sh/liam" },
  { name: "Sophia", university: "University of Waterloo", body: "The notifications and chat are super helpful.", img: "https://avatar.vercel.sh/sophia" },
  { name: "Noah", university: "York University", body: "I found a research group in my field. Thank you!", img: "https://avatar.vercel.sh/noah" },
  { name: "Grace", university: "Carleton University", body: "ResDex is a game changer for students.", img: "https://avatar.vercel.sh/grace" },
  { name: "Ethan", university: "University of Ottawa", body: "I love the community and support here.", img: "https://avatar.vercel.sh/ethan" },
];

const ReviewCard = ({ img, name, university, body }: { img: string; name: string; university: string; body: string }) => (
  <figure className="relative h-full w-fit sm:w-36 cursor-pointer overflow-hidden rounded-xl border p-4 border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05] dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]">
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
        <figcaption className="text-sm font-medium dark:text-white">{name}</figcaption>
          <p className="text-xs font-medium dark:text-white/40">{university}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );

function MarqueeDemoVertical() {
  return (
    <div className="relative flex h-[650px] w-full flex-row items-center justify-center overflow-hidden">
      <Marquee pauseOnHover vertical className="[--duration:20s]">
        {reviews.slice(0, 3).map((review) => (
          <ReviewCard key={review.university + '-m1'} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover vertical className="[--duration:20s]">
        {reviews.slice(3, 6).map((review) => (
          <ReviewCard key={review.university + '-m2'} {...review} />
        ))}
      </Marquee>
      <Marquee pauseOnHover vertical className="[--duration:20s]">
        {reviews.slice(6).map((review) => (
          <ReviewCard key={review.university + '-m3'} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
    </div>
  );
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const tiltLogo = use3dTilt();

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
    setLoginSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 1500);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("Google login is not yet set up with Supabase.");
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
          Welcome back
        </TextAnimate>
        <AnimatedSubscribeButton
          className="w-full max-w-md rounded-full cursor-pointer bg-white border border-black text-black hover:bg-gray-100 transition-colors duration-300 group outline outline-1 outline-gray-300"
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
            <span className="ml-2">Continue with Google (coming soon)</span>
            <ChevronRightIcon className="ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
          <span className="inline-flex items-center">
            <CheckIcon className="mr-2 size-5" />
            Signed in with Google
          </span>
        </AnimatedSubscribeButton>
        <div className="flex items-center w-full max-w-xs my-8">
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
            <span className="inline-flex items-center group">
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
      {/* Right Side */}
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center">
        <MarqueeDemoVertical />
      </div>
    </div>
  );
};

export default LoginPage; 