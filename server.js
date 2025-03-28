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
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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

// Get All Posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// Create Post
app.post('/api/posts', upload.single('media'), async (req, res) => {
  try {
    const mediaPath = req.file ? `/uploads/${req.file.filename}` : '';
    const post = new Post({
      content: req.body.content,
      media: mediaPath,
      author: {
        name: req.body.author?.name || 'Anonymous',
        avatar: req.body.author?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60'
      }
    });
    const newPost = await post.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Like or Unlike Post
app.post('/api/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    if (post.likedBy.includes(userId)) {
      post.likes--;
      post.likedBy = post.likedBy.filter(id => id !== userId);
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

// Retweet Post
app.post('/api/posts/:postId/retweet', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    if (post.retweetedBy.includes(userId)) {
      post.retweets--;
      post.retweetedBy = post.retweetedBy.filter(id => id !== userId);
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

// Reply to Post
app.post('/api/posts/:postId/reply', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, author } = req.body;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const reply = {
      content,
      author: {
        name: author?.name || 'Anonymous',
        avatar: author?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60'
      }
    };

    post.replies.push(reply);
    post.replyCount = post.replies.length;
    await post.save();

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Serve frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
