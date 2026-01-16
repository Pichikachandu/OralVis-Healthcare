const mongoose = require('mongoose');
const config = require('../config/db');
const Submission = require('../models/Submission');

async function addIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB...');

    // Add index for userId field
    await Submission.collection.createIndex({ userId: 1 });
    console.log('Created index on userId field');

    // Add compound index for commonly queried fields together
    await Submission.collection.createIndex({ userId: 1, status: 1 });
    console.log('Created compound index on userId and status fields');

    console.log('All indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

addIndexes();
