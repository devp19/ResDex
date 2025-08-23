// deno-lint-ignore-file no-explicit-any
// index.ts — ResDex arXiv fetcher (Deno, Supabase Edge Functions)
// Uses TABLE_PREFIX='dev_' for dev tables/RPCs

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Required function secrets (set in Supabase Studio -> Settings -> Configuration -> Functions):
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ARXIV_CATEGORIES (comma-separated),
// TABLE_PREFIX=dev_ (for dev), optional CRON_SECRET for header guard.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TABLE_PREFIX = Deno.env.get("TABLE_PREFIX") ?? ""; // 'dev_' for dev tables
// widen coverage via wildcards (can be overridden by Function secrets)
const DEFAULT_CATS = [
  "cs*",       // all Computer Science
  "stat*",     // all Statistics
  "eess*",     // all Electrical Eng/Systems Science
  "math*",     // all Mathematics
  "physics*",  // physics.* (not astro-ph/cond-mat/quant-ph)
  "astro-ph*", // all Astrophysics
  "cond-mat*", // all Condensed Matter
  "gr-qc*",    // General Relativity and Quantum Cosmology
  "hep-ex*", "hep-lat*", "hep-ph*", "hep-th*",
  "math-ph*",  // Mathematical Physics
  "nlin*",     // Nonlinear Sciences
  "nucl-ex*", "nucl-th*",
  "quant-ph*", // Quantum Physics
  "q-bio*",    // Quantitative Biology
  "q-fin*",    // Quantitative Finance
  "econ*",     // Economics
  "bio*",      // all Biology
  "med*"       // all Medicine
];

const CATS = (Deno.env.get("ARXIV_CATEGORIES") ?? DEFAULT_CATS.join(","))
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const CRON_SECRET = Deno.env.get("CRON_SECRET") || null;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

// Tunables
const UA = "ResDex/1.0 (metadata-only; https://export.arxiv.org)";
const PAGE = 100;
// keep your existing PAGE, UA, etc. Optionally tighten window for cost control:
const FETCH_WINDOW_HOURS = Number(Deno.env.get("FETCH_WINDOW_HOURS") ?? "24"); // 24–36 is good
const SLEEP_MS = Number(Deno.env.get("FETCH_SLEEP_MS") ?? "800"); // polite delay per page
const TZ = "America/Toronto";

type Row = {
  id: string; title: string; abstract?: string; authors?: string[];
  categories?: string[]; link_abs?: string; published_at?: string;
  topic?: string; source?: string; image_url?: string; ai_summary?: string;
};

// Helpers for prefixing
const T = (n: string) => `${TABLE_PREFIX}${n}`;
const RPC = (n: string) => `${TABLE_PREFIX}${n}`;

function baseId(input: string): string {
  const raw = input.split("/abs/").pop() || input;
  const m = raw.match(/^(\d{4}\.\d{4,5})/);
  return m ? m[1] : raw.split("?")[0];
}

function topicFromCats(cats: string[] = []): string {
  if (cats.some(c => /^cs\.CV/.test(c))) return "Vision";
  if (cats.some(c => /^cs\.CL/.test(c))) return "NLP";
  if (cats.some(c => /^cs\.RO/.test(c))) return "Robotics";
  if (cats.some(c => /^eess\.AS/.test(c) || /^cs\.SD/.test(c))) return "Audio/Speech";
  if (cats.some(c => /^stat\.ML/.test(c) || /^cs\.LG/.test(c) || /^cs\.AI/.test(c))) return "Stats/ML";
  if (cats.some(c => /^math\.(OC|ST|PR)/.test(c))) return "Theory/Optimization";
  if (cats.some(c => /^cs\.(DS|SY|AR|DC)/.test(c))) return "Systems";
  return "Other";
}

function parseAtom(xml: string): Row[] {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => m[1]);
  return entries.map(e => {
    const g = (re: RegExp) => e.match(re)?.[1]?.trim();
    const idUrl = g(/<id>(.*?)<\/id>/) ?? "";
    const title = (g(/<title>([\s\S]*?)<\/title>/) ?? "").replace(/\s+/g, " ").trim();
    const summary = (g(/<summary>([\s\S]*?)<\/summary>/) ?? "").replace(/\s+/g, " ").trim();
    const published = g(/<published>(.*?)<\/published>/);
    const authorNames = [...e.matchAll(/<name>(.*?)<\/name>/g)].map(m => m[1].trim());
    const cats = [...e.matchAll(/term="(.*?)"/g)].map(m => m[1]);
    return {
      id: baseId(idUrl),
      title,
      abstract: summary,
      authors: authorNames,
      categories: cats,
      link_abs: idUrl.replace("/pdf/", "/abs/"),
      published_at: published ?? null,
      topic: topicFromCats(cats),
      source: "arXiv",
      image_url: null
    };
  });
}

