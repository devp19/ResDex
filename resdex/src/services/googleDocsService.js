// Google Docs API Service
// This service handles creating Google Docs documents when research is submitted

class GoogleDocsService {
  constructor() {
    this.API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
    this.CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    this.SCOPES = ['https://www.googleapis.com/auth/documents'];
    this.DISCOVERY_DOC = 'https://docs.googleapis.com/$discovery/rest?version=v1';
    this.tokenClient = null;
    this.gapiInited = false;
    this.gisInited = false;
    this.accessToken = null;
  }

  // Initialize Google API
  async initialize() {
    try {
      // Load the Google API client
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // Load the Google Identity Services
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      await this.initializeGapi();
      await this.initializeGis();
      
      return true;
    } catch (error) {
      console.error('Error initializing Google Docs API:', error);
      return false;
    }
  }

  // Initialize Google API client
  async initializeGapi() {
    return new Promise((resolve) => {
      // eslint-disable-next-line no-undef
      gapi.load('client', async () => {
        // eslint-disable-next-line no-undef
        await gapi.client.init({
          apiKey: this.API_KEY,
          discoveryDocs: [this.DISCOVERY_DOC],
        });
        this.gapiInited = true;
        resolve();
      });
    });
  }

  // Initialize Google Identity Services with redirect flow
  async initializeGis() {
    // eslint-disable-next-line no-undef
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES.join(' '),
      callback: '', // Will be set when making requests
      prompt: 'consent',
      ux_mode: 'popup', // This will be overridden by our custom flow
    });
    this.gisInited = true;
  }

  // Get access token using redirect flow to avoid COOP issues
  async getAccessToken() {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }

      // Check if we already have a valid token
      if (this.accessToken) {
        resolve(this.accessToken);
        return;
      }

      this.tokenClient.callback = (resp) => {
        if (resp.error) {
          console.error('OAuth error:', resp.error);
          if (resp.error === 'popup_closed_by_user') {
            reject(new Error('Authentication was cancelled by user'));
          } else if (resp.error === 'access_denied') {
            reject(new Error('Access was denied. Please try again.'));
          } else {
            reject(new Error(`Authentication failed: ${resp.error}`));
          }
        } else {
          this.accessToken = resp.access_token;
          resolve(resp.access_token);
        }
      };

      try {
        // Use a more direct approach to avoid popup issues
        this.tokenClient.requestAccessToken({ 
          prompt: 'consent',
          hint: 'user@example.com' // This can help with some authentication flows
        });
      } catch (error) {
        console.error('Error requesting access token:', error);
        reject(new Error('Failed to request access token. Please check your browser settings.'));
      }
    });
  }

  // Alternative authentication method using direct OAuth flow
  async authenticateWithRedirect() {
    const redirectUri = window.location.origin + window.location.pathname;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(this.SCOPES.join(' '))}&` +
      `response_type=token&` +
      `prompt=consent`;

    // Store the current state to restore after redirect
    sessionStorage.setItem('googleAuthPending', 'true');
    sessionStorage.setItem('googleAuthReturnUrl', window.location.href);

    // Redirect to Google OAuth
    window.location.href = authUrl;
  }

  // Handle OAuth redirect response
  handleAuthRedirect() {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        this.accessToken = accessToken;
        sessionStorage.removeItem('googleAuthPending');
        
        // Redirect back to the original page
        const returnUrl = sessionStorage.getItem('googleAuthReturnUrl') || '/create';
        window.location.href = returnUrl;
        return true;
      }
    }
    return false;
  }

  // Create a new Google Doc
  async createDocument(title, content = '') {
    try {
      if (!this.gapiInited || !this.gisInited) {
        await this.initialize();
      }

      const accessToken = await this.getAccessToken();

      const document = {
        title: title,
        body: {
          content: [
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: content || 'Research document created by ResDex\n\n',
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      // eslint-disable-next-line no-undef
      const response = await gapi.client.docs.documents.create({
        resource: document,
      });

      return {
        success: true,
        documentId: response.result.documentId,
        documentUrl: `https://docs.google.com/document/d/${response.result.documentId}/edit`,
        title: response.result.title,
      };
    } catch (error) {
      console.error('Error creating Google Doc:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Authentication was cancelled')) {
        return {
          success: false,
          error: 'Authentication was cancelled. Please try again.',
        };
      } else if (error.message.includes('Access was denied')) {
        return {
          success: false,
          error: 'Access was denied. Please check your Google account permissions.',
        };
      } else if (error.message.includes('popup')) {
        return {
          success: false,
          error: 'Popup was blocked. Please allow popups for this site and try again.',
        };
      } else {
        return {
          success: false,
          error: error.message || 'Failed to create Google Doc. Please try again.',
        };
      }
    }
  }

  // Create a research document with structured content
  async createResearchDocument(researchData) {
    const { title, description, interests, collaborators, author } = researchData;
    
    const content = `
Research Document: ${title}

Author: ${author}
Created: ${new Date().toLocaleDateString()}

Description:
${description}

Research Interests:
${interests.map(interest => `• ${interest}`).join('\n')}

Collaborators:
${collaborators.length > 0 ? collaborators.map(collaborator => `• ${collaborator}`).join('\n') : 'No collaborators assigned'}

---
Document created via ResDex Research Platform
    `.trim();

    return await this.createDocument(title, content);
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      if (!this.gapiInited || !this.gisInited) {
        await this.initialize();
      }
      
      // Check if we have a stored token
      if (this.accessToken) {
        return true;
      }
      
      // Try to get access token to check authentication
      await this.getAccessToken();
      return true;
    } catch (error) {
      console.log('User not authenticated:', error.message);
      return false;
    }
  }

  // Sign out user
  async signOut() {
    try {
      this.accessToken = null;
      // eslint-disable-next-line no-undef
      const token = gapi.auth.getToken();
      if (token) {
        // eslint-disable-next-line no-undef
        await google.accounts.oauth2.revoke(token.access_token);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}

export default new GoogleDocsService(); 