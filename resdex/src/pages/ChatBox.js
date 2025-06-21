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
    <div className="fixed bottom-4 right-8 w-80 bg-white border shadow-xl rounded-lg z-50" style={{
      backgroundColor: '#ffffff', 
      border: '2px solid #1a1a1a', 
      maxHeight: '600px',
      minHeight: '400px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b rounded-t-lg" style={{
        borderColor: '#1a1a1a', 
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        flexShrink: 0
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
            <p className="text-xs text-white">
              {isConnected ? 'Online' : 'Connecting...'}
            </p>
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

      {/* Messages - Smaller with scrolling */}
      <div className="flex-1 overflow-y-auto p-3" style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        maxHeight: '300px',
        minHeight: '200px'
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
            <p style={{color: '#666666', fontSize: '12px'}}>Loading...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p style={{color: '#666666', textAlign: 'center', fontSize: '12px'}}>
              No messages yet
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-2 ${msg.senderId === currentUser.uid ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded-lg max-w-xs ${msg.senderId === currentUser.uid ? 'bg-blue-500 text-black' : 'bg-gray-200 text-gray-800'}`} style={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  lineHeight: '1.3'
                }}>
                  <p className="break-words" style={{color: msg.senderId === currentUser.uid ? '#ffffff' : '#333333'}}>{msg.text}</p>
                  <p className="text-xs mt-1" style={{color: msg.senderId === currentUser.uid ? '#ffffff' : '#666666'}}>
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
                <div className="inline-block p-2 rounded-lg bg-gray-100 text-gray-600 text-xs">
                  {typingUsers.map(user => user.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Permanent Input Box */}
      <div className="p-3" style={{backgroundColor: '#f8f9fa', flexShrink: 0}}>
        <div className="flex">
          <input
            className="flex-1 border rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            disabled={sending || !isConnected}
            style={{
              border: '1px solid #1a1a1a', 
              borderRadius: '4px 0 0 4px',
              backgroundColor: '#ffffff',
              color: '#333333',
              fontSize: '12px'
            }}
          />
          <button
            className="text-white px-4 py-2 rounded-r text-sm font-medium transition-colors hover:opacity-90"
            onClick={sendMessage}
            disabled={!message.trim() || sending || !isConnected}
            style={{
              backgroundColor: (message.trim() && !sending && isConnected) ? '#1a1a1a' : '#cccccc',
              borderRadius: '0 4px 4px 0',
              cursor: (message.trim() && !sending && isConnected) ? 'pointer' : 'not-allowed',
              color: '#ffffff',
              fontSize: '12px'
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
