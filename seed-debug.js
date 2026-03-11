require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('🌱 Starting seed...');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const connectDB = async () => {
  console.log('⏳ Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
};

const seedDB = async () => {
  try {
    console.log('🗑️  Clearing collections...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('✅ Collections cleared');

    console.log('👤 Creating users...');
    const user1 = await User.create({
      email: 'alice@gmail.com',
      username: 'alice_wonder',
      password: await bcrypt.hash('password123', 10),
      profilePic: 'https://via.placeholder.com/150?text=Alice',
      bio: 'Digital nomad & photographer 📸',
      age: 25,
      phone: '1234567890',
    });
    console.log('✅ User 1 created:', user1.username);

    const user2 = await User.create({
      email: 'bob@gmail.com',
      username: 'bob_builder',
      password: await bcrypt.hash('password123', 10),
      profilePic: 'https://via.placeholder.com/150?text=Bob',
      bio: 'Software dev & coffee lover ☕',
      age: 28,
      phone: '0987654321',
    });
    console.log('✅ User 2 created:', user2.username);

    const user3 = await User.create({
      email: 'carol@gmail.com',
      username: 'carol_designs',
      password: await bcrypt.hash('password123', 10),
      profilePic: 'https://via.placeholder.com/150?text=Carol',
      bio: 'UI/UX designer from NYC 🎨',
      age: 26,
      phone: '5555555555',
    });
    console.log('✅ User 3 created:', user3.username);

    console.log('📝 Creating posts...');
    const post1 = await Post.create({
      userId: user1._id,
      content: 'Just finished an amazing hike! 🥾',
      images: ['https://via.placeholder.com/400?text=Hiking'],
      likes: [user2._id],
    });
    console.log('✅ Post 1 created');

    const post2 = await Post.create({
      userId: user2._id,
      content: 'New React project deployed 🚀',
      images: ['https://via.placeholder.com/400?text=Code'],
      likes: [user1._id, user3._id],
    });
    console.log('✅ Post 2 created');

    const post3 = await Post.create({
      userId: user3._id,
      content: 'Design system updates ready for review ✨',
      images: [],
      likes: [],
    });
    console.log('✅ Post 3 created');

    console.log('💬 Creating comments...');
    const comment1 = await Comment.create({
      postId: post1._id,
      userId: user2._id,
      content: 'That looks incredible! Which trail?',
    });
    console.log('✅ Comment 1 created');

    const comment2 = await Comment.create({
      postId: post2._id,
      userId: user3._id,
      content: 'Congrats! Looking forward to checking it out',
    });
    console.log('✅ Comment 2 created');

    post1.comments.push(comment1._id);
    post2.comments.push(comment2._id);
    await post1.save();
    await post2.save();
    console.log('✅ Comments linked to posts');

    console.log('🔗 Adding relationships...');
    user1.followers = [user2._id];
    user1.following = [user3._id];
    await user1.save();

    user2.followers = [user1._id];
    user2.following = [user1._id];
    await user2.save();
    console.log('✅ Relationships created');

    console.log('\n✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('\n📋 Test Users:');
    console.log('1. alice@gmail.com (password: password123)');
    console.log('2. bob@gmail.com (password: password123)');
    console.log('3. carol@gmail.com (password: password123)');
    console.log('\n📊 Created: 3 Posts, 2 Comments');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

connectDB().then(seedDB);