async function fetchSince(cat: string, hours = FETCH_WINDOW_HOURS): Promise<Row[]> {
  const cutoff = Date.now() - hours * 3600 * 1000;
  let start = 0;
  const rows: Row[] = [];

  while (true) {
    const url = `https://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(cat)}&sortBy=submittedDate&sortOrder=descending&start=${start}&max_results=${PAGE}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.error("arXiv fetch error", res.status, await res.text());
      break;
    }
    const xml = await res.text();
    const page = parseAtom(xml);
    if (page.length === 0) break;

    rows.push(...page);

    const lastTs = page.at(-1)?.published_at ? new Date(page.at(-1)!.published_at!).getTime() : 0;
    if (lastTs && lastTs < cutoff) break;

    start += PAGE;
    await new Promise(r => setTimeout(r, SLEEP_MS));
  }

  return rows;
}

async function upsertArticles(rows: Row[]) {
  if (!rows.length) return;
  const slim = rows.map(r => ({
    id: r.id, title: r.title, abstract: r.abstract,
    authors: r.authors, categories: r.categories, topic: r.topic,
    link_abs: r.link_abs, published_at: r.published_at,
    source: "arXiv", image_url: r.image_url ?? null
  }));
  const CHUNK = 200;
  for (let i = 0; i < slim.length; i += CHUNK) {
    const chunk = slim.slice(i, i + CHUNK);
    const { error } = await supabase.from(T("articles")).upsert(chunk, { onConflict: "id" }).select("id");
    if (error) throw error;
  }
}

async function recomputePopularity(hours = 48) {
  const { error } = await supabase.rpc(RPC("recompute_popularity"), { p_hours: hours });
  if (error) console.error("popularity rpc error:", error.message);
}

async function buildDailyDigest(dayISO: string, perTopic = 6) {
  const { error } = await supabase.rpc(RPC("build_daily_digest"), { p_day: dayISO, p_per_topic: perTopic });
  if (error) console.error("digest rpc error:", error.message);
}

function torontoDay(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = fmt.formatToParts(date);
  const y = parts.find(p => p.type === 'year')!.value;
  const m = parts.find(p => p.type === 'month')!.value;
  const d = parts.find(p => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

serve(async (req) => {
  try {
    if (CRON_SECRET) {
      const key = req.headers.get("x-cron-key");
      if (key !== CRON_SECRET) return new Response("unauthorized", { status: 401 });
    }

    console.log("TABLE_PREFIX:", TABLE_PREFIX || "(none)");
    console.log("CATS:", CATS.join(","));

    const all: Row[] = [];
    for (const cat of CATS) {
      console.log("fetching category", cat);
      const batch = await fetchSince(cat, FETCH_WINDOW_HOURS);
      console.log("fetched", cat, batch.length);
      all.push(...batch);
    }

    const map = new Map<string, Row>();
    for (const r of all) if (r.id) map.set(r.id, r);
    console.log("unique to upsert:", map.size);

    await upsertArticles([...map.values()]);
    await recomputePopularity(48);

    // Build yesterday + today (Toronto local date)
    const today = torontoDay();
    const yesterday = torontoDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const rpcPrefix = Deno.env.get('TABLE_PREFIX') === 'dev_' ? 'dev_' : '';
    const buildName = `${rpcPrefix}build_daily_digest`;

    await supabase.rpc(buildName, { p_day: yesterday, p_per_topic: 6 });
    await supabase.rpc(buildName, { p_day: today,     p_per_topic: 6 });

    // OPTIONAL: Trigger Next.js revalidate so /digest updates immediately
    const site = Deno.env.get('SITE_URL');
    const secret = Deno.env.get('REVALIDATE_SECRET');
    if (site && secret) {
      // revalidate today's digest view
      await fetch(`${site}/api/revalidate-digest?secret=${secret}`, { method: 'POST' });
    }

    const body = { upserted: map.size, days: { yesterday, today } };
    console.log("done", body);
    return new Response(JSON.stringify(body), { status: 200 });
  } catch (e) {
    console.error("handler error", e);
    return new Response("error", { status: 500 });
  }
});
