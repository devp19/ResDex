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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const port = 5001;

app.use(cors());
app.use(express.json());

const upload = multer();

// In-memory storage for messages (no MongoDB)
const messages = new Map(); // chatId -> array of messages
const chats = new Map(); // chatId -> chat info

// Socket.IO connection handling for real-time messaging
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join a chat room for private one-on-one conversation
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`🔗 User ${socket.id} joined chat: ${chatId}`);
  });

  // Handle new message (like iMessage)
  socket.on('send-message', async (messageData) => {
    try {
      console.log('📨 Received message from client:', messageData);
      const { chatId, senderId, senderName, text } = messageData;
      
      // Create message object
      const message = {
        id: Date.now() + Math.random(), // Simple unique ID
        chatId,
        senderId,
        senderName,
        text,
        timestamp: new Date()
      };
      
      console.log('💾 Storing message in memory:', message);
      // Store message in memory
      if (!messages.has(chatId)) {
        messages.set(chatId, []);
      }
      messages.get(chatId).push(message);
      
      // Deliver message instantly to all users in the chat (real-time like iMessage)
      console.log(`📤 Broadcasting message to chat ${chatId}:`, message);
      io.to(chatId).emit('new-message', message);
      
      console.log(`💬 Message delivered: "${text}"`);
    } catch (error) {
      console.error('❌ Error handling message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
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

server.listen(port, () => {
  console.log(`🚀 Backend server running at http://localhost:${port}`);
  console.log(`💬 Real-time messaging enabled with Socket.IO`);
  console.log(`💾 Messages stored in memory (no database)`);
});
 