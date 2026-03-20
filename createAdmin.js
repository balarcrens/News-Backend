const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const createAdmin = async () => {
  await connectDB();
  const email = 'admin@gmail.com';
  const user = await User.findOne({ email });
  
  if (user) {
    user.role = 'admin';
    await user.save();
    console.log('User updated to admin');
  } else {
    await User.create({
      name: 'Admin User',
      email: email,
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created');
  }
  process.exit();
};

createAdmin();
