require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = 5001;

// Enable CORS for your React app
app.use(cors());

// Multer setup for file handling
const upload = multer();

// AWS S3 client (for Cloudflare R2)
const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto',
  signatureVersion: 'v4',
});

// Upload route
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

    console.log(`Uploaded ${key} to R2`);

    // 🔥 Manually construct the public URL:
    const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`;

    res.json({
      success: true,
      url: publicUrl,         // ✅ send this to frontend
      objectKey: key,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});


// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running at http://localhost:${port}`);
});
