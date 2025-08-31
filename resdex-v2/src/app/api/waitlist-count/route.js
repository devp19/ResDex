import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });
  const baseline = parseInt(process.env.DISPLAY_WAITLIST_SEED || '0', 10);
  const displayCount = count < baseline ? count + baseline : count;
  return NextResponse.json({ count: displayCount });
}