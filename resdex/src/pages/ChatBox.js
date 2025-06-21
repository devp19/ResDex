// src/pages/ChatBox.js
import { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc, getDocs, limit,
} from 'firebase/firestore';

export default function ChatBox({ recipient, currentUser, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const chatId = [currentUser.uid, recipient.uid].sort().join('_');
  const messagesRef = collection(db, 'chats', chatId, 'messages');

  // Local storage functions
  const getLocalMessages = () => {
    try {
      const stored = localStorage.getItem(`chat_${chatId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from local storage:', error);
      return [];
    }
  };

  const saveLocalMessage = (messageData) => {
    try {
      const existingMessages = getLocalMessages();
      const newMessage = {
        id: Date.now().toString(),
        ...messageData,
        timestamp: new Date().toISOString()
      };
      const updatedMessages = [...existingMessages, newMessage];
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(updatedMessages));
      return newMessage;
    } catch (error) {
      console.error('Error saving to local storage:', error);
      throw error;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser || !recipient) {
      setError('Invalid user data');
      setLoading(false);
      return;
    }

    console.log('Loading messages from local storage for chat ID:', chatId);
    
    // Load messages from local storage
    const localMessages = getLocalMessages();
    console.log('Loaded messages:', localMessages);
    
    setMessages(localMessages);
    setLoading(false);
    setError(null);
  }, [currentUser, recipient, chatId]);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
      setError('You must be logged in to send messages');
      return;
    }
    
    setSending(true);
    try {
      console.log('=== SENDING MESSAGE (LOCAL STORAGE) ===');
      console.log('Message:', message.trim());
      
      const messageData = {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.fullName || currentUser.email,
      };

      // Save to local storage
      const savedMessage = saveLocalMessage(messageData);
      console.log('✅ Message saved to local storage:', savedMessage);

      // Update messages state
      setMessages(prev => [...prev, savedMessage]);
      setMessage('');
      setError(null);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setError(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-8 w-80 bg-white border shadow-xl rounded-lg z-50" style={{
      backgroundColor: '#ffffff', 
      border: '2px solid #1a1a1a', 
      maxHeight: '900px',
      minHeight: '500px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      borderRadius: '8px'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b rounded-t-lg" style={{
        borderColor: '#1a1a1a', 
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px'
      }}>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center overflow-hidden">
            {recipient.profilePicture ? (
              <img 
                src={recipient.profilePicture} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span style={{color: '#1a1a1a', fontSize: '14px', fontWeight: 'bold'}}>
                {(recipient.fullName || recipient.displayName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white">
              {recipient.fullName || recipient.displayName || 'User'}
            </h4>
            <p className="text-xs text-white">Online</p>
          </div>
        </div>
        <div className="flex items-center">
          <button 
            onClick={onClose} 
            className="text-white hover:text-white transition-colors" 
            style={{fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer'}}
          >
            &times;
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-3" style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {error && (
          <div className="flex justify-center items-center h-full">
            <p style={{color: '#dc3545', fontSize: '12px', textAlign: 'center'}}>
              {error}
            </p>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p style={{color: '#666666', fontSize: '12px'}}>Loading...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p style={{color: '#666666', textAlign: 'center', fontSize: '12px'}}>
              No messages yet
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-2 ${msg.senderId === currentUser.uid ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg max-w-xs ${msg.senderId === currentUser.uid ? 'bg-blue-500 text-black' : 'bg-black-200 text-gray-800'}`} style={{
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <p className="text-sm break-words" style={{color: msg.senderId === currentUser.uid ? '#030000' : '#333333'}}>{msg.text}</p>
                <p className="text-xs mt-1" style={{color: msg.senderId === currentUser.uid ? '#030000' : '#030000'}}>
                  {msg.timestamp ? 
                    new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                    'Just now'
                  }
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3" style={{backgroundColor: '#f8f9fa'}}>
        <div className="flex">
          <input
            className="flex-1 border rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            style={{
              border: '1px solid #1a1a1a', 
              borderRadius: '4px 0 0 4px',
              backgroundColor: '#ffffff',
              color: '#333333'
            }}
          />
          <button
            className="text-white px-4 py-2 rounded-r text-sm font-medium transition-colors hover:opacity-90"
            onClick={sendMessage}
            disabled={!message.trim() || sending}
            style={{
              backgroundColor: (message.trim() && !sending) ? '#1a1a1a' : '#cccccc',
              borderRadius: '0 4px 4px 0',
              cursor: (message.trim() && !sending) ? 'pointer' : 'not-allowed',
              color: '#ffffff'
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
