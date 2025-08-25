// src/lib/digest.ts
import { supabase } from './supabase';
import { tables } from './tables';

export function torontoDayISO(d: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(d);
  const y = fmt.find(p => p.type === 'year')!.value;
  const m = fmt.find(p => p.type === 'month')!.value;
  const dd = fmt.find(p => p.type === 'day')!.value;
  return `${y}-${m}-${dd}`;
}

export async function getDigestForDay(dayISO?: string) {
  const t = tables();
  const day = dayISO ?? torontoDayISO();

  // Debug: log the table names being used
  console.log('Environment check:', {
    NEXT_PUBLIC_USE_DEV: process.env.NEXT_PUBLIC_USE_DEV,
    tablePrefix: process.env.NEXT_PUBLIC_USE_DEV === '1' ? 'dev_' : '',
    digestTable: t.digest,
    articlesTable: t.articles
  });

  // Build the join string matching the actual table name
  const join = t.articles; // e.g., "dev_articles" or "articles"

  const { data, error } = await supabase
    .from(t.digest)
    .select(`
      rank, topic,
      ${join} (
        id, title, authors, topic, link_abs, image_url, published_at, popularity, source, tag, ai_summary, abstract
      )
    `)
    .eq('day', day)
    .order('topic', { ascending: true })
    .order('rank', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getRecentIfEmpty(limit = 36) {
  const t = tables();
  const { data, error } = await supabase
    .from(t.articles)
    .select('id, title, authors, topic, link_abs, image_url, published_at, popularity, source, tag, ai_summary, abstract')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
} 