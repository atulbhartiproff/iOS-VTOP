const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for React Native app
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/vtop_data/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `${timestamp}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload endpoint for VTOP JSON files
app.post('/upload-vtop', upload.single('vtopFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    console.log('✅ File uploaded successfully:', req.file.filename);
    console.log('📁 File path:', req.file.path);
    console.log('📊 File size:', req.file.size, 'bytes');

    res.json({
      success: true,
      message: 'File uploaded successfully',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Upload failed' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// List uploaded files endpoint
app.get('/files', (req, res) => {
  const uploadDir = './uploads/vtop_data/';
  if (!fs.existsSync(uploadDir)) {
    return res.json({ files: [] });
  }

  const files = fs.readdirSync(uploadDir).map(filename => {
    const filePath = path.join(uploadDir, filename);
    const stats = fs.statSync(filePath);
    return {
      filename,
      size: stats.size,
      uploadTime: stats.mtime,
      path: filePath
    };
  });

  res.json({ files });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VTOP Upload Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Files will be saved to: ./uploads/vtop_data/`);
});
