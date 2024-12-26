import Amplify from 'aws-amplify';

const awsConfig = {
  Auth: {
    identityPoolId: '', // You can leave this empty if you're not using Cognito Identity Pool
    region: 'ap-southeast-1', // e.g., 'us-west-2'
    userPoolId: '', // leave empty if you're not using Cognito User Pools
    userPoolWebClientId: '', // leave empty if you're not using Cognito User Pools
    mandatorySignIn: false, // Can be true if you want to require sign-in
  },
  Storage: {
    AWSS3: {
      bucket: 'ordersummaries', // Replace with your bucket name
      region: 'ap-southeast-1', // Replace with your region, e.g., 'us-west-2'
    },
  },
};

Amplify.configure({
  ...awsConfig,
  API: {
    endpoints: [
      // Add API endpoint configuration if needed
    ],
  },
});

export default awsConfig;
