// Adding all the extra functions that dont affect the database/s3bucket
// Helper function to scroll to an element and adjust position
function scrollToElement(elementId) {
  const element = document.getElementById(elementId);

  // Check if the element exists
  if (!element) {
    console.error(`Element with ID "${elementId}" not found!`);
    return; // Exit the function if the element doesn't exist
  }

  const offset = -150; // Adjust scroll position (e.g., scroll 150px above the element)
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;

  // Check if the element's position is valid
  if (isNaN(elementPosition)) {
    console.error(`Invalid element position for ID "${elementId}"`);
    return; // Exit the function if the position is invalid
  }

  // Perform the scroll with smooth behavior
  window.scrollTo({
    top: elementPosition + offset,
    behavior: 'smooth' // Smooth scroll effect
  });
}

// Function to go back to the cart
function goBackToCart() {
  window.history.back(); 
}



//Selection + Generataing the data for the ordersummary s3
//Generates the Order Summary on the page
document.addEventListener("DOMContentLoaded", function() {
  // Fetch the checkout data from localStorage
  const checkoutData = JSON.parse(localStorage.getItem('checkout'));

  if (checkoutData && checkoutData.items) {
    // Display the selected items and their quantities
    const itemsList = document.getElementById('selected-items');
    checkoutData.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('item');
      itemElement.innerHTML = `${item.name} | Qty - ${item.quantity} | Total - $${(item.price * item.quantity).toFixed(2)}`;
      itemsList.appendChild(itemElement);
    });

    // Display the total bill
    const totalBillElement = document.getElementById('total-bill');
    totalBillElement.textContent = `$${checkoutData.total.toFixed(2)}`;
  } else {
    // If no checkout data, display an error message
    const itemsList = document.getElementById('selected-items');
    itemsList.innerHTML = "<p>No items found for checkout!</p>";
  }
});


document.addEventListener("DOMContentLoaded", function () {
  const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
  
  // Function to hide all payment details
  function hideAllPaymentDetails() {
    const paymentDetails = document.querySelectorAll('.payment-details');
    paymentDetails.forEach(detail => {
      detail.style.display = 'none';
    });
  }

  // Add event listener to each payment option
  paymentOptions.forEach(option => {
    option.addEventListener('change', function () {
      hideAllPaymentDetails(); // Hide all payment details when changing the selection
      
      // Show the details of the selected payment method
      const selectedMethod = this.value;
      const detailsSection = document.getElementById(`${selectedMethod}-details`);
      if (detailsSection) {
        detailsSection.style.display = 'block';
      }
    });
  });
});




// Function to process payment and upload order details to S3 with dynamic metadata
function processPaymentAndUpload() {
  // Generate a new Order ID
  const orderID = generateOrderID(); // Ensure this function is accessible

  // Get the customer details from the form fields
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const address = document.getElementById('address').value;
  const totalBill = document.getElementById('total-bill').innerText; // Assuming total bill is already calculated

  // Validate the form fields
  let isValid = true;
  let firstInvalidField = null;

  if (!name || name.trim() === "") {
    highlightError('name');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'name';
  } else {
    removeHighlight('name');
  }

  if (!phone || phone.trim() === "") {
    highlightError('phone');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'phone';
  } else {
    removeHighlight('phone');
  }

  if (!email || email.trim() === "") {
    highlightError('email');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'email';
  } else {
    removeHighlight('email');
  }

  if (!address || address.trim() === "") {
    highlightError('address');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'address';
  } else {
    removeHighlight('address');
  }

  if (!isValid && firstInvalidField) {
    scrollToElement(firstInvalidField);
    return;
  }

  // Get the checkout data (items and quantities)
  const checkoutData = JSON.parse(localStorage.getItem('checkout'));

  if (!checkoutData || !checkoutData.items) {
    alert('No items found for checkout!');
    return;
  }

  // Format the items for metadata (item names as keys, quantity as values)
  const metadata = {
    'x-amz-meta-orderid': orderID,
    'x-amz-meta-customername': name,
    'x-amz-meta-orderphonenumber': phone,
    'x-amz-meta-orderemail': email,
    'x-amz-meta-orderaddress': address,
    'x-amz-meta-orderbill': totalBill,
    'x-amz-meta-orderdate': new Date().toISOString(), // Use ISO format for consistency
    'x-amz-meta-totalitems': checkoutData.items.length, // Total number of items
  };

  // Add each item dynamically to metadata
  checkoutData.items.forEach((item, index) => {
    metadata[`x-amz-meta-item${index + 1}`] = `${item.name} - Qty ${item.quantity}`;
  });

  // Prepare the order data to upload
  const orderData = {
    orderID,
    customerName: name,
    orderPhoneNumber: phone,
    orderEmail: email,
    orderAddress: address,
    orderBill: totalBill,
    orderDate: new Date().toISOString(), // Use ISO format for consistency
    formattedItems: checkoutData.items.map((item, index) => ({
      [`Item${index + 1}`]: `${item.name} - Qty ${item.quantity}`,
    })),
    checkoutData // Directly pass checkoutData
  };

  // Log the order data for debugging
  console.log('Order Data:', orderData);
  console.log('Metadata:', metadata); // Log metadata to check if items are included

  // Define the S3 upload parameters with dynamic metadata
  const params = {
    Bucket: 'ordersummaries', // Your S3 bucket name
    Key: `${orderID}.json`, // The file name in the S3 bucket
    Body: JSON.stringify(orderData), // Order data as the content
    Metadata: metadata, // Dynamically created metadata for items
    ContentType: 'application/json', // File content type
  };

  // Send the order data to your backend to upload to S3
  fetch('http://localhost:3000/upload-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData), // Send the order data as the request body
  })
    .then(response => response.json())
    .then(data => {
      console.log('Order uploaded successfully:', data);
      alert('Payment processed and order uploaded successfully!');
      // Optionally, redirect or update the UI
    })
    .catch(error => {
      console.error('Error uploading order:', error);
      alert('There was an error uploading your order.');
    });
}





