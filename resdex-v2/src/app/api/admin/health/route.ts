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

  return NextResponse.json({
    supabaseUrlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    torontoDay: day,
    articlesCount: a.count ?? 0,
    digestTodayCount: d.count ?? 0,
    latestPublishedAt: latest.data?.[0]?.published_at ?? null
  });
} 