
// Function to process payment and upload order details to S3 with dynamic metadata
function processPaymentAndUpload() {
  const orderID = generateOrderID(); // Ensure this function is accessible

  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const address = getAddress(); // Get the combined address
  const totalBill = document.getElementById('total-bill').innerText;

  let isValid = true;
  let firstInvalidField = null;

  // Check if name is empty
  if (!name || name.trim() === "") {
    showError('name', 'Name is required.');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'name';
  } else {
    hideError('name');
  }

  // Check if phone is empty or invalid format
  const phonePattern = /^\+?[1-9]\d{1,14}$/; // Simple phone number validation
  if (!phone || phone.trim() === "" || !phonePattern.test(phone)) {
    showError('phone', 'Please enter a valid phone number (e.g., 123456789).');
    setErrorBorder('phone');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'phone';
  } else {
    hideError('phone');
    removeErrorBorder('phone');
  }

  // Check if email is empty or invalid format
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Basic email validation
  if (!email || email.trim() === "" || !emailPattern.test(email)) {
    showError('email', 'Please enter a valid email (e.g., example@gmail.com).');
    setErrorBorder('email');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'email';
  } else {
    hideError('email');
    removeErrorBorder('email');
  }

  // Check if address is empty
  if (!address || address.trim() === "") {
    showError('address', 'Address is required.');
    isValid = false;
    if (!firstInvalidField) firstInvalidField = 'address';
  } else {
    hideError('address');
  }

  if (!isValid && firstInvalidField) {
    scrollToElement(firstInvalidField);
    return;
  }

  const checkoutData = JSON.parse(localStorage.getItem('checkout'));

  if (!checkoutData || !checkoutData.items) {
    alert('No items found for checkout!');
    return;
  }

  const metadata = {
    'x-amz-meta-orderid': orderID,
    'x-amz-meta-customername': name,
    'x-amz-meta-orderphonenumber': phone,
    'x-amz-meta-orderemail': email,
    'x-amz-meta-orderaddress': address, // Use combined address
    'x-amz-meta-orderbill': totalBill,
    'x-amz-meta-orderdate': new Date().toISOString(),
    'x-amz-meta-totalitems': checkoutData.items.length,
  };

  checkoutData.items.forEach((item, index) => {
    metadata[`${index + 1}`] = `${item.name} - Qty ${item.quantity}`;
  });

  const orderData = {
    orderID,
    customerName: name,
    orderPhoneNumber: phone,
    orderEmail: email,
    orderAddress: address, // Use combined address
    orderBill: totalBill,
    orderDate: new Date().toISOString(),
    formattedItems: checkoutData.items.map((item, index) => ({
      [`Item${index + 1}`]: `${item.name} - Qty ${item.quantity}`,
    })),
    checkoutData
  };

  console.log('Order Data:', orderData);
  console.log('Metadata:', metadata);
  console.log('Payload being sent to API:', JSON.stringify(orderData));

  const apiUrl = 'https://hnqp4h2yac.execute-api.ap-southeast-1.amazonaws.com/prod/Order';

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Order uploaded successfully:', data);
      alert('Payment processed and order uploaded successfully!');
    })
    .catch(error => {
      console.error('Error uploading order:', error);
      alert('There was an error uploading your order.');
    });
}

// Function to get the combined address value
function getAddress() {
  const address = document.getElementById('address').value;
  const blockNumber = document.getElementById('block-number').value;
  const postalCode = document.getElementById('postal-code').value;

  return `${address} #${blockNumber} , ${postalCode}`;
}

// Show error message next to the input field
function showError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  errorElement.textContent = message;
  errorElement.classList.add('show');
}

// Hide error message next to the input field
function hideError(fieldId) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  errorElement.classList.remove('show');
}

// Set error border for the input field
function setErrorBorder(fieldId) {
  const inputElement = document.getElementById(fieldId);
  inputElement.classList.add('error');
}

// Remove error border for the input field
function removeErrorBorder(fieldId) {
  const inputElement = document.getElementById(fieldId);
  inputElement.classList.remove('error');
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