// Function to process payment and send order details to the server
function processPayment() {
  // Generate a new Order ID using the function from OrderIDGeneration.js
  const orderID = generateOrderID();  // Ensure this function is accessible

  // Get the customer details from the form fields
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const address = document.getElementById('address').value;
  const totalBill = document.getElementById('total-bill').innerText; // Assuming total bill is already calculated

  // Log the customer data
  console.log('OrderID:', orderID);  // Log the generated OrderID
  console.log('Customer Name:', name);
  console.log('Phone:', phone);
  console.log('Email:', email);
  console.log('Address:', address);
  console.log('Total Bill:', totalBill);

  // Validate that all fields are filled out and valid
  let isValid = true;
  let firstInvalidField = null;

  // Check for required fields, ensuring they are empty
  if (!name || name.trim() === "") {  // Ensure name is empty
    highlightError('name');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'name'; 
  } else {
    removeHighlight('name');
  }

  if (!phone || phone.trim() === "") {  // Ensure phone is empty
    highlightError('phone');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'phone';
  } else {
    removeHighlight('phone');
  }

  if (!email || email.trim() === "") {  // Ensure email is empty
    highlightError('email');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'email'; 
  } else {
    removeHighlight('email');
  }

  if (!address || address.trim() === "") {  // Ensure address is empty
    highlightError('address');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'address'; 
  } else {
    removeHighlight('address');
  }

  // If any field is invalid, scroll to the topmost priority field
  if (!isValid && firstInvalidField) {
    scrollToElement(firstInvalidField);
    return;
  }

  // Get the current date in the format "DD/MM/YYYY"
  const now = new Date();
  const orderDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  console.log('Order Date:', orderDate); // Log the order date

  // Prepare order data
  const orderData = {
    orderID,  // This will now be correctly defined
    customerName: name,
    orderPhoneNumber: phone,
    orderEmail: email,
    orderAddress: address,
    orderBill: totalBill,
    orderDate
  };

  // Log the entire order data object
  console.log('Order Data:', orderData);

  // Send data to your server to store in DynamoDB
  fetch('http://localhost:3000/test-put-dynamo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Order saved successfully:', data);
      alert('Payment processed successfully!');
      // Optionally, you can redirect or update the UI here
    })
    .catch(error => {
      console.error('Error processing payment:', error);
      alert('There was an error processing your payment.');
    });
}


// Function to highlight input field with error
function highlightError(fieldId) {
  const field = document.getElementById(fieldId);
  field.style.border = '2px solid red';
}

// Function to remove highlight from input field
function removeHighlight(fieldId) {
  const field = document.getElementById(fieldId);
  field.style.border = '';
}


// Function to load user data from localStorage
function loadCustomerData() {
  // Check if the customer data exists in localStorage
  const name = localStorage.getItem('customerName');
  const phone = localStorage.getItem('customerPhone');
  const email = localStorage.getItem('customerEmail');
  const address = localStorage.getItem('customerAddress');
  const totalBill = localStorage.getItem('totalBill');  // Add this line to get the total bill
  const orderID = localStorage.getItem('orderID');  // Add this line to get the order ID

  if (name && phone && email) {
    // Pre-fill the form with saved data
    document.getElementById('name').value = name;
    document.getElementById('phone').value = phone;
    document.getElementById('email').value = email;
    document.getElementById('address').value = address;
    
    // Pre-fill the total bill and order ID fields
    if (totalBill) {
      document.getElementById('total-bill').innerText = totalBill;  // Assuming it's a text field
    }
    
    if (orderID) {
      document.getElementById('order-id').innerText = orderID;  // Assuming it's a text field
    }
  }
}




//Paying methods


