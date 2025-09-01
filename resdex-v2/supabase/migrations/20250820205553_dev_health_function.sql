-- Create RPC function for dev table health counts
CREATE OR REPLACE FUNCTION public.dev_get_health_counts()
RETURNS TABLE(
  dev_articles_count bigint,
  dev_latest_article_date timestamptz,
  dev_digest_items_count bigint,
  dev_events_count bigint,
  dev_saves_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    (SELECT count(*) FROM public.dev_articles) as dev_articles_count,
    (SELECT max(published_at) FROM public.dev_articles) as dev_latest_article_date,
    (SELECT count(*) FROM public.dev_daily_digest_items) as dev_digest_items_count,
    (SELECT count(*) FROM public.dev_article_events) as dev_events_count,
    (SELECT count(*) FROM public.dev_saves) as dev_saves_count;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.dev_get_health_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.dev_get_health_counts() TO anon; 