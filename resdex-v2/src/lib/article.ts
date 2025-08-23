// src/lib/article.ts
import { supabase } from './supabase';
import { tables } from './tables';

export async function getArticleById(id: string) {
  const t = tables();
  const { data, error } = await supabase
    .from(t.articles)
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function getRelatedByTopic(topic: string, id: string, limit = 6) {
  const t = tables();
  const { data, error } = await supabase
    .from(t.articles)
    .select('id,title,authors,topic,link_abs,image_url,published_at')
    .eq('topic', topic)
    .neq('id', id)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
} 