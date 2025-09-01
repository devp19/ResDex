"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import "../DailyDigest.css";
import { GoPeople, GoFileSymlinkFile } from "react-icons/go";
import { IoCalendarOutline } from "react-icons/io5";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Article {
  id: string;
  title: string;
  summary: string;
  tag: string;
  link: string;
  author: string;
  published: string;
  source: string;
  arxivCategory: string;
  aiSummary?: string;
  image_url?: string;
}

interface ArticleProps {
  article: Article;
}

function fmtAuthors(author: string) {
  if (!author) return "";
  const authors = author.split(",").map((a) => a.trim());
  return authors.slice(0, 2).join(", ") + (authors.length > 2 ? " et al." : "");
}

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

// Component for displaying authors with expand/collapse functionality
function AuthorDisplay({ authors }: { authors: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!authors) return <span>Unknown Author</span>;

  const authorList = authors
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (authorList.length <= 4) {
    return <span>{authorList.join(", ")}</span>;
  }

  const displayedAuthors = expanded ? authorList : authorList.slice(0, 4);
  const remainingCount = authorList.length - 4;

  return (
    <div>
      <span>{displayedAuthors.join(", ")}</span>
      {!expanded && remainingCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="ml-1 text-black-600 dark:text-black-400 hover:text-black-800 dark:hover:text-black-300 underline text-sm"
        >
          +{remainingCount} more
        </button>
      )}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="ml-1 text-black-600 dark:text-black-400 hover:text-black-800 dark:hover:text-black-300 underline text-sm"
        >
          Show less
        </button>
      )}
    </div>
  );
}

