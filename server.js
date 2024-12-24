const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// AWS SDK configuration using environment variables
AWS.config.update({
  region: process.env.AWS_REGION, // AWS region from .env
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS access key ID from .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS secret access key from .env
});

const s3 = new AWS.S3();

// Middleware to parse JSON data
app.use(bodyParser.json());

// Serve static files from the 'Styles' folder
app.use('/styles', express.static(path.join(__dirname, 'Styles')));

// Serve static files from the 'JS' folder
app.use('/js', express.static(path.join(__dirname, 'JS')));  // Corrected to serve JS files

// Serve static files from the 'HTML' folder
app.use('/html', express.static(path.join(__dirname, 'HTML')));  // Corrected to serve HTML files

// Serve index.html at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'HTML', 'index.html')); // Serve the default index.html
});

// Serve other .html files from the 'HTML' folder
app.get('/:page.html', (req, res) => {
  const fileName = req.params.page + '.html'; // Get the filename from the URL parameter
  const filePath = path.join(__dirname, 'HTML', fileName); // Construct the full path to the HTML file
  
  // Send the file if it exists, else return 404
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending HTML file:', err);
      res.status(404).send('File not found');
    }
  });
});



// Route to handle order summary upload to S3
app.post('/upload-order', async (req, res) => {
  const {
    orderID,
    customerName,
    orderPhoneNumber,
    orderEmail,
    orderAddress,
    orderBill,
    orderDate,
    formattedItems,
    checkoutData,
  } = req.body;

  // Check for missing fields
  const missingFields = [];
  if (!orderID) missingFields.push('orderID');
  if (!customerName) missingFields.push('customerName');
  if (!orderPhoneNumber) missingFields.push('orderPhoneNumber');
  if (!orderEmail) missingFields.push('orderEmail');
  if (!orderAddress) missingFields.push('orderAddress');
  if (!orderBill) missingFields.push('orderBill');
  if (!orderDate) missingFields.push('orderDate');
  if (!formattedItems) missingFields.push('formattedItems');
  if (!checkoutData || !checkoutData.items) missingFields.push('checkoutData.items');

  // If there are missing fields, return an error response
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missingFields: missingFields,
    });
  }

  // Define the metadata object
  const metadata = {
    orderID: orderID,
    customerName: customerName,
    orderPhoneNumber: orderPhoneNumber,
    orderEmail: orderEmail,
    orderAddress: orderAddress,
    orderBill: orderBill.toString(),
    orderDate: orderDate,
    totalItems: checkoutData.items.length.toString(),
  };

  // Add each item to the metadata dynamically
  checkoutData.items.forEach((item, index) => {
    metadata[`x-amz-meta-item${index + 1}`] = `${item.name} - Qty ${item.quantity}`;
  });

  // Define the S3 upload parameters
  const params = {
    Bucket: 'ordersummaries', // Your S3 bucket name
    Key: `${orderID}.json`, // The file name in the S3 bucket (orderID as the filename)
    Body: JSON.stringify({
      orderID,
      customerName,
      orderPhoneNumber,
      orderEmail,
      orderAddress,
      orderBill,
      orderDate,
      items: formattedItems,
      totalItems: checkoutData.items.length,
    }),
    Metadata: metadata, // Add the dynamically created metadata
    ContentType: 'application/json', // File content type
  };

  try {
    // Upload the data to S3
    const result = await s3.upload(params).promise();
    console.log('Order data uploaded successfully:', result); // Log the successful upload
    res.status(200).json({
      message: 'Order summary uploaded successfully',
      s3Response: result,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error uploading to S3:', error);
    res.status(500).json({
      error: 'Failed to upload order summary to S3',
      details: error.message,
    });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
