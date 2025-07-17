import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });
  const offset = parseInt(process.env.WAITLIST_OFFSET || '0', 10);
  const displayCount = count < offset ? count + offset : count;
  return NextResponse.json({ count: displayCount });
}