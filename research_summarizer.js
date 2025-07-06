const axios = require('axios');
const unfluff = require('unfluff');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Hugging Face Inference API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
const HF_API_TOKEN = process.env.HUGGING_FACE_TOKEN;

// Helper function to extract domain name for source identification
function getSourceFromUrl(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes('arxiv.org')) return 'arXiv';
    if (domain.includes('sciencedaily.com')) return 'ScienceDaily';
    if (domain.includes('nature.com')) return 'Nature';
    if (domain.includes('science.org')) return 'Science';
    if (domain.includes('cell.com')) return 'Cell';
    if (domain.includes('pnas.org')) return 'PNAS';
    if (domain.includes('jstor.org')) return 'JSTOR';
    if (domain.includes('researchgate.net')) return 'ResearchGate';
    if (domain.includes('biorxiv.org')) return 'bioRxiv';
    if (domain.includes('medrxiv.org')) return 'medRxiv';
    return domain.replace('www.', '');
  } catch (error) {
    return 'Unknown';
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
async function extractArticleContent(url) {
  try {
    console.log(`Fetching: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const data = unfluff(response.data);
    
    return {
      title: data.title || 'No title found',
      author: data.author || null,
      published: formatDate(data.published),
      text: data.text || data.description || 'No content found'
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
      throw new Error('HUGGING_FACE_TOKEN not found in environment variables');
    }

    // Clean and prepare text for summarization
    const cleanText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 4000); // Limit to 4000 characters to avoid API limits

    if (cleanText.length < 100) {
      return 'Content too short to summarize meaningfully.';
    }

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
        timeout: 60000 // 60 second timeout for API call
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

// Main function to process articles
async function processArticles(urls) {
  const results = [];
  
  console.log(`Processing ${urls.length} articles...\n`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] Processing: ${url}`);
    
    try {
      // Extract article content
      const articleData = await extractArticleContent(url);
      
      if (!articleData) {
        console.log(`  ⚠️  Skipped: Failed to extract content\n`);
        continue;
      }
      
      // Summarize the text
      console.log(`  📝 Summarizing...`);
      const summary = await summarizeText(articleData.text);
      
      // Create result object
      const result = {
        title: articleData.title,
        summary: summary,
        link: url,
        published: articleData.published,
        source: getSourceFromUrl(url)
      };
      
      results.push(result);
      console.log(`  ✅ Completed: ${articleData.title.substring(0, 50)}...\n`);
      
      // Add a small delay to be respectful to APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ❌ Error processing ${url}:`, error.message);
      console.log(`  ⚠️  Skipped\n`);
    }
  }
  
  return results;
}

// Example usage
async function main() {
  // Example URLs - replace with your actual URLs
  const urls = [
    'https://arxiv.org/abs/2401.00123',
    'https://www.sciencedaily.com/releases/2024/01/240101123456.htm',
    'https://www.nature.com/articles/s41586-024-00001-2'
  ];
  
  try {
    const summaries = await processArticles(urls);
    
    console.log('\n📊 SUMMARY RESULTS:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(summaries, null, 2));
    
  } catch (error) {
    console.error('Error in main process:', error.message);
  }
}

// Export functions for use as module
module.exports = {
  processArticles,
  extractArticleContent,
  summarizeText,
  getSourceFromUrl
};

// Run if called directly
if (require.main === module) {
  main();
} 