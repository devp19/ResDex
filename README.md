# Research Article Summarizer

A Node.js script that extracts and summarizes research articles using unfluff and Hugging Face's Inference API.

## Features

- ✅ Fetches research articles from various sources (arXiv, ScienceDaily, Nature, etc.)
- ✅ Extracts title, author, publication date, and full text using unfluff
- ✅ Summarizes articles using Hugging Face's facebook/bart-large-cnn model
- ✅ Limits summaries to 2-3 sentences (~130 max tokens)
- ✅ Handles invalid URLs and failed downloads gracefully
- ✅ Outputs clean JSON format

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get a Hugging Face API token:**
   - Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Create a new token with "read" permissions
   - Copy the token

3. **Create environment file:**
   ```bash
   # Create .env file
   echo "HUGGING_FACE_TOKEN=your_token_here" > .env
   ```

## Usage

### Basic Usage

```bash
node research_summarizer.js
```

### Custom URLs

Edit the `urls` array in the `main()` function:

```javascript
const urls = [
  'https://arxiv.org/abs/2401.00123',
  'https://www.sciencedaily.com/releases/2024/01/240101123456.htm',
  'https://www.nature.com/articles/s41586-024-00001-2'
];
```

### As a Module

```javascript
const { processArticles } = require('./research_summarizer');

const urls = ['https://arxiv.org/abs/2401.00123'];
const summaries = await processArticles(urls);
console.log(JSON.stringify(summaries, null, 2));
```

## Output Format

```json
[
  {
    "title": "Extracted article title",
    "summary": "2-3 sentence summary of the article content.",
    "link": "https://original-article-url.com",
    "published": "2024-01-15",
    "source": "arXiv"
  }
]
```

## Supported Sources

The script automatically detects and labels articles from:
- arXiv
- ScienceDaily
- Nature
- Science
- Cell
- PNAS
- JSTOR
- ResearchGate
- bioRxiv
- medRxiv
- And other domains (will use domain name)

## Error Handling

- Invalid URLs are skipped with warning messages
- Failed downloads are handled gracefully
- API rate limits are respected with 1-second delays
- Timeouts prevent hanging requests

## Dependencies

- `axios`: HTTP requests
- `unfluff`: Article content extraction
- `dotenv`: Environment variable management

## Requirements

- Node.js 14.0.0 or higher
- Hugging Face API token
- Internet connection

## Example Output

```
Processing 3 articles...

[1/3] Processing: https://arxiv.org/abs/2401.00123
Fetching: https://arxiv.org/abs/2401.00123
  📝 Summarizing...
  ✅ Completed: Quantum Computing Advances in Machine Learning...

[2/3] Processing: https://www.sciencedaily.com/releases/2024/01/240101123456.htm
Fetching: https://www.sciencedaily.com/releases/2024/01/240101123456.htm
  📝 Summarizing...
  ✅ Completed: New Study Reveals Breakthrough in Renewable Energy...

📊 SUMMARY RESULTS:
==================================================
[
  {
    "title": "Quantum Computing Advances in Machine Learning",
    "summary": "Researchers demonstrate significant improvements in quantum machine learning algorithms. The new approach shows 40% better performance on benchmark datasets.",
    "link": "https://arxiv.org/abs/2401.00123",
    "published": "2024-01-15",
    "source": "arXiv"
  }
]
```
