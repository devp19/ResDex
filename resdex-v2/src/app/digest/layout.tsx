'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RightSidebar } from './components/RightSidebar';

export default function DigestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDigestPage = pathname === '/digest';
  const isArticlePage = pathname.startsWith('/digest/') && pathname !== '/digest';
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Navbar */}  
      <nav className="relative z-10 flex items-center py-6 px-8 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/beige-logo.png" alt="ResDex Logo" width={32} height={32} />
            <span className="ml-1 text-xl font-semibold">ResDex</span>
          </Link>
        </div>
        
        {/* Nav Links - centered absolutely */}
        <div className="hidden md:flex gap-6 bg-gray-50 rounded-full px-4 py-2 text-sm font-medium absolute left-1/2 -translate-x-1/2" style={{ fontFamily: 'GellixMedium, sans-serif' }}>
          <Link href="/" className="px-3 py-2 rounded-full hover:bg-gray-100 transition">Home</Link>
          <Link href="/digest" className="px-3 py-2 rounded-full hover:bg-gray-100 transition text-black bg-white shadow">Digest</Link>
          <Link href="/waitlist" className="px-3 py-2 rounded-full hover:bg-gray-100 transition">Brainwave</Link>
          <Link href="/waitlist" className="px-3 py-2 rounded-full hover:bg-gray-100 transition">Discovery ↗</Link>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-12xl mx-auto">
          {isArticlePage ? (
            // Centered layout for article pages
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                {children}
              </div>
            </div>
          ) : (
            // Grid layout for digest page
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar */}
              <aside className="lg:col-span-3">
                <div className="sticky top-24 space-y-6">
                  <nav className="space-y-2">
                    <Link href="/digest" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/20 text-black dark:text-gray-300 font-medium">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Discover
                    </Link>
                    <Link href="/saved" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Saved
                    </Link>
                    <Link href="/history" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      History
                    </Link>
                  </nav>
                </div>
              </aside>

              {/* Center Column */}
              <main className="lg:col-span-6">
                {children}
              </main>

              {/* Right Sidebar - Only show on digest page */}
              <aside className="lg:col-span-2">
                <RightSidebar />
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 