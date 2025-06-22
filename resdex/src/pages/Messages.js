import React, { useState, useEffect, useRef } from 'react';
import useChats from '../hooks/useChats';
import { auth } from '../firebaseConfig';
import io from 'socket.io-client';
import './Messages.css';
import Logo from '../components/common/Logo';
import { useSearchParams } from 'react-router-dom';

// ChatWindow component logic is now inside Messages.js
const ChatWindow = ({ recipient, currentUser, chatId, onBack }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [recipientOnline, setRecipientOnline] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
  
    const scrollToBottom = () => {
      setTimeout(() => {
        const messagesContainer = messagesEndRef.current?.parentElement;
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    };
  
    // const isNearBottom = () => {
    //   const messagesContainer = messagesEndRef.current?.parentElement;
    //   if (!messagesContainer) return false;
      
    //   const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    //   const threshold = 100; // pixels from bottom
    //   return scrollHeight - scrollTop - clientHeight < threshold;
    // };
  
    // useEffect(() => {
    //   // Only auto-scroll if user is near bottom or if it's the first load
    //   if (messages.length > 0 && (isNearBottom() || messages.length === 1)) {
    //     scrollToBottom();
    //   }
    // }, [messages]);
  
    useEffect(() => {
      if (!currentUser || !recipient) {
        setLoading(false);
        return;
      }
  
      const loadMessages = async () => {
        try {
          setLoading(true);
          const serverUrl = 'https://resdex.onrender.com';
          const response = await fetch(`${serverUrl}/api/chats/${chatId}/messages`);
          if (response.ok) {
            const serverMessages = await response.json();
            setMessages(serverMessages);
          } else {
            console.error('Failed to fetch messages from server');
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        } finally {
          setLoading(false);
        }
      };
  
      loadMessages();
    }, [chatId, currentUser, recipient]);
  
    useEffect(() => {
      if (!chatId || !currentUser) return;
  
      const serverUrl = process.env.REACT_APP_SERVER_URL || 'https://resdex.onrender.com';
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
  
      newSocket.on('connect', () => {
        setIsConnected(true);
        setError(null);
        newSocket.emit('join', {
          userId: currentUser.uid,
          username: currentUser.displayName || currentUser.fullName || currentUser.email,
          chatId: chatId
        });
      });
  
      newSocket.on('connect_error', (error) => {
        setError(`Connection failed: ${error.message}`);
        setIsConnected(false);
      });
  
      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });
  
      newSocket.on('message', (messageData) => {
        if(messageData.chatId === chatId) {
          // Only add the message if it's not already in the messages array
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === messageData.id);
            if (!messageExists) {
              return [...prev, messageData];
            }
            return prev;
          });
          setTypingUsers([]);
        }
      });
  
      newSocket.on('typing', (data) => {
        if(data.chatId === chatId) {
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
  
      setSocket(newSocket);
  
      return () => {
        newSocket.disconnect();
      };
    }, [currentUser, recipient, chatId]);
  
    const sendMessage = async () => {
      if (!message.trim() || sending || !socket || !isConnected) return;
      
      console.log('🚀 Sending message:', message.trim(), 'to chat:', chatId);
      setSending(true);
      const messageData = {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.fullName || currentUser.email,
        timestamp: new Date().toISOString(),
        chatId: chatId
      };
      
      console.log('📤 Message data being sent:', messageData);
      setMessages(prev => [...prev, messageData]);
      socket.emit('message', messageData);
      setMessage('');
      setSending(false);
      scrollToBottom();
      console.log('✅ Message sent successfully');
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
        socket.emit('typing', { chatId, userId: currentUser.uid, username: currentUser.displayName, isTyping: true });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit('typing', { chatId, userId: currentUser.uid, username: currentUser.displayName, isTyping: false });
        }, 2000);
      }
    };
  
    return (
        <div className="flex flex-col h-full rounded-lg shadow-md">
            <div className="p-3 border-b flex items-center flex-shrink-0">
                {onBack && (
                    <button onClick={onBack} className="custom-view">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                        </svg>
                    </button>
                )}
                <h4 className="primary mt-4">{recipient.fullName || 'User'}</h4>
            </div>

            <div className="flex-1 overflow-y-auto p-3" style={{ height: '400px', maxHeight: '400px' }}>
                {loading && <p className="text-center text-gray-500">Loading messages...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && messages.length === 0 && <p className="text-center primary">Start a conversation! Say Hello!</p>}
                
                {messages.map((msg, index) => {
                    const isCurrentUser = msg.senderId === currentUser.uid;
                    return (
                        <div key={index} className={`mb-3 d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div 
                                className="inline-block text-sm custom-read text-white"
                                style={{
                                    backgroundColor: isCurrentUser ? '#5b5b5b' : '#2a2a2a',
                                    maxWidth: 'fit-content',
                                    paddingLeft: '30px',
                                    paddingRight: '30px',
                                    paddingTop: '10px',
                                    paddingBottom: '10px',
                                    borderRadius: '20px',
                                }}
                            >
                                <p className="break-words m-0">{msg.text}</p>
                                
                            </div>
                            <p className={`text-xs mt-1 text-muted opacity-70 pt-2 m-0 text-${isCurrentUser ? 'right' : 'left'}`} style={{ fontSize: "10px", paddingLeft: '10px' }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                        </div>
                    );
                })}
                 {typingUsers.length > 0 && (
                    <div className="text-left mb-2">
                        <div className="inline-block p-2 rounded-lg bg-gray-200 text-gray-600 text-xs">
                        {typingUsers.map(user => user.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t flex-shrink-0">
                <input
                    className="box d-flex p-3 text-sm placeholder-gray-500 primary"
                    style={{ 
                        width: "100%",
                        outline: "none",
                        border: "1px solid rgba(255, 255, 255, 0.3)"
                    }}
                    placeholder="Type a message and press enter to send"
                    value={message}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    disabled={sending || !isConnected}
                />
            </div>
        </div>
    );
};

const Messages = () => {
  const { chats, loading, error } = useChats();
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const searchParams = useSearchParams()[0];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Auto-select chat based on URL parameter
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      const chatIdFromUrl = searchParams.get('chatId');
      if (chatIdFromUrl) {
        const chatToSelect = chats.find(chat => chat.id === chatIdFromUrl);
        if (chatToSelect) {
          setSelectedChat(chatToSelect);
        }
      }
    }
  }, [chats, selectedChat, searchParams]);

  if (loading) {
    return (
      <div className="box">
        <div className="messages-loading-content">
          <Logo style={{ maxWidth: "60px", marginBottom: "20px" }} />
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="box">
        <div className="messages-error-content">
          <Logo style={{ maxWidth: "60px", marginBottom: "20px" }} />
          <p>Error loading conversations: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="box messages-container mt-4">
      <div className={`conversation-list ${selectedChat ? 'hidden-on-mobile' : ''}`}>
        <div className="conversation-header">
          <div className="conversation-header-content">
            <Logo style={{ maxWidth: "60px", marginBottom: "15px" }} />
            <h2>Messages</h2>
          </div>
        </div>
        <div className="conversation-items-container">
          {chats.length > 0 ? (
            chats.map(chat => (
              <div key={chat.id} className={`conversation-item ${selectedChat?.id === chat.id ? 'selected' : ''}`} onClick={() => setSelectedChat(chat)}>
                <img src={chat.recipient.profilePicture || 'https://firebasestorage.googleapis.com/v0/b/resdex-4b117.appspot.com/o/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.webp?alt=media&token=edabe458-161b-4a69-bc2e-630674bdb0de'} alt={chat.recipient.fullName} className="profile-pic" />
                <div className="conversation-details">
                  <p className="recipient-name">{chat.recipient.fullName}</p>
                  <p className="last-message">{chat.lastMessage?.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-conversations-container">
              <Logo style={{ maxWidth: "50px", marginBottom: "15px", opacity: "0.7" }} />
              <p className="no-conversations">No conversations yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className={`chat-window-container ${!selectedChat ? 'hidden-on-mobile' : ''}`}>
        {selectedChat && currentUser ? (
          <ChatWindow
            chatId={selectedChat.id}
            recipient={selectedChat.recipient}
            currentUser={currentUser}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="no-chat-selected primary">
            <Logo style={{ maxWidth: "80px", marginBottom: "20px", opacity: "0.8" }} />
            <h2>Select a Conversation to Start Messaging</h2>
            <p className='primary'>Choose from your existing conversations on the left, or start a new one from a user's profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 