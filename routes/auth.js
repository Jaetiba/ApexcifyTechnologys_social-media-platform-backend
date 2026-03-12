const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

// SIGNUP
router.post("/register", async (req, res) => {
  try {
    const { email, username, password, profilePic, bio, age, phone } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: "Email, username, and password required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      profilePic: profilePic || "https://via.placeholder.com/150",
      bio: bio || "",
      age,
      phone,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET USER PROFILE
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// FOLLOW USER
router.post('/:userId/follow', async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUserId = req.params.userId;

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    if (targetUser.followers.includes(userId)) {
      return res.status(400).json({ error: 'Already following' });
    }

    // Add follower to target user
    targetUser.followers.push(userId);
    await targetUser.save();

    // Add to current user's following
    currentUser.following.push(targetUserId);
    await currentUser.save();

    res.json({ message: 'User followed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UNFOLLOW USER
router.delete('/:userId/follow', async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUserId = req.params.userId;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove follower from target user
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== userId
    );
    await targetUser.save();

    // Remove from current user's following
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUserId
    );
    await currentUser.save();

    res.json({ message: 'User unfollowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SEARCH USERS
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    }).select('-password').limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

