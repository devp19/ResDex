"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { TextAnimate } from "@/components/magicui/text-animate";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { use3dTilt } from "@/hooks/use3dTilt";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const tiltLogo = use3dTilt();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(
        "Password reset link sent! If the email is correct, you'll receive instructions on how to reset your password."
      );
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with that email address.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f6f3] px-4">
      <div className="flex flex-col items-center w-full max-w-lg">
        <div className="flex flex-col items-center mb-4">
          <div ref={tiltLogo.ref} onMouseMove={tiltLogo.onMouseMove} onMouseLeave={tiltLogo.onMouseLeave} className="inline-block">
            <Image src="/beige-logo.png" alt="ResDex Logo" width={80} height={80} className="rounded-xl mb-4" />
          </div>
        </div>
        <TextAnimate
          animation="fadeIn"
          by="word"
          as="h1"
          className="title mb-8 text-center text-2xl md:text-3xl font-bold"
          duration={0.7}
        >
          We all forget our passwords sometimes...
        </TextAnimate>
        <form onSubmit={handleReset} className="flex flex-col gap-6 w-full px-2 py-2 md:py-6">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-base bg-gray-100 w-full"
            required
          />
          <AnimatedSubscribeButton
            type="submit"
            className="w-full bg-neutral-800 text-white rounded-full py-2 font-semibold transition-colors duration-300 hover:bg-neutral-700"
            disabled={loading}
            subscribeStatus={!!success}
          >
            <span>{loading ? "Sending..." : "Send Reset Link"}</span>
            <span>Reset Link Sent!</span>
          </AnimatedSubscribeButton>
        </form>
        {error && (
          <p className=" text-left w-full text-[15px] font-medium text-neutral-700 dark:text-neutral-200">{error}</p>
        )}
        {success && (
          <p className=" text-left w-full text-[15px] font-medium dark:text-neutral-200">{success}</p>
        )}
        <div className="w-full flex justify-start mt-6">
          <a href="/login" className="text-sm text-neutral-500 hover:text-black underline transition-colors duration-200">Back to login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 