export default function Article({ article }: ArticleProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Page-level UI scale
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     document.documentElement.style.setProperty('--ui-scale', '0.8');
  //     document.documentElement.style.fontSize = `${16 * 0.8}px`;
  //   }
  //   return () => {
  //     if (typeof window !== 'undefined') {
  //       document.documentElement.style.removeProperty('--ui-scale');
  //       document.documentElement.style.fontSize = '16px';
  //     }
  //   };
  // }, []);

  // Fetch related articles from Supabase
  useEffect(() => {
    async function fetchRelatedArticles() {
      try {
        setLoading(true);

        // Fetch articles from Supabase to find related ones
        const { data: articles, error } = await supabase
          .from("dev_articles")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(100); // Get a reasonable number to find related articles

        if (error) {
          console.error("Error fetching articles for related articles:", error);
          setLoading(false);
          return;
        }

        if (articles && articles.length > 0) {
          // Transform Supabase data to match Article interface
          const transformedArticles: Article[] = articles.map(
            (articleData: any) => ({
              id: articleData.id,
              title: articleData.title,
              summary: articleData.abstract || "",
              tag: articleData.topic || "Research",
              link:
                articleData.link_abs ||
                `https://arxiv.org/abs/${articleData.id}`,
              author: articleData.authors
                ? Array.isArray(articleData.authors)
                  ? articleData.authors.join(", ")
                  : articleData.authors
                : "Unknown",
              published: articleData.published_at,
              source: articleData.source || "arXiv",
              arxivCategory: articleData.id,
              aiSummary: articleData.ai_summary,
            })
          );

          // Find related articles based on similar criteria
          const related = transformedArticles
            .filter((a) => a.id !== article.id)
            .filter((a) => {
              // Match by author (if available)
              if (
                article.author &&
                a.author &&
                a.author.toLowerCase().includes(article.author.toLowerCase())
              )
                return true;

              // Match by topic/category
              if (article.tag && a.tag === article.tag) return true;

              // Match by arxiv category
              if (
                article.arxivCategory &&
                a.arxivCategory === article.arxivCategory
              )
                return true;

              return false;
            })
            .sort(
              (a, b) =>
                new Date(b.published).getTime() -
                new Date(a.published).getTime()
            )
            .slice(0, 3); // Limit to 3 related articles

          setRelatedArticles(related);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in fetchRelatedArticles:", error);
        setLoading(false);
      }
    }

    fetchRelatedArticles();
  }, [article.id, article.arxivCategory, article.tag, article.author]);

  const handleExternalLink = () => {
    if (article?.link)
      window.open(article.link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full min-h-screen">
      {/* Main container with proper spacing */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 xl:px-12">
        <div className="grid grid-cols-12 gap-2 lg:gap-8 xl:gap-2 justify-center">
          {/* LEFT sidebar - Key Details */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <div className="sticky top-24">
              <div className="bg-white/30 dark:bg-neutral-800/30 backdrop-blur-sm rounded-xl mt-12">
                {/* Metadata */}
                {/* <div className="mb-6 space-y-2">
                  <div className="flex items-start">
                    <span className="font-xs mr-2 flex-shrink-0">Author:</span>
                    <div className="text-sm">
                      <AuthorDisplay authors={article.author} />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Published:</span>
                    <span>
                      {article.published
                        ? timeSince(new Date(article.published))
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Source:</span>
                    <span>{article.source}</span>
                  </div>
                </div> */}
                Key Details
                                <div className="border-t border-neutral-300 dark:border-neutral-600 mb-6 mt-2" />

                 <div className="mb-6 space-y-2 mt-6">
                  <GoPeople />

          
                  <div className="font-xs">
                    <AuthorDisplay authors={article.author} />
                  </div>
                </div>

                
              
              <div className="mb-6 space-y-2">
                  <IoCalendarOutline />

          
                   <span>
                    {article.published
                      ? new Date(article.published).toDateString()

                      : "Unknown"}
                  </span>
                </div>


<div className="mb-6 space-y-2">
                  < GoFileSymlinkFile />

          
                                    Source: <span>{article.source}</span>

                </div>

           


                {/* Divider */}
                <div className="border-t border-neutral-300 dark:border-neutral-600 mb-6" />

                {/* Read Full Article Button */}
                <div className="mb-6">
                  <button
                    onClick={handleExternalLink}
                    className="w-full px-3 py-3 bg-black dark:bg-white text-white dark:text-black font-regular rounded-lg hover:bg-gray-800 hover:cursor-pointer dark:hover:bg-gray-200 transition-colors"
                  >
                    Read Full Article
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-300 dark:border-neutral-600" />

             
               
                    <span className="w-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mr-3 flex-shrink-0" />
                    <div>
                      Category:{' '} 
                      {article.tag}
                    </div>
                    <span className="w-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mr-3 flex-shrink-0" />
                    <div>
                      arXiv Category:{' '}
                      {article.arxivCategory}
                    </div>
                    <span className="w-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mr-3 flex-shrink-0" />
                    <div>
                     Research Type: {' '}
                      {article.source}
                    </div>
                
              </div>
            </div>
          </aside>

          {/* MAIN content - hero + About */}
          <main className="col-span-12 lg:col-span-5 xl:col-span-10">
            <div className="max-w-4xl mx-auto">
              {/* Back to Digest Button */}
              <div className="mb-6">
                <Link
                  href="/digest"
                  className="text-sm inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Digest
                </Link>
              </div>

              {/* HERO (taller + uses image_url if present) */}
              <div className="mb-12">
                <div
                  className="relative w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden
                                h-[420px]"
                >
                  {article.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-white dark:bg-neutral-900"
                      style={{ background: "#E5E3DF" }}
                      role="img"
                      aria-label={`Research article in ${article.tag}`}
                    >
                      <div className="text-center p-8">
                        <div className="text-4xl font-regular text-neutral-800 dark:text-neutral-200 mb-2">
                          {article.tag}
                        </div>
                        <div className="text-lg text-neutral-600 dark:text-neutral-400">
                          Research Article
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

<h1 className="text-3xl font-regular text-neutral-900 dark:text-neutral-100 mb-6">
                {article.title}
              </h1>
              {/* Article Title, Summary, etc. */}
{article.summary || article.aiSummary ? (
  <div className="max-w-none">
    {article.summary && (
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 mb-6">
        {article.summary}
      </p>
    )}
    {article.aiSummary && (
      <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 mb-8">
        {article.aiSummary}
      </p>
    )}
  </div>
) : (
  <div className="text-center py-12">
    <div className="text-2xl font-regular text-neutral-400 dark:text-neutral-500 mb-2">
      No Summary Available
    </div>
    <p className="text-neutral-500 dark:text-neutral-400">
      This research paper doesn't have a summary or abstract available. You can view the full paper on arXiv for complete
      details.
    </p>
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
    >
      View Full Paper on arXiv
    </a>
  </div>
)}

{/* Related Articles Horizontal Cards */}
{!loading && relatedArticles.length > 0 && (
  <div className="flex gap-4 overflow-x-auto mt-20 pb-2">
    {relatedArticles.map((ra) => (
      <Link
        key={ra.id}
        href={`/digest/${encodeURIComponent(ra.id)}`}
        className="block min-w-[200px] max-w-xs flex-1"
      >
        <article className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col min-w-0">
          <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
            <div
              className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
              style={{
                background: "#E5E3DF",
              }}
              role="img"
              aria-label={`Research article in ${ra.tag}`}
            >
              <div className="text-center">
                <div className="text-xl font-regular text-neutral-800 dark:text-neutral-200">
                  {ra.tag}
                </div>
              </div>
            </div>
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 bg-white/90 dark:bg-neutral-900/90 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                {ra.tag}
              </span>
            </div>
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 bg-black/90 text-white text-xs font-medium rounded-full">
                {ra.source}
              </span>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {ra.published ? timeSince(new Date(ra.published)) : ""}
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {ra.author.split(",")[0].trim() || "Unknown Author"}
              </div>
            </div>

            <h2 className="text-lg font-regular text-neutral-900 dark:text-neutral-100 mb-3 line-clamp-2 group-hover:text-black dark:group-hover:text-gray-300 transition-colors flex-1 leading-tight">
              {ra.title}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3 leading-relaxed">
              {ra.summary}
            </p>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1 text-neutral-400 group-hover:text-black-500 transition-colors">
                <span className="text-sm font-medium">Read more</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </article>
      </Link>
    ))}
  </div>
)}

{/* If loading or no related articles */}
{loading && (
  <div className="flex gap-4 overflow-x-auto mt-8 pb-2 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="min-w-[300px] max-w-xs bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="aspect-[16/9] bg-neutral-200 dark:bg-neutral-700" />
        <div className="p-5 space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
)}
{!loading && relatedArticles.length === 0 && (
  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-8">No related articles found.</p>
)}

</div>
            
            
          </main>

          {/* RIGHT sidebar - Related Articles */}
          {/* <aside className="hidden lg:block lg:col-span-4 xl:col-span-2">
            <div className="sticky top-24">
              <div className="bg-white/30 dark:bg-neutral-800/30 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-sm font-regular uppercase tracking-wide mb-3">
                  Related Articles
                </h2>

                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                      >
                        <div className="aspect-[16/9] bg-neutral-200 dark:bg-neutral-700" />
                        <div className="p-5 space-y-2">
                          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : relatedArticles.length === 0 ? (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    No related articles found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {relatedArticles.map((ra) => (
                      <Link
                        key={ra.id}
                        href={`/digest/${encodeURIComponent(ra.id)}`}
                        className="block"
                      >
                        <article className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col min-w-0">
                          <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
                            <div
                              className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                              style={{
                                background: "#E5E3DF",
                              }}
                              role="img"
                              aria-label={`Research article in ${ra.tag}`}
                            >
                              <div className="text-center">
                                <div className="text-xl font-regular text-neutral-800 dark:text-neutral-200">
                                  {ra.tag}
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-0.5 bg-white/90 dark:bg-neutral-900/90 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-full">
                                {ra.tag}
                              </span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-0.5 bg-black/90 text-white text-xs font-medium rounded-full">
                                {ra.source}
                              </span>
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 6v6l4 2" />
                                </svg>
                                {ra.published
                                  ? timeSince(new Date(ra.published))
                                  : ""}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {ra.author.split(",")[0].trim() ||
                                  "Unknown Author"}
                              </div>
                            </div>

                            <h2 className="text-lg font-regular text-neutral-900 dark:text-neutral-100 mb-3 line-clamp-2 group-hover:text-black dark:group-hover:text-gray-300 transition-colors flex-1 leading-tight">
                              {ra.title}
                            </h2>

                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3 leading-relaxed">
                              {ra.summary}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800">
                              <div className="flex items-center gap-1 text-neutral-400 group-hover:text-black-500 transition-colors">
                                <span className="text-sm font-medium">
                                  Read more
                                </span>
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside> */}
        </div>
      </div>
      
    </div>
  );
}
