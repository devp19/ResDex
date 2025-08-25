import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'nodejs';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  const toronto = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year:'numeric', month:'2-digit', day:'2-digit' })
    .formatToParts(new Date()).reduce((acc:any,p:any)=>{acc[p.type]=p.value;return acc;}, {});
  const day = `${toronto.year}-${toronto.month}-${toronto.day}`;

  const a = await supabase.from('dev_articles').select('*', { count: 'exact', head: true });
  const d = await supabase.from('dev_daily_digest_items').select('*', { count: 'exact', head: true }).eq('day', day);
  const latest = await supabase.from('dev_articles').select('published_at').order('published_at', { ascending: false }).limit(1);

  // Get all available categories
  const { data: categories } = await supabase
    .from('dev_articles')
    .select('topic')
    .not('topic', 'is', null);

  const categoryCounts: Record<string, number> = {};
  categories?.forEach(article => {
    if (article.topic) {
      const topic = article.topic.trim();
      categoryCounts[topic] = (categoryCounts[topic] || 0) + 1;
    }
  });

  return NextResponse.json({
    supabaseUrlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    torontoDay: day,
    articlesCount: a.count ?? 0,
    digestTodayCount: d.count ?? 0,
    latestPublishedAt: latest.data?.[0]?.published_at ?? null,
    availableCategories: Object.keys(categoryCounts).sort(),
    categoryCounts: Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Show top 20 categories
  });
} 