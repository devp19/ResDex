import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Function to get AI summaries for a specific date
export const getAISummaries = async (date) => {
  try {
    const getSummaries = httpsCallable(functions, 'getSummaries');
    const result = await getSummaries({ date });
    
    if (result.data.success) {
      return result.data.summaries;
    } else {
      throw new Error('Failed to fetch summaries');
    }
  } catch (error) {
    console.error('Error fetching AI summaries:', error);
    return [];
  }
};

// Function to generate AI summaries for articles
export const generateAISummaries = async (articleUrls, date) => {
  try {
    const generateSummaries = httpsCallable(functions, 'generateSummaries');
    const result = await generateSummaries({ 
      articleUrls, 
      date: date || new Date().toISOString().split('T')[0] 
    });
    
    if (result.data.success) {
      return result.data.results;
    } else {
      throw new Error('Failed to generate summaries');
    }
  } catch (error) {
    console.error('Error generating AI summaries:', error);
    throw error;
  }
};

// Function to merge AI summaries with digest articles
export const mergeAISummariesWithArticles = (articles, summaries) => {
  if (!summaries || summaries.length === 0) {
    return articles;
  }

  // Create a map of summaries by URL for quick lookup
  const summaryMap = {};
  summaries.forEach(summary => {
    summaryMap[summary.url] = summary.aiSummary;
  });

  // Merge summaries with articles
  return articles.map(article => ({
    ...article,
    aiSummary: summaryMap[article.link] || null
  }));
};

// Function to check if an article has an AI summary
export const hasAISummary = (article) => {
  return article.aiSummary && article.aiSummary.trim().length > 0;
};

// Function to get summary statistics
export const getSummaryStats = (articles) => {
  const totalArticles = articles.length;
  const articlesWithSummaries = articles.filter(hasAISummary).length;
  const summaryPercentage = totalArticles > 0 ? Math.round((articlesWithSummaries / totalArticles) * 100) : 0;

  return {
    total: totalArticles,
    withSummaries: articlesWithSummaries,
    percentage: summaryPercentage
  };
}; 