const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Multer Storage for Media Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Schema Definitions
const replySchema = new mongoose.Schema({
  content: { type: String, required: true, maxLength: 280 },
  author: {
    name: { type: String, default: 'Anonymous' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60' }
  },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  content: { type: String, required: true, maxLength: 280 },
  media: { type: String, default: '' },
  author: {
    name: { type: String, default: 'Anonymous' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60' }
  },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  retweets: { type: Number, default: 0 },
  retweetedBy: [{ type: String }],
  replies: [replySchema],
  replyCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// Routes

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', upload.single('media'), async (req, res) => {
  try {
    const mediaPath = req.file ? `/uploads/${req.file.filename}` : '';
    const post = new Post({
      content: req.body.content,
      media: mediaPath,
      author: {
        name: req.body.author?.name || 'Anonymous',
        avatar: req.body.author?.avatar
      }
    });
    const newPost = await post.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Like, Retweet, Reply, Search routes unchanged...

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
