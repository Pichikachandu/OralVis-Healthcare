const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Debug environment variables
console.log('S3 Configuration:', {
  S3_REGION: process.env.S3_REGION ? 'Set' : 'Missing',
  S3_BUCKET: process.env.S3_BUCKET ? 'Set' : 'Missing',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
});

if (!process.env.S3_REGION || !process.env.S3_BUCKET) {
  console.error('FATAL: Required S3 configuration is missing');
  process.exit(1);
}

// Configure S3 client to handle region redirections
const s3Config = {
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Use virtual hosted style for better compatibility
  forcePathStyle: false,
  // Enable region redirection
  followRegionRedirects: true,
  // Add retry configuration
  maxAttempts: 3,
  retryMode: 'standard',
  // Use signature version 4
  signatureVersion: 'v4',
  // Disable S3 specific configurations that might cause issues
  s3DisableBodySigning: false,
  s3UsEast1RegionalEndpoint: 'regional',
  // Disable SSL for now to rule out SSL issues (enable in production)
  // sslEnabled: false
};

console.log('Initializing S3 client with config:', {
  ...s3Config,
  endpoint: s3Config.endpoint,
  credentials: { 
    accessKeyId: s3Config.credentials.accessKeyId ? '***' : 'Missing',
    secretAccessKey: '***' // Always mask the secret key
  }
});

const s3Client = new S3Client(s3Config);

const uploadToS3 = async (buffer, key, contentType) => {
  console.log('Uploading to S3:', {
    bucket: process.env.S3_BUCKET,
    key,
    contentType,
    bufferSize: buffer?.length || 0
  });

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  });

  try {
    await s3Client.send(command);
    // Generate the URL using the virtual-hosted style
    // The format is: https://bucket-name.s3.region-code.amazonaws.com/key-name
    const region = process.env.S3_REGION;
    // Special case for us-east-1 (N. Virginia)
    const regionPart = region === 'us-east-1' ? '' : `-${region}`;
    const url = `https://${process.env.S3_BUCKET}.s3${regionPart}.amazonaws.com/${key}`;
    
    console.log('Successfully uploaded to S3:', { 
      url,
      region,
      bucket: process.env.S3_BUCKET,
      key
    });
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', {
      message: error.message,
      code: error.code,
      name: error.name,
      region: process.env.S3_REGION,
      bucket: process.env.S3_BUCKET,
      endpoint: s3Config.endpoint,
      // Don't log the full stack trace as it's too verbose
    });
    
    // Create a more user-friendly error message
    const friendlyError = new Error(`Failed to upload to S3: ${error.message}`);
    friendlyError.code = error.code;
    throw friendlyError;
  }
};

module.exports = { s3Client, uploadToS3 };