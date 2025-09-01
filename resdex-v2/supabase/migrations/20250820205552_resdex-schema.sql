create extension if not exists pg_trgm;

create table if not exists public.articles (
  id             text primary key,
  version        text,
  title          text not null,
  abstract       text,
  authors        text[] default '{}',
  categories     text[] default '{}',
  topic          text,
  tag            text,
  source         text default 'arXiv' not null,
  link_abs       text,
  published_at   timestamptz,
  image_url      text,
  ai_summary     text,
  popularity     int default 0,
  created_at     timestamptz default now(),
  tsv            tsvector generated always as (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,''))
  ) stored
);

create table if not exists public.saves (
  user_id     uuid not null references auth.users(id) on delete cascade,
  article_id  text not null references public.articles(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (user_id, article_id)
);

create table if not exists public.article_events (
  id          bigserial primary key,
  article_id  text not null references public.articles(id) on delete cascade,
  kind        text not null check (kind in ('view','click','save')),
  user_id     uuid,
  created_at  timestamptz default now()
);

create table if not exists public.daily_digest_items (
  day         date not null,
  rank        int  not null,
  article_id  text not null references public.articles(id) on delete cascade,
  topic       text,
  primary key (day, rank)
);

create index if not exists articles_published_idx on public.articles (published_at desc);
create index if not exists articles_topic_idx     on public.articles (topic);
create index if not exists articles_tsv_idx       on public.articles using gin (tsv);
create index if not exists articles_cats_gin      on public.articles using gin (categories);
create index if not exists articles_title_trgm    on public.articles using gin (title gin_trgm_ops);

create index if not exists events_article_idx     on public.article_events (article_id);
create index if not exists events_kind_idx        on public.article_events (kind);
create index if not exists digest_day_idx         on public.daily_digest_items (day);

alter table public.articles enable row level security;
alter table public.saves    enable row level security;
alter table public.article_events enable row level security;
alter table public.daily_digest_items enable row level security;

create policy "articles: read" on public.articles for select using (true);
create policy "digest: read"   on public.daily_digest_items for select using (true);

create policy "saves: read own"   on public.saves for select using (auth.uid() = user_id);
create policy "saves: insert own" on public.saves for insert with check (auth.uid() = user_id);
create policy "saves: delete own" on public.saves for delete using (auth.uid() = user_id);

create policy "events: insert" on public.article_events for insert to anon, authenticated with check (true);
create policy "events: no read" on public.article_events for select using (false);

create or replace function public.recompute_popularity(p_hours int default 48)
returns void language sql as $$
  with recent as (
    select article_id,
           sum(case when kind='click' then 2
                    when kind='save'  then 3
                    when kind='view'  then 1 else 0 end) as score
    from article_events
    where created_at >= now() - (p_hours || ' hours')::interval
    group by article_id
  )
  update articles a
     set popularity = coalesce(r.score, 0)
    from recent r
   where a.id = r.article_id;
$$;

create or replace function public.build_daily_digest(p_day date, p_per_topic int default 6)
returns void language plpgsql as $$
begin
  delete from daily_digest_items where day = p_day;

  insert into daily_digest_items (day, rank, article_id, topic)
  select p_day, rnk, id, topic
  from (
    select a.*,
           row_number() over (
             partition by a.topic
             order by a.popularity desc nulls last, a.published_at desc nulls last
           ) as rnk
    from articles a
    where a.published_at >= (p_day::timestamptz - interval '36 hours')
      and a.published_at <  (p_day::timestamptz + interval '12 hours')
  ) x
  where x.rnk <= p_per_topic
  order by topic, rnk;
end;
$$;
