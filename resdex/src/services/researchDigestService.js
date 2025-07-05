import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, doc, getDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Initialize Firebase Functions and Firestore
const functions = getFunctions();
const db = getFirestore();

/**
 * Fetches the daily research digest by calling the Firebase Cloud Function
 * @param {Object} options - Options for the digest
 * @returns {Promise<Object>} Research digest data
 */
export const fetchDailyResearchDigest = async (options = {}) => {
  try {
    const fetchDigest = httpsCallable(functions, 'fetchDailyResearchDigest');
    const result = await fetchDigest(options);
    return result.data;
  } catch (error) {
    console.error('Error fetching daily research digest:', error);
    throw error;
  }
};

/**
 * Fetches a specific daily digest from Firestore by date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Daily digest data or null if not found
 */
export const getDailyDigestByDate = async (date) => {
  try {
    const docRef = doc(db, 'dailyDigest', date);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching daily digest by date:', error);
    throw error;
  }
};

/**
 * Fetches the most recent daily digest from Firestore
 * @returns {Promise<Object|null>} Most recent daily digest or null if not found
 */
export const getLatestDailyDigest = async () => {
  try {
    const q = query(
      collection(db, 'dailyDigest'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching latest daily digest:', error);
    throw error;
  }
};

/**
 * Fetches multiple daily digests from Firestore
 * @param {number} limit - Maximum number of digests to fetch
 * @returns {Promise<Array>} Array of daily digest data
 */
export const getDailyDigests = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'dailyDigest'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching daily digests:', error);
    throw error;
  }
};

/**
 * Fetches today's digest, creating a new one if it doesn't exist
 * @param {Object} options - Options for creating a new digest
 * @returns {Promise<Object>} Today's digest data
 */
export const getTodaysDigest = async (options = {}) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // First try to get today's digest from Firestore
    let digest = await getDailyDigestByDate(today);
    
    // If it doesn't exist, fetch a new one
    if (!digest) {
      console.log('Today\'s digest not found, fetching new one...');
      digest = await fetchDailyResearchDigest({
        ...options,
        storeInFirestore: true
      });
    }
    
    return digest;
  } catch (error) {
    console.error('Error getting today\'s digest:', error);
    throw error;
  }
}; 