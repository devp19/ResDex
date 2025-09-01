import { supabase } from './supabase';
import { tables } from './tables';

export async function trackEvent(article_id: string, kind: 'view'|'click'|'save', user_id?: string) {
  const t = tables();
  await supabase.from(t.articleEvents).insert({ article_id, kind, user_id: user_id ?? null });
} 