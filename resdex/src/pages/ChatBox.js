// src/pages/ChatBox.js
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export default function ChatBox({ recipient, currentUser, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const chatId = [currentUser.uid, recipient.uid].sort().join('_');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection for real-time messaging
  useEffect(() => {
    console.log('🔌 Initializing Socket.IO connection...');
    const newSocket = io('http://localhost:5001');
    
    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
    });
    
    setSocket(newSocket);

    return () => {
      console.log('🔌 Closing Socket.IO connection...');
      newSocket.close();
    };
  }, []);

  // Join chat room and load chat history
  useEffect(() => {
    if (!currentUser || !recipient || !socket) {
      console.log('⚠️ Missing data:', { currentUser: !!currentUser, recipient: !!recipient, socket: !!socket });
      setError('Invalid user data');
      setLoading(false);
      return;
    }

    console.log('🔗 Joining chat room:', chatId);
    // Join the private one-on-one chat room
    socket.emit('join-chat', chatId);

    console.log('📚 Loading existing messages...');
    // Load existing messages from memory (for page refresh)
    fetch(`http://localhost:5001/api/chats/${chatId}/messages`)
      .then(response => response.json())
      .then(data => {
        console.log('📚 Messages loaded:', data);
        if (data.error) {
          setError(data.error);
        } else {
          setMessages(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error loading messages:", err);
        setError('Failed to load messages');
        setLoading(false);
      });

    // Listen for new real-time messages (like iMessage)
    socket.on('new-message', (newMessage) => {
      console.log('💬 New message received:', newMessage);
      setMessages(prev => [...prev, newMessage]);
    });

    socket.on('message-error', (errorData) => {
      console.error('❌ Message error:', errorData);
      setError(errorData.error);
    });

    return () => {
      socket.off('new-message');
      socket.off('message-error');
    };
  }, [socket, chatId, currentUser, recipient]);

  const sendMessage = async () => {
    if (!message.trim() || sending || !socket) {
      console.log('⚠️ Cannot send message:', { message: message.trim(), sending, socket: !!socket });
      return;
    }
    
    setSending(true);
    try {
      const messageData = {
        chatId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.fullName || currentUser.email,
        text: message.trim()
      };

      console.log('📤 Sending message:', messageData);
      // Send message via Socket.IO for real-time delivery
      socket.emit('send-message', messageData);
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

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border shadow-xl rounded-lg" style={{backgroundColor: '#e5e3df', border: '1px solid #1a1a1a', maxHeight: '500px', zIndex: 9999}}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b" style={{borderColor: '#1a1a1a'}}>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
            {recipient.profilePicture ? (
              <img 
                src={recipient.profilePicture} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span style={{color: '#1a1a1a', fontSize: '14px'}}>
                {(recipient.fullName || recipient.displayName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-sm" style={{color: '#1a1a1a'}}>
              {recipient.fullName || recipient.displayName || 'User'}
            </h4>
            <p className="text-xs" style={{color: '#666'}}>Online</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-red-600 transition-colors" 
          style={{fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer'}}
        >
          &times;
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-3" style={{backgroundColor: 'white'}}>
        {error && (
          <div className="flex justify-center items-center h-full">
            <p style={{color: '#dc3545', fontSize: '14px', textAlign: 'center'}}>
              {error}
            </p>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p style={{color: '#666', fontSize: '14px'}}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p style={{color: '#666', textAlign: 'center', fontSize: '14px'}}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-3 ${msg.senderId === currentUser.uid ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg max-w-xs ${msg.senderId === currentUser.uid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="text-sm break-words">{msg.text}</p>
                <p className="text-xs opacity-75 mt-1">
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
      <div className="p-3 border-t" style={{borderColor: '#1a1a1a'}}>
        <div className="flex">
          <input
            className="flex-1 border rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            style={{border: '1px solid #1a1a1a', borderRadius: '5px 0 0 5px', color: 'black'}}
          />
          <button
            className="text-white px-4 py-2 rounded-r text-sm font-medium transition-colors hover:opacity-90"
            onClick={sendMessage}
            disabled={!message.trim() || sending}
            style={{
              backgroundColor: (message.trim() && !sending) ? '#1a1a1a' : '#ccc',
              borderRadius: '0 5px 5px 0',
              cursor: (message.trim() && !sending) ? 'pointer' : 'not-allowed'
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}