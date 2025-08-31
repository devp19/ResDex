import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function POST() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-arxiv`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(process.env.CRON_SECRET ? { 'x-cron-key': process.env.CRON_SECRET } : {})
    },
    body: JSON.stringify({ trigger: 'manual' })
  });
  const text = await res.text();
  try { return NextResponse.json(JSON.parse(text), { status: res.status }); }
  catch { return NextResponse.json({ raw: text }, { status: res.status }); }
} 