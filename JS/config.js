// aws-config.js
import AWS from 'aws-sdk';

// Configure AWS SDK with access keys and region
AWS.config.update({
    region: 'ap-southeast-1', // Your AWS region
    accessKeyId: 'AKIAUMYCIC6WCMIDOV4W', // Your AWS access key
    secretAccessKey: 'K24tgy+OXIGjhWQsG8c7fKAGll/XvwOioYxhR8cj', // Your AWS secret key
});

export default AWS;
