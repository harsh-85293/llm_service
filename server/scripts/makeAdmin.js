import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function makeAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'secureai',
    });

    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✓ User ${email} is now an admin!`);
    console.log(`User details:`, {
      name: user.name,
      email: user.email,
      role: user.role,
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

makeAdmin(email);
