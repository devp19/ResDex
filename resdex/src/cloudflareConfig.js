import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_R2_ACCESS_KEY_ID,  
  secretAccessKey: process.env.REACT_APP_R2_SECRET_ACCESS_KEY,  
  endpoint: process.env.REACT_APP_R2_ENDPOINT,  
  region: process.env.REACT_APP_R2_REGION,  
  signatureVersion: 'v4',  
});
 
export { s3 };
 