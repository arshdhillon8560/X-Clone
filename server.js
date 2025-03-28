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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Multer Storage for Media Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Schema Definitions
const replySchema = new mongoose.Schema({
  content: String,
  author: {
    name: String,
    avatar: String
  },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  content: String,
  media: String,
  author: {
    name: String,
    avatar: String
  },
  likes: { type: Number, default: 0 },
  likedBy: [String],
  retweets: { type: Number, default: 0 },
  retweetedBy: [String],
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
        avatar: req.body.author?.avatar || ''
      }
    });
    const newPost = await post.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;
    if (post.likedBy.includes(userId)) {
      post.likes--;
      post.likedBy.pull(userId);
    } else {
      post.likes++;
      post.likedBy.push(userId);
    }
    await post.save();
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/posts/:id/retweet', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;
    if (post.retweetedBy.includes(userId)) {
      post.retweets--;
      post.retweetedBy.pull(userId);
    } else {
      post.retweets++;
      post.retweetedBy.push(userId);
    }
    await post.save();
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/posts/:id/reply', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const reply = {
      content: req.body.content,
      author: {
        name: req.body.author?.name || 'Anonymous',
        avatar: req.body.author?.avatar || ''
      }
    };
    post.replies.push(reply);
    post.replyCount++;
    await post.save();
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
