import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'nodejs';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function torontoDay(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'America/Toronto', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  const parts = fmt.formatToParts(date);
  const y = parts.find(p => p.type === 'year')!.value;
  const m = parts.find(p => p.type === 'month')!.value;
  const d = parts.find(p => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

export async function POST() {
  try {
    const today = torontoDay();
    const yesterday = torontoDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

    console.log('Building digest for:', { today, yesterday });

    // First, let's see what categories are available
    const { data: allArticles } = await supabase
      .from('dev_articles')
      .select('topic')
      .not('topic', 'is', null);

    const categoryCounts: Record<string, number> = {};
    allArticles?.forEach(article => {
      if (article.topic) {
        const topic = article.topic.trim();
        categoryCounts[topic] = (categoryCounts[topic] || 0) + 1;
      }
    });

    console.log('Available categories:', Object.keys(categoryCounts));
    console.log('Category counts:', categoryCounts);

    // Build digest for yesterday and today using the standard function
    const { error: error1 } = await supabase.rpc('build_daily_digest', { 
      p_day: yesterday, 
      p_per_topic: 6 
    });
    
    const { error: error2 } = await supabase.rpc('build_daily_digest', { 
      p_day: today, 
      p_per_topic: 6 
    });

    if (error1 || error2) {
      console.error('Digest building errors:', { error1, error2 });
      return NextResponse.json({ 
        success: false, 
        errors: { error1, error2 },
        days: { yesterday, today }
      }, { status: 500 });
    }

    // Also build a comprehensive digest that includes articles from all categories
    // This ensures we have variety even if recent articles are limited
    await buildComprehensiveDigest(today);

    // Get counts after building
    const { count: yesterdayCount } = await supabase
      .from('dev_daily_digest_items')
      .select('*', { count: 'exact', head: true })
      .eq('day', yesterday);

    const { count: todayCount } = await supabase
      .from('dev_daily_digest_items')
      .select('*', { count: 'exact', head: true })
      .eq('day', today);

    // Get digest items to see what categories made it in
    const { data: digestItems } = await supabase
      .from('dev_daily_digest_items')
      .select('topic')
      .in('day', [yesterday, today]);

    const digestCategories = [...new Set(digestItems?.map(item => item.topic).filter(Boolean))];

    return NextResponse.json({
      success: true,
      days: { yesterday, today },
      counts: { yesterday: yesterdayCount || 0, today: todayCount || 0 },
      availableCategories: Object.keys(categoryCounts).sort(),
      digestCategories: digestCategories.sort(),
      categoryCounts: Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
    });

  } catch (error) {
    console.error('Build digest error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Custom function to build a comprehensive digest with articles from all categories
async function buildComprehensiveDigest(day: string) {
  try {
    // Get all available categories
    const { data: categories } = await supabase
      .from('dev_articles')
      .select('topic')
      .not('topic', 'is', null);

    const uniqueCategories = [...new Set(categories?.map(c => c.topic).filter(Boolean))];
    console.log('Building comprehensive digest for categories:', uniqueCategories);

    // For each category, get the top articles
    for (const category of uniqueCategories) {
      const { data: topArticles } = await supabase
        .from('dev_articles')
        .select('id, topic')
        .eq('topic', category)
        .order('popularity', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(3); // Get top 3 articles per category

      if (topArticles && topArticles.length > 0) {
        // Insert into digest items
        for (let i = 0; i < topArticles.length; i++) {
          const article = topArticles[i];
          await supabase
            .from('dev_daily_digest_items')
            .upsert({
              day,
              rank: i + 1,
              article_id: article.id,
              topic: article.topic
            }, { onConflict: 'day,rank' });
        }
      }
    }
  } catch (error) {
    console.error('Error building comprehensive digest:', error);
  }
}
