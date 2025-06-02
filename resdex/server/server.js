require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = 5001;

app.use(cors());

const upload = multer();

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

    console.log(`Deleted ${objectKey} from R2`);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
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

    console.log(`Uploaded ${key} to R2`);

    const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`;

    const workerUrl = result.Location.replace(
  'https://resdex.9941bc70add85a39ce1bc8141c669eca.r2.cloudflarestorage.com',
  'https://resdex-r2-proxy.devptl841806.workers.dev'
);

res.json({
  success: true,
  url: workerUrl,      
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


app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
