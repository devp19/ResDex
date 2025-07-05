const axios = require('axios');
const xml2js = require('xml2js');
const Parser = require('rss-parser');

// Optional Firebase Admin initialization (only if FIREBASE_SERVICE_ACCOUNT is provided)
let admin = null;
let db = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    admin = require('firebase-admin');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Firebase Admin:', error.message);
  }
}

/**
 * Fetches research papers from arXiv API
 * @param {number} maxResults - Maximum number of results to fetch
 * @returns {Promise<Array>} Array of research papers
 */
async function fetchArxivPapers(maxResults = 5) {
  try {
    console.log(`Fetching ${maxResults} papers from arXiv...`);
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
    const papers = entries.map(entry => ({
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

    console.log(`Successfully fetched ${papers.length} papers from arXiv`);
    return papers;
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
    console.log(`Fetching ${maxResults} articles from ScienceDaily...`);
    const parser = new Parser({
      headers: {
        'User-Agent': 'ResDex-Research-Digest/1.0'
      }
    });

    const feed = await parser.parseURL('https://www.sciencedaily.com/rss/all.xml');
    
    const articles = feed.items.slice(0, maxResults).map(item => ({
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

    console.log(`Successfully fetched ${articles.length} articles from ScienceDaily`);
    return articles;
  } catch (error) {
    console.error('Error fetching ScienceDaily news:', error.message);
    return [];
  }
}

/**
 * Stores the daily digest in Firestore (if Firebase is configured)
 * @param {Array} digestData - The research digest data
 * @returns {Promise<string|null>} Document ID of the stored digest or null
 */
async function storeDailyDigest(digestData) {
  if (!db) {
    console.log('Firebase not configured, skipping Firestore storage');
    return null;
  }

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

    console.log(`Daily digest stored in Firestore for ${today}`);
    return today;
  } catch (error) {
    console.error('Error storing daily digest:', error.message);
    return null;
  }
}

/**
 * Main function to fetch and format daily research digest
 * @param {Object} options - Options for the digest
 * @returns {Promise<Object>} Formatted research digest
 */
async function fetchDailyResearchDigest(options = {}) {
  const {
    arxivCount = 3,
    scienceDailyCount = 2,
    storeInFirestore = true
  } = options;

  try {
    console.log('Starting daily research digest fetch...');

    // Fetch data from both sources
    const [arxivPapers, scienceDailyNews] = await Promise.all([
      fetchArxivPapers(arxivCount),
      fetchScienceDailyNews(scienceDailyCount)
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

    // Optionally store in Firestore
    if (storeInFirestore) {
      const docId = await storeDailyDigest(formattedDigest.articles);
      formattedDigest.storedInFirestore = !!docId;
      formattedDigest.firestoreDocId = docId;
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

// If this script is run directly
if (require.main === module) {
  const options = {
    arxivCount: parseInt(process.argv[2]) || 3,
    scienceDailyCount: parseInt(process.argv[3]) || 2,
    storeInFirestore: process.argv[4] !== 'false'
  };

  console.log('Running research digest with options:', options);
  
  fetchDailyResearchDigest(options)
    .then(result => {
      console.log('\n=== RESEARCH DIGEST RESULT ===');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  fetchDailyResearchDigest,
  fetchArxivPapers,
  fetchScienceDailyNews,
  storeDailyDigest
}; 