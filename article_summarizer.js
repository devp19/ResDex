const axios = require('axios');
const unfluff = require('unfluff');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
const TIMEOUT = 30000; // 30 seconds

// Sample article URLs - replace with your actual URLs
const ARTICLE_URLS = [
  'https://arxiv.org/abs/2401.00123',
  'https://www.sciencedaily.com/releases/2024/01/240101123456.htm',
  'https://www.nature.com/articles/s41586-024-00001-2',
  'https://www.science.org/doi/10.1126/science.abc1234'
];

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
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    return null;
  }
}

// Function to extract article content using unfluff
async function extractArticle(url) {
  try {
    console.log(`📥 Fetching: ${url}`);
    
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const data = unfluff(response.data);
    
    return {
      title: data.title || 'No title found',
      text: data.text || data.description || 'No content found',
      date: formatDate(data.published),
      url: url,
      source: getSourceFromUrl(url)
    };
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error.message);
    return null;
  }
}

// Function to summarize text using Hugging Face API
async function summarizeText(text) {
  try {
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY not found in environment variables');
    }

    // Clean and prepare text for summarization
    const cleanText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 4000); // Limit to 4000 characters to avoid API limits

    if (cleanText.length < 100) {
      return 'Content too short to summarize meaningfully.';
    }

    console.log(`🤖 Summarizing article (${cleanText.length} characters)...`);

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
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: TIMEOUT
      }
    );

    if (response.data && response.data[0] && response.data[0].summary_text) {
      return response.data[0].summary_text.trim();
    } else {
      throw new Error('Invalid response format from Hugging Face API');
    }
  } catch (error) {
    console.error('❌ Error summarizing text:', error.message);
    return 'Failed to generate summary.';
  }
}

// Main function to process all articles
async function processArticles(urls) {
  const results = [];
  
  console.log(`🚀 Starting to process ${urls.length} articles...\n`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] Processing: ${url}`);
    
    try {
      // Extract article content
      const articleData = await extractArticle(url);
      
      if (!articleData) {
        console.log(`⚠️  Skipped: Failed to extract content\n`);
        continue;
      }
      
      // Summarize the text
      const summary = await summarizeText(articleData.text);
      
      // Create result object
      const result = {
        title: articleData.title,
        summary: summary,
        link: articleData.url,
        published: articleData.date,
        source: articleData.source
      };
      
      results.push(result);
      console.log(`✅ Completed: ${articleData.title.substring(0, 50)}...\n`);
      
      // Add a small delay to be respectful to APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error.message);
      console.log(`⚠️  Skipped\n`);
    }
  }
  
  return results;
}

// Main execution function
async function main() {
  try {
    // Check if API key is available
    if (!HUGGINGFACE_API_KEY) {
      console.error('❌ HUGGINGFACE_API_KEY not found in .env file');
      console.log('Please create a .env file with: HUGGINGFACE_API_KEY=your_api_key_here');
      process.exit(1);
    }

    console.log('🔑 API Key loaded successfully');
    console.log('📋 Processing articles...\n');
    
    // Process all articles
    const results = await processArticles(ARTICLE_URLS);
    
    // Print final results
    console.log('\n📊 FINAL RESULTS:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Successfully processed ${results.length} out of ${ARTICLE_URLS.length} articles`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Export functions for use as module
module.exports = {
  processArticles,
  extractArticle,
  summarizeText,
  getSourceFromUrl
};

// Run if called directly
if (require.main === module) {
  main();
} 