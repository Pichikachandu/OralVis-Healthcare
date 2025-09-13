require('dotenv').config({ path: __dirname + '/../.env' });
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1', // Default to us-east-1 if not specified
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function listBuckets() {
  try {
    const command = new ListBucketsCommand({});
    const { Buckets, Owner } = await s3Client.send(command);
    
    console.log('S3 Buckets:');
    console.log('-----------');
    console.log(`Account: ${Owner.DisplayName} (ID: ${Owner.ID})`);
    console.log('');
    
    if (Buckets.length === 0) {
      console.log('No buckets found in this account');
      return;
    }
    
    // Get bucket locations in parallel
    const bucketsWithRegions = await Promise.all(
      Buckets.map(async (bucket) => {
        try {
          // Try to get the bucket location (region)
          const locationCommand = new GetBucketLocationCommand({
            Bucket: bucket.Name,
          });
          const locationData = await s3Client.send(locationCommand);
          // The location is returned as null for us-east-1
          const region = locationData.LocationConstraint || 'us-east-1';
          return { ...bucket, Region: region };
        } catch (error) {
          console.error(`Error getting region for bucket ${bucket.Name}:`, error.message);
          return { ...bucket, Region: 'unknown' };
        }
      })
    );
    
    // Display the results in a table
    console.table(
      bucketsWithRegions.map(b => ({
        Name: b.Name,
        CreationDate: b.CreationDate.toISOString(),
        Region: b.Region,
      })),
      ['Name', 'CreationDate', 'Region']
    );
    
  } catch (error) {
    console.error('Error listing S3 buckets:', {
      message: error.message,
      code: error.code,
      name: error.name,
      region: process.env.S3_REGION,
    });
    
    if (error.name === 'CredentialsProviderError') {
      console.error('\nAWS credentials are invalid or not properly configured.');
      console.log('Please check your .env file and ensure the following variables are set correctly:');
      console.log('AWS_ACCESS_KEY_ID=your_access_key');
      console.log('AWS_SECRET_ACCESS_KEY=your_secret_key');
      console.log('S3_REGION=your_bucket_region');
      console.log('S3_BUCKET=your_bucket_name');
    }
    
    process.exit(1);
  }
}

// Run the function
listBuckets();
