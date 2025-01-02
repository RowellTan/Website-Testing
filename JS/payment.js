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



// Function to format the current date in DD/MM/YYYY HH:mm:ss format (SGT)
function getSGTFormattedDate() {
  const now = new Date();

  // Get the timezone offset for SGT (Singapore is UTC +8)
  const options = { timeZone: 'Asia/Singapore', hour12: false };
  const dateFormatter = new Intl.DateTimeFormat('en-GB', options);

  // Format the date using the options to get DD/MM/YYYY format
  const formattedDate = dateFormatter.format(now);

  // Format the time using getHours, getMinutes, and getSeconds
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  // Return the formatted date in DD/MM/YYYY HH:mm:ss format
  return `${formattedDate} ${hours}:${minutes}:${seconds}`;
}



// Function to validate the form
function validateForm() {
  let isValid = true;

  // Validate name
  const name = document.getElementById('name').value.trim();
  const nameError = document.getElementById('name-error');
  const nameInput = document.getElementById('name');
  if (!name) {
    showPopup(nameError, "Name is required.");
    nameInput.classList.add('invalid');
    isValid = false;
  } else {
    hidePopup(nameError);
    nameInput.classList.remove('invalid');
  }

  // Validate phone
  const phone = document.getElementById('phone').value.trim();
  const phoneError = document.getElementById('phone-error');
  const phoneInput = document.getElementById('phone');
  const phoneRegex = /^[0-9]{8}$/; // Adjust regex for Singapore phone numbers
  if (!phone) {
    showPopup(phoneError, "Phone number is required.");
    phoneInput.classList.add('invalid');
    isValid = false;
  } else if (!phoneRegex.test(phone)) {
    showPopup(phoneError, "Please enter a valid phone number.");
    phoneInput.classList.add('invalid');
    isValid = false;
  } else {
    hidePopup(phoneError);
    phoneInput.classList.remove('invalid');
  }

  // Validate email
  const email = document.getElementById('email').value.trim();
  const emailError = document.getElementById('email-error');
  const emailInput = document.getElementById('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showPopup(emailError, "Please enter a valid email address (e.g., name@example.com).");
    emailInput.classList.add('invalid');
    isValid = false;
  } else {
    hidePopup(emailError);
    emailInput.classList.remove('invalid');
  }

  // Validate address
  const address = document.getElementById('address').value.trim();
  const blockNumber = document.getElementById('block-number').value.trim();
  const postalCode = document.getElementById('postal-code').value.trim();
  const addressError = document.getElementById('address-error');
  const addressInput = document.getElementById('address');
  const blockNumberInput = document.getElementById('block-number');
  const postalCodeInput = document.getElementById('postal-code');

  const fullAddress = `${address} #${blockNumber}, ${postalCode}`.trim();
  if (fullAddress === "# ," || fullAddress === "#," || fullAddress === ",") {
    showPopup(addressError, "Address is required.");
    addressInput.classList.add('invalid');
    blockNumberInput.classList.add('invalid');
    postalCodeInput.classList.add('invalid');
    isValid = false;
  } else {
    hidePopup(addressError);
    addressInput.classList.remove('invalid');
    blockNumberInput.classList.remove('invalid');
    postalCodeInput.classList.remove('invalid');
  }

  return isValid;
}

// Show the popup error message
function showPopup(element, message) {
  element.textContent = message;
  element.style.display = 'block';  // Show the popup
}

// Hide the popup error message
function hidePopup(element) {
  element.textContent = '';
  element.style.display = 'none';  // Hide the popup
}

// Function to handle form submission and validation
function validateAndProceed() {
  if (validateForm()) {
    // If form is valid, proceed with payment processing
    processPaymentAndUpload();
  } else {
    // If validation fails, prevent form submission
    console.log('Form validation failed.');
  }
}

// Function to process payment and upload order details to S3 with dynamic metadata
function processPaymentAndUpload() {
  // Get values from the form
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = getAddress(); // Get the combined address
  const totalBill = document.getElementById('total-bill').innerText.trim();

  const checkoutData = JSON.parse(localStorage.getItem('checkout'));

  if (!checkoutData || !checkoutData.items) {
    alert('No items found for checkout!');
    return;
  }

  // Generate order ID (use your logic for generating an order ID)
  const orderID = generateOrderID();

  // Prepare metadata for the order
  const metadata = {
    'x-amz-meta-orderid': orderID,
    'x-amz-meta-customername': name,
    'x-amz-meta-orderphonenumber': phone,
    'x-amz-meta-orderemail': email,
    'x-amz-meta-orderaddress': address, // Use combined address
    'x-amz-meta-orderbill': totalBill,
    'x-amz-meta-orderdate': getSGTFormattedDate(), // Use the formatted SGT date
    'x-amz-meta-totalitems': checkoutData.items.length,
  };

  // Add item details to the metadata
  checkoutData.items.forEach((item, index) => {
    metadata[`${index + 1}`] = `${item.name} - Qty ${item.quantity}`;
  });

  // Prepare the order data for the API
  const orderData = {
    orderID,
    customerName: name,
    orderPhoneNumber: phone,
    orderEmail: email,
    orderAddress: address, // Use combined address
    orderBill: totalBill,
    orderDate: getSGTFormattedDate(), // Use the formatted SGT date
    formattedItems: checkoutData.items.map((item, index) => ({
      [`Item${index + 1}`]: `${item.name} - Qty ${item.quantity}`,
    })),
    checkoutData
  };

  // Log the order data and metadata for debugging
  console.log('Order Data:', orderData);
  console.log('Metadata:', metadata);
  console.log('Payload being sent to API:', JSON.stringify(orderData));

  // Make the API call to post the data
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
  const address = document.getElementById('address').value.trim();
  const blockNumber = document.getElementById('block-number').value.trim();
  const postalCode = document.getElementById('postal-code').value.trim();

  // If blockNumber and postalCode are empty, return just the address
  if (!blockNumber && !postalCode) {
    return address;
  }

  // Otherwise, combine address, block number, and postal code
  return `${address} ${blockNumber ? `#${blockNumber}` : ''} ${postalCode ? `, ${postalCode}` : ''}`.trim();
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


