require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const seedDB = async () => {
  try {
    await User.deleteMany({});

    // Create test users
    const user1 = await User.create({
      email: 'alice@gmail.com',
      username: 'alice_wonder',
      password: await bcrypt.hash('password123', 10),
      profilePic: 'https://via.placeholder.com/150?text=Alice',
      bio: 'Digital nomad & photographer 📸',
      age: 25,
      phone: '1234567890',
    });

    const user2 = await User.create({
      email: 'bob@gmail.com',
      username: 'bob_builder',
      password: await bcrypt.hash('password123', 10),
      profilePic: 'https://via.placeholder.com/150?text=Bob',
      bio: 'Software dev & coffee lover ☕',
      age: 28,
      phone: '0987654321',
    });

    const user3 = await User.create({
      email: 'carol@gmail.com',
      username: 'carol_designs',
      password: await bcrypt.hash('password123', 10),
      profilePic: 'https://via.placeholder.com/150?text=Carol',
      bio: 'UI/UX designer from NYC 🎨',
      age: 26,
      phone: '5555555555',
    });

    console.log('✅ Database seeded successfully!');
    console.log(`\nTest Users:`);
    console.log(`1. alice@gmail.com (password: password123)`);
    console.log(`2. bob@gmail.com (password: password123)`);
    console.log(`3. carol@gmail.com (password: password123)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

connectDB().then(seedDB);