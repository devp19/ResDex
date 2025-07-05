const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Import the research digest function
const { fetchDailyResearchDigest } = require('./researchDigest');

// Export the function as a callable function
exports.fetchDailyResearchDigest = functions.https.onCall(fetchDailyResearchDigest);

// Export as a scheduled function (runs every 24 hours at 9 AM UTC)
exports.scheduledResearchDigest = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const result = await fetchDailyResearchDigest();
      console.log('Scheduled research digest completed:', result);
      return result;
    } catch (error) {
      console.error('Scheduled research digest failed:', error);
      throw error;
    }
  }); 