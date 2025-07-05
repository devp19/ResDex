# ResDex Daily Research Digest

A Firebase Cloud Function and standalone Node.js script that fetches daily research digests from arXiv and ScienceDaily, with optional Firestore storage and a React frontend component.

## Features

- **Dual Source Integration**: Fetches research papers from arXiv API and science news from ScienceDaily RSS feed
- **Firebase Cloud Functions**: Deployable as callable functions with scheduled execution
- **Standalone Script**: Can run independently without Firebase
- **Firestore Storage**: Optional storage of daily digests with date-based organization
- **React Frontend**: Modern UI component for displaying research digests
- **Error Handling**: Robust error handling and fallback mechanisms
- **Responsive Design**: Mobile-friendly interface

## Architecture

```
├── functions/                 # Firebase Cloud Functions
│   ├── index.js              # Main function exports
│   ├── researchDigest.js     # Core digest logic
│   └── package.json          # Function dependencies
├── scripts/                   # Standalone Node.js script
│   ├── researchDigest.js     # Standalone version
│   └── package.json          # Script dependencies
└── resdex/src/
    ├── services/
    │   └── researchDigestService.js  # Frontend service
    └── components/
        ├── ResearchDigest.js         # React component
        └── ResearchDigest.css        # Component styles
```

## Setup Instructions

### 1. Firebase Cloud Functions Setup

#### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created
- Node.js 18+ installed

#### Installation

1. **Navigate to the functions directory:**
   ```bash
   cd functions
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Deploy to Firebase:**
   ```bash
   firebase deploy --only functions
   ```

#### Configuration

The functions will be available as:
- `fetchDailyResearchDigest` - Callable function
- `scheduledResearchDigest` - Scheduled function (runs daily at 9 AM UTC)

### 2. Standalone Script Setup

#### Installation

1. **Navigate to the scripts directory:**
   ```bash
   cd scripts
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the script:**
   ```bash
   # Basic usage (3 arXiv + 2 ScienceDaily articles)
   npm start
   
   # Custom article counts
   node researchDigest.js 5 3
   
   # Without Firestore storage
   node researchDigest.js 3 2 false
   ```

#### Environment Variables (Optional)

For Firestore storage with the standalone script:

```bash
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### 3. Frontend Integration

#### Installation

1. **Add the service to your React app:**
   ```bash
   # Copy the service file
   cp resdex/src/services/researchDigestService.js your-app/src/services/
   ```

2. **Add the component:**
   ```bash
   # Copy the component files
   cp resdex/src/components/ResearchDigest.js your-app/src/components/
   cp resdex/src/components/ResearchDigest.css your-app/src/components/
   ```

3. **Import and use in your app:**
   ```jsx
   import ResearchDigest from './components/ResearchDigest';
   
   function App() {
     return (
       <div>
         <ResearchDigest />
       </div>
     );
   }
   ```

## API Reference

### Firebase Cloud Function

#### `fetchDailyResearchDigest(data, context)`

**Parameters:**
- `data` (Object, optional):
  - `storeInFirestore` (Boolean): Whether to store in Firestore (default: true)
  - `arxivCount` (Number): Number of arXiv articles (default: 3)
  - `scienceDailyCount` (Number): Number of ScienceDaily articles (default: 2)

**Returns:**
```json
{
  "success": true,
  "date": "2024-01-15",
  "totalArticles": 5,
  "sources": {
    "arxiv": 3,
    "scienceDaily": 2
  },
  "articles": [
    {
      "title": "Article Title",
      "link": "https://example.com",
      "authors": "Author Name",
      "publishedDate": "2024-01-15T10:00:00Z",
      "summary": "Article summary...",
      "source": "arXiv",
      "category": "AI"
    }
  ],
  "storedInFirestore": true,
  "firestoreDocId": "2024-01-15"
}
```

### Frontend Service

#### `fetchDailyResearchDigest(options)`
Calls the Firebase Cloud Function.

#### `getTodaysDigest(options)`
Gets today's digest from Firestore or creates a new one.

#### `getDailyDigestByDate(date)`
Gets a specific daily digest by date (YYYY-MM-DD format).

#### `getLatestDailyDigest()`
Gets the most recent daily digest from Firestore.

#### `getDailyDigests(limit)`
Gets multiple daily digests (default: 10).

## Data Sources

### arXiv API
- **Endpoint**: `https://export.arxiv.org/api/query`
- **Query**: `all:AI` (configurable)
- **Format**: XML response
- **Fields**: title, authors, summary, published date, link

### ScienceDaily RSS
- **Feed**: `https://www.sciencedaily.com/rss/all.xml`
- **Format**: RSS/XML
- **Fields**: title, authors, summary, published date, link

## Firestore Schema

### Collection: `dailyDigest`

#### Document: `{YYYY-MM-DD}`

```json
{
  "date": "2024-01-15",
  "timestamp": "2024-01-15T09:00:00Z",
  "articles": [
    {
      "title": "Article Title",
      "link": "https://example.com",
      "authors": "Author Name",
      "publishedDate": "2024-01-15T10:00:00Z",
      "summary": "Article summary...",
      "source": "arXiv",
      "category": "AI"
    }
  ],
  "totalArticles": 5,
  "sources": ["arXiv", "ScienceDaily"]
}
```

## Customization

### Changing Data Sources

1. **Modify arXiv query** in `researchDigest.js`:
   ```javascript
   const response = await axios.get(
     `https://export.arxiv.org/api/query?search_query=all:YOUR_QUERY&start=0&max_results=${maxResults}`
   );
   ```

2. **Add new RSS feeds** by extending the `fetchScienceDailyNews` function.

### Scheduling

The scheduled function runs daily at 9 AM UTC. To change the schedule:

```javascript
exports.scheduledResearchDigest = functions.pubsub
  .schedule('0 9 * * *')  // Cron expression
  .timeZone('UTC')
  .onRun(async (context) => {
    // Your function logic
  });
```

### Styling

Customize the appearance by modifying `ResearchDigest.css`. The component uses CSS Grid and Flexbox for responsive design.

## Error Handling

The system includes comprehensive error handling:

- **API Failures**: Graceful fallback with empty arrays
- **Firestore Errors**: Continues without storage if Firestore fails
- **Network Issues**: Retry mechanisms and timeout handling
- **Frontend Errors**: User-friendly error messages with retry options

## Performance Considerations

- **Caching**: Firestore provides automatic caching
- **Rate Limiting**: Respects API rate limits with appropriate delays
- **Data Size**: Summaries are truncated to reasonable lengths
- **Concurrent Requests**: Uses Promise.all for parallel API calls

## Monitoring

### Firebase Functions Logs
```bash
firebase functions:log
```

### Cloud Monitoring
- Function execution times
- Error rates
- Memory usage
- Cold start performance

## Troubleshooting

### Common Issues

1. **Function deployment fails**
   - Check Node.js version (requires 18+)
   - Verify Firebase project configuration
   - Check function dependencies

2. **API calls fail**
   - Verify network connectivity
   - Check API rate limits
   - Review User-Agent headers

3. **Firestore storage fails**
   - Verify Firebase Admin initialization
   - Check service account permissions
   - Review Firestore rules

4. **Frontend component errors**
   - Check Firebase configuration
   - Verify function deployment
   - Review browser console for errors

### Debug Mode

Enable debug logging by setting environment variables:

```bash
export DEBUG=true
export FIREBASE_DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Open an issue on GitHub 