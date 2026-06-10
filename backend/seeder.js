require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coursetrack';
    await mongoose.connect(MONGODB_URI);

    const adminExists = await User.findOne({ email: 'admin@coursetrack.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@coursetrack.com',
        password: 'password123',
        isAdmin: true,
      });
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
