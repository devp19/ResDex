// src/lib/tables.ts
export function tablePrefix() {
  return process.env.NEXT_PUBLIC_USE_DEV === '1' ? 'dev_' : '';
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