import { supabase } from './supabase';
import { tables } from './tables';

export async function getDigestForToday(dayISO?: string) {
  const t = tables();
  const day = dayISO ?? new Date().toISOString().slice(0,10);
  const { data, error } = await supabase
    .from(t.digest)
    .select(`
      rank, topic,
      ${t.articles} ( id, title, authors, topic, link_abs, image_url, published_at, popularity )
    `)
    .eq('day', day)
    .order('topic', { ascending: true })
    .order('rank', { ascending: true });

  if (error) throw error;
  return data ?? [];
} 