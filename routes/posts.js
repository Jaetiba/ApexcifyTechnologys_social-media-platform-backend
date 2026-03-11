const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const router = express.Router();

// CREATE POST
router.post('/', async (req, res) => {
  try {
    const { userId, content, images } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content required' });
    }

    const post = await Post.create({
      userId,
      content,
      images: images || []
    });

    // Populate user data
    await post.populate('userId', 'username profilePic');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL POSTS (Feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username profilePic bio')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username profilePic' }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET USER'S POSTS
router.get('/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await Post.find({ userId: user._id })
      .populate('userId', 'username profilePic bio')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username profilePic' }
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LIKE POST
router.post('/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already liked
    if (post.likes.includes(userId)) {
      return res.status(400).json({ error: 'Already liked' });
    }

    post.likes.push(userId);
    await post.save();

    res.json({ message: 'Post liked', likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UNLIKE POST
router.delete('/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.likes = post.likes.filter(id => id.toString() !== userId);
    await post.save();

    res.json({ message: 'Post unliked', likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD COMMENT
router.post('/:postId/comments', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const postId = req.params.postId;

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content required' });
    }

    const comment = await Comment.create({
      postId,
      userId,
      content
    });

    await comment.populate('userId', 'username profilePic');

    // Add comment to post
    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment._id } },
      { new: true }
    );

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE COMMENT
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Remove from post
    await Post.findByIdAndUpdate(
      comment.postId,
      { $pull: { comments: comment._id } }
    );

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;