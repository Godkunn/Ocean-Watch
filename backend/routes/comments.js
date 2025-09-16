const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Add a comment to a post
router.post('/:postId', verifyToken, async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    
    const comment = new Comment({
      content,
      author: req.user.id,
      post: req.params.postId,
      parentComment: parentCommentId
    });
    
    await comment.save();
    
    // Add comment to the post
    await Post.findByIdAndUpdate(
      req.params.postId,
      { $push: { comments: comment._id }, $inc: { commentCount: 1 } }
    );
    
    await comment.populate('author', 'username profile');
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username profile')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username profile'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on a comment
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Remove existing votes from this user
    comment.votes.upvotes = comment.votes.upvotes.filter(
      id => id.toString() !== req.user.id
    );
    comment.votes.downvotes = comment.votes.downvotes.filter(
      id => id.toString() !== req.user.id
    );
    
    // Add new vote
    if (voteType === 'upvote') {
      comment.votes.upvotes.push(req.user.id);
    } else if (voteType === 'downvote') {
      comment.votes.downvotes.push(req.user.id);
    }
    
    // Calculate score
    comment.votes.score = comment.votes.upvotes.length - comment.votes.downvotes.length;
    
    await comment.save();
    
    res.json({
      score: comment.votes.score,
      upvotes: comment.votes.upvotes.length,
      downvotes: comment.votes.downvotes.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;