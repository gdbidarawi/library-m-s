// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  const adminExists = await User.findOne({ email: 'admin@library.com' });
  if (!adminExists) {
    await User.create({
      name: 'System Admin',
      email: 'admin@library.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
    });
    console.log('Default admin created: admin@library.com / Admin@123');
  } else {
    console.log('Admin already exists, skipping.');
  }

  const bookCount = await Book.countDocuments();
  if (bookCount === 0) {
    await Book.insertMany([
      { title: 'Introduction to Algorithms', isbn: '9780262033848', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Computer Science', quantity: 5, available: 5 },
      { title: 'Artificial Intelligence: A Modern Approach', isbn: '9780136042594', author: 'Russell & Norvig', category: 'AI', quantity: 3, available: 3 },
      { title: 'Deep Learning', isbn: '9780262035613', author: 'Goodfellow, Bengio, Courville', category: 'Machine Learning', quantity: 4, available: 4 },
      { title: 'Computer Networking: A Top-Down Approach', isbn: '9780132856201', author: 'Kurose & Ross', category: 'Networking', quantity: 6, available: 6 },
      { title: 'Database System Concepts', isbn: '9780078022159', author: 'Silberschatz, Korth, Sudarshan', category: 'Database', quantity: 5, available: 5 },
      { title: 'Software Engineering', isbn: '9780133943030', author: 'Ian Sommerville', category: 'Software Engineering', quantity: 4, available: 4 },
    ]);
    console.log('Sample books seeded.');
  } else {
    console.log('Books already exist, skipping.');
  }

  console.log('Seeding complete.');
  mongoose.connection.close();
};

seed();
