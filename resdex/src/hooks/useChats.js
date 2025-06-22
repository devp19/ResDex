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
    // Query for chats where the current user is a participant
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

    console.log('🔍 Setting up chat listener for user:', currentUser.uid);

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      try {
        console.log('📋 Chat snapshot received, docs count:', querySnapshot.docs.length);
        
        const chatsData = await Promise.all(querySnapshot.docs.map(async (chatDoc) => {
          const chatData = chatDoc.data();
          console.log('📄 Chat document data:', chatDoc.id, chatData);
          
          const recipientId = chatData.participants.find(p => p !== currentUser.uid);
          
          if (!recipientId) {
            console.warn('⚠️ Chat document missing recipient ID:', chatDoc.id, 'participants:', chatData.participants);
            return null;
          }

          try {
            const userDocRef = doc(db, 'users', recipientId);
            const userDoc = await getDoc(userDocRef);
            
            let recipient;
            if (userDoc.exists()) {
              const userData = userDoc.data();
              recipient = {
                uid: recipientId,
                fullName: userData.fullName || userData.displayName || userData.username || 'Unknown User',
                profilePicture: userData.profilePicture || '',
                username: userData.username || 'unknown'
              };
            } else {
              console.warn('⚠️ User document not found for recipient:', recipientId);
              recipient = {
                uid: recipientId,
                fullName: 'Unknown User',
                profilePicture: '',
                username: 'unknown'
              };
            }

            const chat = {
              id: chatDoc.id,
              ...chatData,
              recipient,
            };
            
            console.log('✅ Processed chat:', chat.id, 'recipient:', recipient.fullName);
            return chat;
          } catch (userError) {
            console.error('❌ Error fetching user document for recipient:', recipientId, userError);
            // Return a chat with fallback recipient data instead of null
            return {
              id: chatDoc.id,
              ...chatData,
              recipient: {
                uid: recipientId,
                fullName: 'Unknown User',
                profilePicture: '',
                username: 'unknown'
              },
            };
          }
        }));
        
        const validChats = chatsData.filter(chat => chat !== null);
        
        // Sort chats by lastMessage timestamp (newest first), with chats without lastMessage at the end
        validChats.sort((a, b) => {
          const aTimestamp = a.lastMessage?.timestamp || a.createdAt || '1970-01-01T00:00:00.000Z';
          const bTimestamp = b.lastMessage?.timestamp || b.createdAt || '1970-01-01T00:00:00.000Z';
          return new Date(bTimestamp) - new Date(aTimestamp);
        });
        
        console.log('📊 Final chats list:', validChats.length, 'chats');
        validChats.forEach(chat => {
          console.log('  - Chat:', chat.id, 'Recipient:', chat.recipient.fullName, 'Participants:', chat.participants);
        });
        
        setChats(validChats);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error in useChats hook:', err);
        setError(err);
        setLoading(false);
      }
    }, (err) => {
      console.error('❌ Error in onSnapshot:', err);
      setError(err);
      setLoading(false);
    });

    return () => {
      console.log('🔌 Cleaning up chat listener');
      unsubscribe();
    };
  }, []);

  return { chats, loading, error };
};

export default useChats; 