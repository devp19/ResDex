// src/pages/ChatBox.js
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import "react-image-crop/dist/ReactCrop.css";

export default function ChatBox({ recipient, currentUser, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatId = [currentUser.uid, recipient.uid].sort().join('_');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing messages from server when component mounts
  useEffect(() => {
    if (!currentUser || !recipient) {
      setLoading(false);
      return;
    }

    const loadMessages = async () => {
      try {
        console.log('📚 Loading messages from server for chat:', chatId);
        
        // Fetch messages from server
        const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5001';
        const response = await fetch(`${serverUrl}/api/chats/${chatId}/messages`);
        if (response.ok) {
          const serverMessages = await response.json();
          console.log('📨 Loaded messages from server:', serverMessages);
          
          // Also check localStorage as backup
          const storedMessages = localStorage.getItem(`chat_${chatId}`);
          let localMessages = [];
          if (storedMessages) {
            try {
              localMessages = JSON.parse(storedMessages);
            } catch (error) {
              console.error('Error parsing stored messages:', error);
            }
          }
          
          // Merge server and local messages, preferring server messages
          const allMessages = [...serverMessages, ...localMessages];
          const uniqueMessages = allMessages.filter((msg, index, self) => 
            index === self.findIndex(m => m.id === msg.id)
          );
          
          // Sort by timestamp
          uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          setMessages(uniqueMessages);
          
          // Update localStorage with merged messages
          localStorage.setItem(`chat_${chatId}`, JSON.stringify(uniqueMessages));
        } else {
          console.error('Failed to fetch messages from server');
          // Fallback to localStorage only
          const storedMessages = localStorage.getItem(`chat_${chatId}`);
          if (storedMessages) {
            try {
              const parsedMessages = JSON.parse(storedMessages);
              setMessages(parsedMessages);
            } catch (error) {
              console.error('Error parsing stored messages:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Fallback to localStorage only
        const storedMessages = localStorage.getItem(`chat_${chatId}`);
        if (storedMessages) {
          try {
            const parsedMessages = JSON.parse(storedMessages);
            setMessages(parsedMessages);
          } catch (error) {
            console.error('Error parsing stored messages:', error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId, currentUser, recipient]);

  // Initialize Socket.IO connection
  useEffect(() => {
    console.log('🔍 Debug - ChatBox initialized with:', {
      currentUser: currentUser ? { uid: currentUser.uid, email: currentUser.email } : null,
      recipient: recipient ? { uid: recipient.uid, fullName: recipient.fullName } : null,
      chatId
    });

    console.log('🔌 Connecting to Socket.IO server...');
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'https://resdex.onrender.com';
    console.log('🌐 Server URL:', serverUrl);
    
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    
    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      setIsConnected(true);
      setError(null);
      
      // Join the private chat room
      newSocket.emit('join', {
        userId: currentUser.uid,
        username: currentUser.displayName || currentUser.fullName || currentUser.email,
        chatId: chatId
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      setError(`Connection failed: ${error.message}`);
      setIsConnected(false);
      
      // Try to provide helpful error messages
      if (error.message.includes('xhr poll error')) {
        setError('Unable to connect to chat server. Please check your internet connection or try again later.');
      } else if (error.message.includes('timeout')) {
        setError('Connection timeout. The server might be starting up. Please try again in a moment.');
      } else {
        setError(`Connection error: ${error.message}`);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    newSocket.on('message', (messageData) => {
      console.log('📨 Received message:', messageData);
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === messageData.id);
        if (!exists) {
          const updatedMessages = [...prev, messageData];
          // Update localStorage
          localStorage.setItem(`chat_${chatId}`, JSON.stringify(updatedMessages));
          return updatedMessages;
        }
        return prev;
      });
      // Clear typing indicators when message is received
      setTypingUsers([]);
    });

    newSocket.on('typing', (data) => {
      console.log('⌨️ Typing indicator:', data);
      if (data.isTyping) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.userId !== data.userId);
          return [...filtered, { userId: data.userId, username: data.username }];
        });
      } else {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }
    });

    newSocket.on('userJoined', (data) => {
      console.log('👤 User joined:', data);
    });

    newSocket.on('userLeft', (data) => {
      console.log('👤 User left:', data);
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      setError(error.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Disconnecting from Socket.IO server...');
      newSocket.disconnect();
    };
  }, [currentUser, chatId]);

  const sendMessage = async () => {
    if (!message.trim() || sending || !socket || !isConnected) return;
    
    setSending(true);
    try {
      const messageData = {
        id: Date.now().toString(),
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.fullName || currentUser.email,
        timestamp: new Date().toISOString(),
        chatId: chatId
      };

      console.log('📤 Sending message:', messageData);
      
      // Immediately add message to UI and localStorage for instant feedback
      const updatedMessages = [...messages, messageData];
      setMessages(updatedMessages);
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(updatedMessages));
      
      // Send message via Socket.IO
      socket.emit('message', messageData);
      
      setMessage('');
      setError(null);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setError('Failed to send message');
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

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    // Send typing indicator
    if (socket && isConnected) {
      socket.emit('typing', {
        chatId,
        userId: currentUser.uid,
        username: currentUser.displayName || currentUser.fullName || currentUser.email,
        isTyping: true
      });
      
      // Clear typing indicator after 2 seconds of no typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        if (socket && isConnected) {
          socket.emit('typing', {
            chatId,
            userId: currentUser.uid,
            username: currentUser.displayName || currentUser.fullName || currentUser.email,
            isTyping: false
          });
        }
      }, 2000);
    }
  };

  return (
    <div className="fixed bottom-4 right-8 w-96 bg-white border shadow-xl rounded-lg z-50 relative" style={{
      backgroundColor: '#000000', 
      border: '1px solid #746c6c', 
      maxHeight: '600px',
      minHeight: '400px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Exit Button - Top Right */}
      <button 
        onClick={onClose} 
        className=" top-1 right-1 z-10 text-black hover:text-gray-300 transition-colors" 
        style={{fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', lineHeight: '1', fontWeight: 'normal'}}
      >
        &times;
      </button>

      {/* Header */}
      <div className="p-3 border-b" style={{
        borderColor: '#746c6c', 
        backgroundColor: '#f2f0eb',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        flexShrink: 0,
        paddingRight: '40px', // Create space for the close button
      }}>
        <div className="min-w-0">
          <div className="flex items-center">
            <h4 className="font-semibold text-sm text-black truncate">
              {recipient.fullName || recipient.displayName || 'User'}
            </h4>
            <div 
              className="w-2 h-2 rounded-full ml-2" 
              style={{
                backgroundColor: isConnected ? '#34C759' : '#8E8E93',
                flexShrink: 0
              }}
            />
          </div>
        </div>
      </div>

      {/* Messages - Smaller with scrolling */}
      <div className="flex-1 overflow-y-auto p-3" style={{
        backgroundColor: '#f2f0eb',
        borderBottom: '1px solid #746c6c',
        maxHeight: '480px', // Adjusted height
        minHeight: '250px'
      }}>
        {error && (
          <div className="flex flex-col justify-center items-center h-full">
            <p style={{color: '#dc3545', fontSize: '12px', textAlign: 'center', marginBottom: '10px'}}>
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#1a1a1a',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Retry Connection
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p style={{color: '#8e8e93', fontSize: '12px'}}>Loading...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p style={{color: '#8e8e93', textAlign: 'center', fontSize: '12px'}}>
              No messages yet
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-3 flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                <div className={`inline-block p-2 rounded-lg max-w-[70%]`} style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  borderRadius: '18px',
                  backgroundColor: msg.senderId === currentUser.uid ? '#2f2f2e' : '#e5e5ea',
                }}>
                  <p className="break-words" style={{
                    color: msg.senderId === currentUser.uid ? '#e4e3dc' : '#000000',
                    margin: '0',
                    fontWeight: '400'
                  }}>
                    {msg.text}
                  </p>
                  <p className="text-xs mt-1 opacity-70" style={{
                    color: msg.senderId === currentUser.uid ? '#e5e5ea' : '#6c6c70',
                    margin: '0',
                    textAlign: msg.senderId === currentUser.uid ? 'right' : 'left',
                    fontSize: '10px'
                  }}>
                    {msg.timestamp ? 
                      new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                      'Just now'
                    }
                  </p>
                </div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="text-left mb-2">
                <div className="inline-block p-2 rounded-lg bg-gray-100 text-gray-600 text-xs" style={{backgroundColor: '#e5e5ea', color: '#000000'}}>
                  {typingUsers.map(user => user.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Permanent Input Box */}
      <div className="p-3" style={{backgroundColor: '#f2f0eb', flexShrink: 0}}>
        <div className="flex">
          <input
            className="flex-1 border rounded-l px-3 py-2 text-sm focus:outline-none"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            disabled={sending || !isConnected}
            style={{
              border: '1px solid #746c6c', 
              borderRadius: '18px 0 0 18px',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: '13px'
            }}
          />
          <button
            className="text-white px-4 py-2 rounded-r text-sm font-medium transition-colors"
            onClick={sendMessage}
            disabled={!message.trim() || sending || !isConnected}
            style={{
              backgroundColor: (message.trim() && !sending && isConnected) ? '#007aff' : '#a7a7a7',
              borderRadius: '0 18px 18px 0',
              cursor: (message.trim() && !sending && isConnected) ? 'pointer' : 'not-allowed',
              color: '#ffffff',
              fontSize: '13px',
              border: '1px solid #746c6c',
              borderLeft: 'none'
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
