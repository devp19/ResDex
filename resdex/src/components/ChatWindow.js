import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import "react-image-crop/dist/ReactCrop.css";

export default function ChatWindow({ recipient, currentUser, chatId, onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [recipientOnline, setRecipientOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
        setLoading(true);
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
    if (!chatId || !currentUser) return;
    
    console.log('🔍 Debug - ChatWindow initialized with:', {
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
      if(messageData.chatId === chatId) {
        console.log('📨 Received message:', messageData);
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === messageData.id);
          if (!exists) {
            const updatedMessages = [...prev, messageData];
            localStorage.setItem(`chat_${chatId}`, JSON.stringify(updatedMessages));
            return updatedMessages;
          }
          return prev;
        });
        setTypingUsers([]);
      }
    });

    newSocket.on('typing', (data) => {
      if(data.chatId === chatId) {
        console.log('⌨️ Typing indicator:', data);
        if (data.isTyping) {
          setTypingUsers(prev => {
            const filtered = prev.filter(user => user.userId !== data.userId);
            return [...filtered, { userId: data.userId, username: data.username }];
          });
        } else {
          setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
        }
      }
    });

    newSocket.on('userJoined', (data) => {
      if (data.userId === recipient.uid) {
        setRecipientOnline(true);
      }
    });

    newSocket.on('userLeft', (data) => {
      if (data.userId === recipient.uid) {
        setRecipientOnline(false);
      }
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
  }, [currentUser, recipient, chatId]);

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
      
      const updatedMessages = [...messages, messageData];
      setMessages(updatedMessages);
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(updatedMessages));
      
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
    
    if (socket && isConnected) {
      socket.emit('typing', {
        chatId,
        userId: currentUser.uid,
        username: currentUser.displayName || currentUser.fullName || currentUser.email,
        isTyping: true
      });
      
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
    <div className="flex flex-col h-full bg-white rounded-lg">
      {/* Header */}
      <div className="p-3 border-b flex items-center flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="mr-2 text-black hover:text-gray-600 md:hidden">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center">
            <h4 className="font-semibold text-sm text-black truncate">
              {recipient.fullName || recipient.displayName || 'User'}
            </h4>
            <div
              className="ml-2 border border-gray-300"
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: recipientOnline ? "#34C759" : "#8E8E93",
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-100">
        {error && (
          <div className="flex flex-col justify-center items-center h-full">
            <p className="text-red-500 text-xs text-center mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-black text-white px-4 py-2 rounded text-xs"
            >
              Retry Connection
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-sm">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-center text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-3 flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                <div className={`inline-block p-2 rounded-lg max-w-[70%] text-sm ${msg.senderId === currentUser.uid ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                  <p className="break-words m-0">{msg.text}</p>
                  <p className={`text-xs mt-1 opacity-70 ${msg.senderId === currentUser.uid ? 'text-blue-200' : 'text-gray-500'} m-0 text-${msg.senderId === currentUser.uid ? 'right' : 'left'}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                  </p>
                </div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="text-left mb-2">
                <div className="inline-block p-2 rounded-lg bg-white text-gray-600 text-xs">
                  {typingUsers.map(user => user.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t flex-shrink-0">
        <div className="flex">
          <input
            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            disabled={sending || !isConnected}
          />
          <button
            className="text-white px-4 py-2 rounded-full text-sm font-medium transition-colors ml-2 disabled:bg-gray-400"
            onClick={sendMessage}
            disabled={!message.trim() || sending || !isConnected}
            style={{backgroundColor: '#007aff'}}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
} 