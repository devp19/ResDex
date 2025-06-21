# Google Docs Integration Setup

This guide explains how to set up Google Docs API integration for ResDex.

## Prerequisites

1. Google Cloud Console account
2. Firebase project (already configured)

## Setup Steps

### 1. Enable Google Docs API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Library"
4. Search for "Google Docs API"
5. Click on it and press "Enable"

### 2. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add your domain to authorized origins (e.g., `http://localhost:3000` for development)
7. Add authorized redirect URIs (e.g., `http://localhost:3000`)
8. Copy the Client ID

### 3. Configure Environment Variables

Add these to your `.env` file:

```env
# Google API Configuration
REACT_APP_GOOGLE_API_KEY=your_google_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 4. API Key Restrictions (Recommended)

1. Go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers"
4. Add your domain(s)
5. Under "API restrictions", select "Restrict key"
6. Select "Google Docs API"

## How It Works

1. User clicks "Upload Research" in profile
2. User navigates to Create page
3. User fills out research form and submits
4. System checks if user is authenticated with Google
5. If not authenticated, shows authentication modal
6. Creates Google Doc with research title and structured content
7. Stores Google Doc URL in Firebase
8. User can click link to open the created document

## Document Structure

The created Google Doc includes:
- Research title as document title
- Author information
- Creation date
- Research description
- Selected topics/interests
- Collaborators list
- ResDex branding

## Troubleshooting

### Common Issues

1. **"API key not valid"**: Check your API key and restrictions
2. **"Client ID not found"**: Verify your OAuth client ID
3. **"Access denied"**: Ensure Google Docs API is enabled
4. **"Authentication failed"**: Check OAuth redirect URIs

### Development vs Production

- Development: Use `http://localhost:3000` in authorized origins
- Production: Use your actual domain in authorized origins

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Restrict API keys to specific domains and APIs
- Regularly rotate API keys 