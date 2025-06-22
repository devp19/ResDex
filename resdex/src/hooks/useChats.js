import { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, getDoc, doc, orderBy } from 'firebase/firestore';

const useChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid), orderBy('lastMessage.timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      try {
        const chatsData = await Promise.all(querySnapshot.docs.map(async (chatDoc) => {
          const chatData = chatDoc.data();
          const recipientId = chatData.participants.find(p => p !== currentUser.uid);
          
          if (!recipientId) {
            return null;
          }

          const userDocRef = doc(db, 'users', recipientId);
          const userDoc = await getDoc(userDocRef);
          
          const recipient = userDoc.exists() ? userDoc.data() : { fullName: 'Unknown User', profilePicture: '' };

          return {
            id: chatDoc.id,
            ...chatData,
            recipient,
          };
        }));
        
        const validChats = chatsData.filter(chat => chat !== null);
        setChats(validChats);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { chats, loading, error };
};

export default useChats; 