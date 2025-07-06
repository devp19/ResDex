const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const unfluff = require('unfluff');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Hugging Face API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
const HF_API_TOKEN = functions.config().huggingface?.api_key;

// Helper function to extract domain from URL
function getSourceFromUrl(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return domain.replace('www.', '');
  } catch (error) {
    return 'unknown';
  }
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch (error) {
    return null;
  }
}

// Function to extract article content using unfluff
async function extractArticleContent(url) {
  try {
    console.log(`Fetching: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const data = unfluff(response.data);
    
    return {
      title: data.title || 'No title found',
      text: data.text || data.description || 'No content found',
      date: formatDate(data.published),
      source: getSourceFromUrl(url)
    };
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

// Function to summarize text using Hugging Face API
async function summarizeText(text) {
  try {
    if (!HF_API_TOKEN) {
      throw new Error('HUGGINGFACE_API_KEY not found in environment variables');
    }

    // Clean and prepare text for summarization
    const cleanText = text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 4000);

    if (cleanText.length < 100) {
      return 'Content too short to summarize meaningfully.';
    }

    console.log(`Summarizing article (${cleanText.length} characters)...`);

    const response = await axios.post(
      HF_API_URL,
      {
        inputs: cleanText,
        parameters: {
          max_length: 130,
          min_length: 30,
          do_sample: false,
          num_beams: 4,
          early_stopping: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (response.data && response.data[0] && response.data[0].summary_text) {
      return response.data[0].summary_text.trim();
    } else {
      throw new Error('Invalid response format from Hugging Face API');
    }
  } catch (error) {
    console.error('Error summarizing text:', error.message);
    return 'Failed to generate summary.';
  }
}

// Firebase function to generate summaries for articles
exports.generateSummaries = functions.https.onCall(async (data, context) => {
  try {
    const { articleUrls, date } = data;
    
    if (!articleUrls || !Array.isArray(articleUrls)) {
      throw new functions.https.HttpsError('invalid-argument', 'articleUrls must be an array');
    }

    if (!HF_API_TOKEN) {
      throw new functions.https.HttpsError('failed-precondition', 'Hugging Face API key not configured');
    }

    console.log(`Generating summaries for ${articleUrls.length} articles on ${date}`);

    const results = [];
    const summaryDate = date || new Date().toISOString().split('T')[0];

    for (let i = 0; i < articleUrls.length; i++) {
      const url = articleUrls[i];
      console.log(`[${i + 1}/${articleUrls.length}] Processing: ${url}`);
      
      try {
        // Extract article content
        const articleData = await extractArticleContent(url);
        
        if (!articleData) {
          console.log(`Skipped: Failed to extract content from ${url}`);
          continue;
        }
        
        // Generate summary
        const summary = await summarizeText(articleData.text);
        
        // Create result object
        const result = {
          url: url,
          title: articleData.title,
          aiSummary: summary,
          source: articleData.source,
          published: articleData.date,
          processedAt: new Date().toISOString()
        };
        
        results.push(result);
        
        // Store in Firestore
        const summaryRef = db.collection('dailyDigest').doc(summaryDate).collection('summaries');
        await summaryRef.doc(url.replace(/[^a-zA-Z0-9]/g, '_')).set(result);
        
        console.log(`Completed: ${articleData.title.substring(0, 50)}...`);
        
        // Add delay to be respectful to APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing ${url}:`, error.message);
      }
    }

    console.log(`Successfully processed ${results.length} out of ${articleUrls.length} articles`);
    
    return {
      success: true,
      processed: results.length,
      total: articleUrls.length,
      results: results
    };

  } catch (error) {
    console.error('Function error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Firebase function to get summaries for a specific date
exports.getSummaries = functions.https.onCall(async (data, context) => {
  try {
    const { date } = data;
    const summaryDate = date || new Date().toISOString().split('T')[0];

    console.log(`Fetching summaries for ${summaryDate}`);

    const summariesRef = db.collection('dailyDigest').doc(summaryDate).collection('summaries');
    const snapshot = await summariesRef.get();

    const summaries = [];
    snapshot.forEach(doc => {
      summaries.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      date: summaryDate,
      count: summaries.length,
      summaries: summaries
    };

  } catch (error) {
    console.error('Function error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Scheduled function to generate summaries daily (optional)
exports.scheduledSummaries = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    console.log('Running scheduled summary generation');
    
    // This would typically fetch articles from your digest source
    // For now, we'll just log that the function ran
    console.log('Scheduled summary generation completed');
    
    return null;
  } catch (error) {
    console.error('Scheduled function error:', error);
    return null;
  }
}); 