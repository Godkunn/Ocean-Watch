const express = require('express');
const multer = require('multer');
const Post = require('../models/Post');
const { analyzeText } = require('../services/nlpService');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Get all posts with filters and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, hazardType, severity } = req.query;
    
    let filter = {};
    if (type) filter.type = type;
    if (hazardType) filter.hazardType = hazardType;
    if (severity) filter.severity = severity;
    
    const posts = await Post.find(filter)
      .populate('author', 'username profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments(filter);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new post
router.post('/', verifyToken, upload.array('media', 5), async (req, res) => {
  try {
    const { title, content, type, hazardType, latitude, longitude, severity, tags } = req.body;
    
    const post = new Post({
      title,
      content,
      type,
      hazardType,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      severity,
      tags: tags ? tags.split(',') : [],
      author: req.user.id,
      media: req.files ? req.files.map(file => ({
        url: file.filename,
        type: file.mimetype.split('/')[0] // 'image', 'video', etc.
      })) : []
    });
    
    // Analyze text with NLP service
    try {
      const nlpResult = await analyzeText(content);
      post.nlpAnalysis = nlpResult;
    } catch (nlpError) {
      console.error('NLP analysis failed:', nlpError);
    }
    
    await post.save();
    await post.populate('author', 'username profile');
    
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profile')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profile'
        }
      });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on a post
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Remove existing votes from this user
    post.votes.upvotes = post.votes.upvotes.filter(
      id => id.toString() !== req.user.id
    );
    post.votes.downvotes = post.votes.downvotes.filter(
      id => id.toString() !== req.user.id
    );
    
    // Add new vote
    if (voteType === 'upvote') {
      post.votes.upvotes.push(req.user.id);
    } else if (voteType === 'downvote') {
      post.votes.downvotes.push(req.user.id);
    }
    
    // Calculate score
    post.votes.score = post.votes.upvotes.length - post.votes.downvotes.length;
    
    await post.save();
    
    res.json({
      score: post.votes.score,
      upvotes: post.votes.upvotes.length,
      downvotes: post.votes.downvotes.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;