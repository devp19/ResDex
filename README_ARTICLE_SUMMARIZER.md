# Article Summarizer

A Node.js script that extracts and summarizes articles using unfluff and Hugging Face's Inference API.

## ✅ Features

- **Environment Setup**: Loads `.env` file using dotenv for API key management
- **Article Extraction**: Uses axios to fetch HTML and unfluff to parse content
- **Smart Summarization**: Uses Hugging Face's facebook/bart-large-cnn model
- **Error Handling**: Gracefully skips failed articles with detailed logging
- **Clean Output**: Returns structured JSON with all required fields

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Copy the example file
cp env.example .env

# Edit .env and add your Hugging Face API key
echo "HUGGINGFACE_API_KEY=your_actual_api_key_here" > .env
```

### 3. Run the Script
```bash
npm start
# or
node article_summarizer.js
```

## 📋 Input

The script uses a hardcoded array of article URLs. Edit the `ARTICLE_URLS` array in `article_summarizer.js`:

```javascript
const ARTICLE_URLS = [
  'https://arxiv.org/abs/2401.00123',
  'https://www.sciencedaily.com/releases/2024/01/240101123456.htm',
  'https://www.nature.com/articles/s41586-024-00001-2'
];
```

## 🔧 Article Extraction

For each URL, the script:

1. **Fetches HTML** using axios with proper User-Agent headers
2. **Parses content** using unfluff to extract:
   - `title` - Article title
   - `text` - Main article content
   - `date` - Publication date (formatted as YYYY-MM-DD)
   - `url` - Original article URL
   - `source` - Domain name (e.g., "arxiv.org")

## 🤖 Summarization

Uses Hugging Face Inference API with:
- **Model**: `facebook/bart-large-cnn`
- **Parameters**: 30-130 tokens (2-3 sentences)
- **Timeout**: 30 seconds
- **Authorization**: Bearer token from environment

## 📊 Output Format

```json
[
  {
    "title": "Extracted article title",
    "summary": "2-3 sentence summary of the article content.",
    "link": "https://original-article-url.com",
    "published": "2024-06-27",
    "source": "arxiv.org"
  }
]
```

## 🛡️ Error Handling

- **Network failures**: Logs error and skips article
- **Invalid URLs**: Gracefully handles malformed URLs
- **API failures**: Continues processing other articles
- **Missing content**: Uses fallbacks for title/text
- **Rate limiting**: 1-second delays between requests

## 🧪 Testing

Run the test script with custom URLs:

```bash
npm test
# or
node test_articles.js
```

## 📝 Example Output

```
🚀 Starting to process 3 articles...

[1/3] Processing: https://arxiv.org/abs/2401.00123
📥 Fetching: https://arxiv.org/abs/2401.00123
🤖 Summarizing article (2500 characters)...
✅ Completed: Quantum Computing Advances in Machine Learning...

[2/3] Processing: https://www.sciencedaily.com/releases/2024/01/240101123456.htm
📥 Fetching: https://www.sciencedaily.com/releases/2024/01/240101123456.htm
🤖 Summarizing article (1800 characters)...
✅ Completed: New Study Reveals Breakthrough in Renewable Energy...

📊 FINAL RESULTS:
==================================================
[
  {
    "title": "Quantum Computing Advances in Machine Learning",
    "summary": "Researchers demonstrate significant improvements in quantum machine learning algorithms. The new approach shows 40% better performance on benchmark datasets.",
    "link": "https://arxiv.org/abs/2401.00123",
    "published": "2024-01-15",
    "source": "arxiv.org"
  }
]

✅ Successfully processed 2 out of 3 articles
```

## 🔑 API Key Setup

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "read" permissions
3. Add to your `.env` file:
   ```
   HUGGINGFACE_API_KEY=your_token_here
   ```

## 📦 Dependencies

- `axios`: HTTP requests
- `unfluff`: Article content extraction
- `dotenv`: Environment variable management

## ⚙️ Configuration

Key configuration options in the script:

```javascript
const TIMEOUT = 30000; // 30 seconds timeout
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
```

## 🎯 Usage as Module

```javascript
const { processArticles } = require('./article_summarizer');

const urls = ['https://arxiv.org/abs/2401.00123'];
const results = await processArticles(urls);
console.log(JSON.stringify(results, null, 2));
```

## 🚨 Troubleshooting

- **API Key Error**: Ensure `.env` file exists with correct key
- **Network Timeouts**: Increase `TIMEOUT` value if needed
- **Rate Limiting**: Script includes 1-second delays between requests
- **Empty Results**: Check if URLs are accessible and contain extractable content 