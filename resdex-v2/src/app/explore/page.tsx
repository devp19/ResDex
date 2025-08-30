"use client";

import Image from "next/image";

import { Heart, MessageCircle, Ellipsis } from 'lucide-react';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="relative z-10 flex items-center py-6 px-8 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image src="/beige-logo.png" alt="ResDex Logo" width={32} height={32} />
          <span className="ml-1 text-xl font-semibold">ResDex</span>
        </div>
        {/* Nav Links */}
        <div
          className="hidden md:flex gap-6 bg-gray-50 rounded-full px-4 py-2 text-sm font-medium absolute left-1/2 -translate-x-1/2"
          style={{ fontFamily: "GellixMedium, sans-serif" }}
        >
          <a
            href="/"
            className="px-3 py-2 rounded-full hover:bg-gray-100 transition text-black bg-white shadow"
          >
            Home
          </a>
          <a
            href="/waitlist"
            className="px-3 py-2 rounded-full hover:bg-gray-100 transition"
          >
            Digest
          </a>
          <a
            href="/waitlist"
            className="px-3 py-2 rounded-full hover:bg-gray-100 transition"
          >
            Brainwave
          </a>
          <a
            href="/waitlist"
            className="px-3 py-2 rounded-full hover:bg-gray-100 transition"
          >
            Discovery ↗
          </a>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button className="rounded-full p-2 hover:bg-gray-100 transition">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" fill="#23272A" />
              <path
                d="M8.5 15.5C8.5 15.5 9.5 16 12 16C14.5 16 15.5 15.5 15.5 15.5"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <ellipse cx="9.5" cy="12" rx="1" ry="1.5" fill="#fff" />
              <ellipse cx="14.5" cy="12" rx="1" ry="1.5" fill="#fff" />
            </svg>
          </button>
          <button
            className="rounded-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium transition"
            style={{ fontFamily: "GellixMedium, sans-serif", cursor: "pointer" }}
          >
            Join Waitlist ↗
          </button>
        </div>
      </nav>

      {/* Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 ">
        {/* Left Sidebar */}
        <aside className="hidden md:block md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-2xl border">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/jess-avatar.jpeg"
                alt="User"
                width={72}
                height={72}
                className="rounded-full"
              />
              <h2 className="mt-2 font-semibold">Dev Patel</h2>
              <p className="text-sm text-gray-500">@devp</p>
              <div className="flex justify-around w-full mt-4 text-sm">
                <div>
                  <p className="font-semibold">250</p>
                  <p className="text-gray-500">Posts</p>
                </div>
                <div>
                  <p className="font-semibold">2022</p>
                  <p className="text-gray-500">Followers</p>
                </div>
                <div>
                  <p className="font-semibold">590</p>
                  <p className="text-gray-500">Following</p>
                </div>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-black text-white font-medium">
                My Profile
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border">
            <h3 className="font-regular mb-3">Your Shortcuts</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Art and Drawing</li>
              <li>Dribbble Pro</li>
              <li>Behance Creative</li>
              <li>Solo Leveling</li>
            </ul>
          </div>
        </aside>

        {/* Feed */}
        <section className="md:col-span-2 space-y-6">
          {/* Post composer */}
          <div className="bg-white p-4 rounded-2xl border">
            <input
              type="text"
              placeholder="Share something..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
            />
            <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
              <div className="flex gap-4">
                <button>Image</button>
                <button>Video</button>
                <button>Poll</button>
              </div>
              <button className="px-4 py-1 rounded-xl bg-black text-white">
                Post
              </button>
            </div>
          </div>

          {/* Example Post */}
          <div className="bg-white rounded-2xl border p-4">
            <div className="flex items-center gap-3">
              <Image
                src="/jess-avatar.jpeg"
                alt="User"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">Fenil Shah</p>
                <p className="text-xs text-gray-500">12 minutes ago</p>
              </div>
            </div>
            <p className="mt-3 text-sm">
              Working hard as a project manager...Just finished ontario government internship!!!!!
            </p>
            <div className="mt-3">
              <Image
                src="/logincover.webp"
                alt="Art Post"
                width={600}
                height={400}
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center gap-7 mt-5 text-sm text-gray-600">
              <div className="inline-flex gap-2 align-items-center"><Heart width={20}/>320k Likes</div>
            <div className="inline-flex gap-2 align-items-center"><MessageCircle width={20}/>120 Comments</div>
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden md:block md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-2xl border">
            <h3 className="font-regular mb-3">Activity</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <span className="font-semibold">Deep</span> started following you · 5m
              </li>
              <li>
                <span className="font-semibold">Darsh</span> liked your photo · 30m
              </li>
              <li>
                <span className="font-semibold">Jocelyn</span> liked your photo · 1d
              </li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-2xl border">
            <h3 className="font-regular mb-3">Suggested for you</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex justify-between">
                <span>Sung Jin Woo</span>
                <button className="text-black">Follow</button>
              </li>
              <li className="flex justify-between">
                <span>Lamar Jackson</span>
                <button className="text-black">Follow</button>
              </li>
              <li className="flex justify-between">
                <span>Brad Pitt</span>
                <button className="text-black">Follow</button>
              </li>
              <li className="flex justify-between">
                <span>Bryson Tiller</span>
                <button className="text-black">Follow</button>
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
