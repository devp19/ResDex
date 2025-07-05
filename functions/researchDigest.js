const axios = require('axios');
const xml2js = require('xml2js');
const Parser = require('rss-parser');

// Initialize Firestore
const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Fetches research papers from arXiv API
 * @param {number} maxResults - Maximum number of results to fetch
 * @returns {Promise<Array>} Array of research papers
 */
async function fetchArxivPapers(maxResults = 5) {
  try {
    const response = await axios.get(
      `https://export.arxiv.org/api/query?search_query=all:AI&start=0&max_results=${maxResults}`,
      {
        headers: {
          'User-Agent': 'ResDex-Research-Digest/1.0'
        }
      }
    );

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    const entries = result.feed.entry || [];
    return entries.map(entry => ({
      title: entry.title?.replace(/\s+/g, ' ').trim() || 'No title available',
      link: entry.id || '',
      authors: entry.author ? 
        (Array.isArray(entry.author) ? 
          entry.author.map(author => author.name).join(', ') : 
          entry.author.name) : 
        'Unknown authors',
      publishedDate: entry.published || entry.updated || new Date().toISOString(),
      summary: entry.summary?.replace(/\s+/g, ' ').trim() || 'No summary available',
      source: 'arXiv',
      category: entry.category || 'AI'
    }));
  } catch (error) {
    console.error('Error fetching arXiv papers:', error.message);
    return [];
  }
}

/**
 * Fetches science news from ScienceDaily RSS feed
 * @param {number} maxResults - Maximum number of results to fetch
 * @returns {Promise<Array>} Array of science news articles
 */
async function fetchScienceDailyNews(maxResults = 5) {
  try {
    const parser = new Parser({
      headers: {
        'User-Agent': 'ResDex-Research-Digest/1.0'
      }
    });

    const feed = await parser.parseURL('https://www.sciencedaily.com/rss/all.xml');
    
    return feed.items.slice(0, maxResults).map(item => ({
      title: item.title?.replace(/\s+/g, ' ').trim() || 'No title available',
      link: item.link || '',
      authors: item.creator || item.author || 'ScienceDaily Staff',
      publishedDate: item.pubDate || item.isoDate || new Date().toISOString(),
      summary: item.contentSnippet?.replace(/\s+/g, ' ').trim() || 
               item.content?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || 
               'No summary available',
      source: 'ScienceDaily',
      category: 'Science News'
    }));
  } catch (error) {
    console.error('Error fetching ScienceDaily news:', error.message);
    return [];
  }
}

/**
 * Stores the daily digest in Firestore
 * @param {Array} digestData - The research digest data
 * @returns {Promise<string>} Document ID of the stored digest
 */
async function storeDailyDigest(digestData) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const docRef = db.collection('dailyDigest').doc(today);
    
    await docRef.set({
      date: today,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      articles: digestData,
      totalArticles: digestData.length,
      sources: [...new Set(digestData.map(item => item.source))]
    });

    console.log(`Daily digest stored for ${today}`);
    return today;
  } catch (error) {
    console.error('Error storing daily digest:', error.message);
    throw error;
  }
}

/**
 * Main function to fetch and format daily research digest
 * @param {Object} data - Callable function data (optional)
 * @param {Object} context - Callable function context
 * @returns {Promise<Object>} Formatted research digest
 */
async function fetchDailyResearchDigest(data = {}, context) {
  try {
    console.log('Starting daily research digest fetch...');

    // Fetch data from both sources
    const [arxivPapers, scienceDailyNews] = await Promise.all([
      fetchArxivPapers(3),
      fetchScienceDailyNews(2)
    ]);

    // Combine and format the results
    const digestData = [...arxivPapers, ...scienceDailyNews];

    // Sort by published date (newest first)
    digestData.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));

    // Format the response
    const formattedDigest = {
      success: true,
      date: new Date().toISOString().split('T')[0],
      totalArticles: digestData.length,
      sources: {
        arxiv: arxivPapers.length,
        scienceDaily: scienceDailyNews.length
      },
      articles: digestData.map(article => ({
        title: article.title,
        link: article.link,
        authors: article.authors,
        publishedDate: article.publishedDate,
        summary: article.summary,
        source: article.source,
        category: article.category
      }))
    };

    // Optionally store in Firestore (if requested or if it's a scheduled run)
    if (data.storeInFirestore !== false) {
      try {
        const docId = await storeDailyDigest(formattedDigest.articles);
        formattedDigest.storedInFirestore = true;
        formattedDigest.firestoreDocId = docId;
      } catch (storeError) {
        console.warn('Failed to store in Firestore, but continuing:', storeError.message);
        formattedDigest.storedInFirestore = false;
      }
    }

    console.log(`Daily research digest completed: ${formattedDigest.totalArticles} articles`);
    return formattedDigest;

  } catch (error) {
    console.error('Error in fetchDailyResearchDigest:', error);
    return {
      success: false,
      error: error.message,
      date: new Date().toISOString().split('T')[0],
      totalArticles: 0,
      articles: []
    };
  }
}

module.exports = {
  fetchDailyResearchDigest,
  fetchArxivPapers,
  fetchScienceDailyNews,
  storeDailyDigest
}; 