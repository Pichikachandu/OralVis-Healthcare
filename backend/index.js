// Load environment variables first
require('dotenv').config({ path: __dirname + '/.env' });

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'S3_BUCKET',
  'S3_REGION'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

console.log('Environment variables loaded successfully');

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');

const app = express();

// Connect to MongoDB
connectDB();

// Verify S3 access
const { s3Client } = require('./config/s3');
const { HeadBucketCommand } = require('@aws-sdk/client-s3');

const verifyS3Access = async () => {
  try {
    await s3Client.send(new HeadBucketCommand({
      Bucket: process.env.S3_BUCKET
    }));
    console.log('Successfully connected to S3 bucket');
  } catch (error) {
    console.error('Error accessing S3 bucket:', {
      message: error.message,
      code: error.code,
      name: error.name,
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION
    });
    console.error('Please verify your AWS credentials and S3 bucket configuration');
    process.exit(1);
  }
};

// Verify S3 access before starting the server
verifyS3Access().then(() => {
  console.log('S3 access verified successfully');
}).catch(err => {
  console.error('Failed to verify S3 access:', err);
  process.exit(1);
});

// Increase payload size limit (50MB)
const MAX_BODY_SIZE = '50mb';

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: MAX_BODY_SIZE }));
app.use(express.urlencoded({ limit: MAX_BODY_SIZE, extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    code: err.code,
    name: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({ msg: `Server error: ${err.message}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));