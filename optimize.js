'use strict';
const AWS = require('aws-sdk'); 
const S3 = new AWS.S3(); 
const sharp = require('sharp'); 
const { basename, extname } = require('path');

module.exports.handle = async ({ Records: records }) => {
  try {
    await Promise.all(records.map(async record => {
      const { key } = record.s3.object;
      const bucket = process.env.bucket; 

      const image = await S3.getObject({
        Bucket: bucket,
        Key: key
      }).promise(); 

      const optimized = await sharp(image.Body)
        .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
        .toFormat('jpeg', { progressive: true, quality: 50 })
        .toBuffer();

      await S3.putObject({
        Body: optimized,
        Bucket: bucket,
        ContentType: 'image/jpeg',
        Key: `compressed/${basename(key, extname(key))}.jpg`
      }).promise();
    }));

    return { 
      statusCode: 200,
      body: {}
    }
  } catch (err) {

  }
};
