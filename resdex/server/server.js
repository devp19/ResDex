require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3002", 
      "http://127.0.0.1:3000", 
      "http://127.0.0.1:3002",
      "https://resdex.onrender.com",
      "https://www.resdex.onrender.com",
      "https://resdex.onrender.com/upload",
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

const port = process.env.PORT || 5001;

app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:3002", 
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:3002",
    "https://resdex.onrender.com",
    "https://www.resdex.onrender.com",
    "https://resdex.onrender.com/upload"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const upload = multer();

// In-memory storage for messages (no MongoDB)
const messages = new Map(); // chatId -> array of messages
const chats = new Map(); // chatId -> chat info
const activeUsers = new Map(); // socketId -> user info

// Socket.IO connection handling for real-time messaging
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Handle user joining a chat room
  socket.on('join', (data) => {
    try {
      const { userId, username, chatId } = data;
      console.log(`🔗 User ${username} (${userId}) joining chat: ${chatId}`);
      
      // Store user info
      activeUsers.set(socket.id, { userId, username, chatId });
      
      // Join the chat room
      socket.join(chatId);
      
      // Notify others in the room
      socket.to(chatId).emit('userJoined', {
        userId,
        username,
        message: `${username} joined the chat`
      });
      
      console.log(`✅ User ${username} joined chat room: ${chatId}`);
    } catch (error) {
      console.error('❌ Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle new message
  socket.on('message', (messageData) => {
    try {
      console.log('📨 Received message:', messageData);
      const { chatId, text, senderId, senderName } = messageData;
      
      // Store message in memory
      if (!messages.has(chatId)) {
        messages.set(chatId, []);
      }
      messages.get(chatId).push(messageData);
      
      // Broadcast message to all users in the chat room
      io.to(chatId).emit('message', messageData);
      
      console.log(`💬 Message delivered to chat ${chatId}: "${text}"`);
    } catch (error) {
      console.error('❌ Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    try {
      const { chatId, userId, username, isTyping } = data;
      socket.to(chatId).emit('typing', { userId, username, isTyping });
    } catch (error) {
      console.error('❌ Error handling typing indicator:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    try {
      const userData = activeUsers.get(socket.id);
      if (userData) {
        const { userId, username, chatId } = userData;
        
        // Notify others in the room
        socket.to(chatId).emit('userLeft', {
          userId,
          username,
          message: `${username} left the chat`
        });
        
        activeUsers.delete(socket.id);
        console.log(`👋 User ${username} disconnected from chat: ${chatId}`);
      }
    } catch (error) {
      console.error('❌ Error handling disconnect:', error);
    }
  });
});

// Express REST API routes for chat functionality

// Get chat history (for when page refreshes)
app.get('/api/chats/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chatMessages = messages.get(chatId) || [];
    
    console.log(`📚 Loaded ${chatMessages.length} messages for chat: ${chatId}`);
    res.json(chatMessages);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create or get existing chat
app.post('/api/chats', async (req, res) => {
  try {
    const { user1Id, user2Id } = req.body;
    const chatId = [user1Id, user2Id].sort().join('_');
    
    // Create or find existing chat for private one-on-one conversation
    if (!chats.has(chatId)) {
      chats.set(chatId, {
        chatId,
        user1Id,
        user2Id,
        createdAt: new Date()
      });
    }
    
    console.log(`💬 Chat created/found: ${chatId}`);
    res.json({ chatId, success: true });
  } catch (error) {
    console.error('❌ Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get all chats for a user
app.get('/api/users/:userId/chats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userChats = Array.from(chats.values()).filter(chat => 
      chat.user1Id === userId || chat.user2Id === userId
    );
    
    console.log(`📋 Found ${userChats.length} chats for user: ${userId}`);
    res.json(userChats);
  } catch (error) {
    console.error('❌ Error fetching user chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Existing AWS S3 functionality
const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto',
  signatureVersion: 'v4',
});

app.post('/delete', express.json(), async (req, res) => {
  try {
    const { userId, objectKey } = req.body;

    if (!userId || !objectKey) {
      return res.status(400).json({ success: false, message: 'Missing userId or objectKey' });
    }

    const params = { Bucket: process.env.R2_BUCKET, Key: objectKey };
    await s3.deleteObject(params).promise();

    console.log(`🗑️ Deleted ${objectKey} from R2`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.userId;

    const key = `pdfs/${userId}/${file.originalname}`;

    const params = {
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await s3.upload(params).promise();

    console.log(`📤 Uploaded ${key} to R2`);

    const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`;

    const workerUrl = result.Location.replace(
  'https://resdex.9941bc70add85a39ce1bc8141c669eca.r2.cloudflarestorage.com',
  'https://view.resdex.ca'
);

res.json({
  success: true,
  url: workerUrl,      
  objectKey: key,
});

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Backend server running at http://localhost:${port}`);
  console.log(`🌐 Network accessible at http://YOUR_IP_ADDRESS:${port}`);
  console.log('💬 Real-time messaging enabled with Socket.IO');
  console.log('💾 Messages stored in memory (no database)');
});
 