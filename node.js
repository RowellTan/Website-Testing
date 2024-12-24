const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Extract order details from the event (e.g., API request body)
    const { orderID, customerName, totalAmount } = event;

    // Validate the input
    if (!orderID || !customerName || !totalAmount) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'orderID, customerName, and totalAmount are required' })
        };
    }

    // Prepare the data to store in DynamoDB
    const params = {
        TableName: 'Orders',  // Your DynamoDB table name
        Item: {
            orderID,           // The partition key
            customerName,      // Additional order info
            totalAmount,       // Additional order info
            createdAt: new Date().toISOString()  // Timestamp when the order was created
        }
    };

    try {
        // Store the order data in DynamoDB
        await dynamoDB.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order stored successfully', orderID })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to store order', error })
        };
    }
};
