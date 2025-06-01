import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_R2_ACCESS_KEY_ID,  // Use your Cloudflare R2 Access Key ID
  secretAccessKey: process.env.REACT_APP_R2_SECRET_ACCESS_KEY,  // Use your Cloudflare R2 Secret Key
  endpoint: process.env.REACT_APP_R2_ENDPOINT,  // Replace <accountid> with your Cloudflare account ID
  region: process.env.REACT_APP_R2_REGION,  // Cloudflare recommends 'auto'
  signatureVersion: 'v4',  // Required for R2 compatibility
});
 
export { s3 };
 