// src/lib/tables.ts
export function tablePrefix() {
  // Always use dev_ prefix since that's what the Supabase tables are named
  return 'dev_';
}

export function tables() {
  const p = tablePrefix();
  return {
    articles: `${p}articles`,
    digest: `${p}daily_digest_items`,
    articleEvents: `${p}article_events`,
    rpcBuildDigest: `${p}build_daily_digest`,
    rpcRecompute: `${p}recompute_popularity`,
  };
} 