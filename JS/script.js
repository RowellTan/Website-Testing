document.addEventListener('DOMContentLoaded', (event) => {
    // Select the navbar elements
    let navbarLinks = document.querySelectorAll(".nav-links a");
    let logo = document.querySelector(".logo");
 
    // Function to disable the link or logo
    const disableLinkOrLogo = (event) => {
       event.target.classList.add("disabled");
    };
 
    // Add click event to the navbar links
    navbarLinks.forEach((link) => {
       link.addEventListener('click', disableLinkOrLogo);
    });
 
    // Add click event to the logo
    logo.addEventListener('click', disableLinkOrLogo);
 });
 

 document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
      duration: 650,  // Animation duration
      easing: 'ease-in-out',  // Easing function
      once: true  // Animation will only run once
    });
  });
  
  function toggleInfo(button) {
   // Get the parent image card of the button clicked
   const card = button.closest('.image-card');
   
   // Get the extra-info div inside this card
   const extraInfo = card.querySelector('.extra-info');
   
   // Check if the extra-info is already visible
   if (extraInfo.style.display === "none" || extraInfo.style.display === "") {
     // Show the extra info and allow the card to expand independently
     extraInfo.style.display = "block";
     card.style.height = "auto";  // Allow the card to expand
     button.textContent = "Show Less";  // Change the button text
   } else {
     // Hide the extra info and reset the card size
     extraInfo.style.display = "none";
     card.style.height = "";  // Reset to original height
     button.textContent = "Show More";  // Change the button text back
   }
 }
 
 let lastScrollTop = 0; // Keep track of the last scroll position

 document.addEventListener("DOMContentLoaded", function() {
   let lastScrollTop = 0; // Keep track of the last scroll position
   let navbar = document.querySelector(".navbar");
 
   // Ensure the navbar is visible when the page is first loaded
   navbar.classList.remove("hide");
 
   // Add a click event listener for links in the navbar
   const navLinks = document.querySelectorAll(".navbar a"); // Assuming your navbar links are <a> elements
   
   navLinks.forEach(link => {
     link.addEventListener("click", function(event) {
       // If the link points to the current page, don't reset the navbar
       if (link.href === window.location.href) {
         event.preventDefault(); // Prevent the default action (i.e., reloading the page)
       }
     });
   });
 
   // Handle scroll event only if not on the same page
   window.addEventListener("scroll", function() {
     let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
 
     // If the user scrolls down, hide the navbar
     if (currentScroll > lastScrollTop) {
       navbar.classList.add("hide");
     } else {
       // If the user scrolls up, show the navbar
       navbar.classList.remove("hide");
     }
 
     lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll value
   });
 });
 
 function handleShowMoreClick(event) {
  event.stopPropagation(); // Stop the click event from bubbling up to the parent
  event.preventDefault();  // Prevent the default navigation behavior
  
  console.log("Show More button clicked!");
  
  // Optionally toggle visibility of the extra info section
  const extraInfo = event.target.nextElementSibling;
  if (extraInfo) {
    extraInfo.classList.toggle('visible');
  }
}

// Attach the function to all 'show-more-btn' buttons
document.querySelectorAll('.show-more-btn').forEach(button => {
  button.addEventListener('click', handleShowMoreClick);
});

 document.querySelectorAll('.add-to-cart').forEach(button => {
   button.addEventListener('click', function(event) {
     event.stopPropagation(); // Stop the link click event
     event.preventDefault(); // Prevent any default behavior of the button
     
     // Add to cart functionality
     console.log("Product added to cart!");
 
     // Optionally: You can also highlight the button or show a message for feedback
     // Example: button.textContent = 'Added to Cart';
   });
 });
// Function to update the cart item count
function updateCartItemCount() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemCountElement = document.getElementById('cart-item-count');
  
  // Get the total number of items in the cart (sum of all item quantities)
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Update the display
  if (totalItems > 0) {
    cartItemCountElement.textContent = totalItems;
    cartItemCountElement.style.display = 'inline';  // Show the count if there are items in the cart
  } else {
    cartItemCountElement.style.display = 'none';  // Hide the count if the cart is empty
  }
}

// Call the updateCartItemCount function when the page loads to update the icon
document.addEventListener('DOMContentLoaded', updateCartItemCount);

function addToCart(item) {
  let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItemIndex = cartItems.findIndex(cartItem => cartItem.name === item.name && cartItem.image === item.image);

  if (existingItemIndex >= 0) {
    cartItems[existingItemIndex].quantity += 1;
  } else {
    item.quantity = 1;
    cartItems.push(item);
  }

  localStorage.setItem('cart', JSON.stringify(cartItems));

  // Update the cart item count
  updateCartItemCount();

  // Show notification that item was added to the cart
  showAddedToCartMessage(item.name);
}

// Function to show the "item added" message
function showAddedToCartMessage(itemName) {
  // Create a new notification element
  const messageElement = document.createElement('div');
  messageElement.classList.add('added-to-cart-message');
  messageElement.textContent = `${itemName} has been added to the cart`;

  // Append the message to the body or a container element
  document.body.appendChild(messageElement);

  // Trigger the "fade in" animation
  setTimeout(() => {
    messageElement.classList.add('show'); // Make the message visible and slide up
  }, 100); // Delay the animation slightly to allow the message to be added

  // Add a fade-out effect and remove the message after 2 seconds
  setTimeout(() => {
    messageElement.classList.add('fade-out'); // Trigger fade-out animation
      messageElement.remove(); // Remove the element after animation
  }, 1000); // Keep the message visible for 2 seconds
}


// Function to display cart items
function displayCartItems() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];  // Retrieve cart items from localStorage
  const cartContainer = document.getElementById('cart-container');  // A container to display cart items
  const totalPriceElement = document.getElementById('total-price'); // Total price element
  const itemCountElement = document.getElementById('item-count'); // Item count element
  const checkoutButton = document.getElementById('checkout-button'); // Checkout button

  // Clear existing cart items
  cartContainer.innerHTML = '';

  // Initialize total price and item count
  let totalPrice = 0;
  let itemCount = 0;

  // If cart is not empty, display the header and each item
  if (cartItems.length > 0) {
    // Create and append the header row
    const headerRow = document.createElement('div');
    headerRow.classList.add('cart-header');

    headerRow.innerHTML = `
      <div class="cart-header-item">Select</div>
      <div class="cart-header-item">Image</div>
      <div class="cart-header-item">Name</div>
      <div class="cart-header-item">Price</div>
      <div class="cart-header-item">Quantity</div>
      <div class="cart-header-item">Actions</div>
    `;

    // Append the header to the cart container
    cartContainer.appendChild(headerRow);

    // Loop through each cart item and display it
    cartItems.forEach((item, index) => {
      const cartItemElement = document.createElement('div');
      cartItemElement.classList.add('cart-item');

      cartItemElement.innerHTML = `
        <label>
          <input type="checkbox" class="cart-item-checkbox" data-index="${index}" ${item.selected ? 'checked' : ''}>
        </label>
        <div class="cart-item-image-container">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        </div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${item.price}</p>
        <p class="cart-item-quantity">${item.quantity}</p>
        <button class="remove-item-btn" data-index="${index}">Remove</button>
      `;

      cartContainer.appendChild(cartItemElement);

      // Add item price to total if selected
      if (item.selected) {
        totalPrice += item.price * item.quantity;
        itemCount += item.quantity;
      }

      // Add event listener to remove button
      const removeButton = cartItemElement.querySelector('.remove-item-btn');
      removeButton.addEventListener('click', () => removeItem(index));

      // Add event listener to checkbox for selection
      const checkbox = cartItemElement.querySelector('.cart-item-checkbox');
      checkbox.addEventListener('change', () => toggleSelection(index));
    });

    // Update total price and item count
    totalPriceElement.textContent = totalPrice.toFixed(2);
    itemCountElement.textContent = itemCount;

    // Enable or disable the checkout button based on selection
    checkoutButton.disabled = totalPrice === 0;

    // Add event listener to the "Select All" checkbox to toggle all checkboxes
    const selectAllCheckbox = document.getElementById('select-all-header');
    selectAllCheckbox.addEventListener('change', (event) => {
      const isChecked = event.target.checked;
      
      // Log when "Select All" is toggled
      console.log('Select All Checkbox Changed:', isChecked);  

      // Update all items' selected state
      cartItems.forEach((item, index) => {
        item.selected = isChecked; // Set selected state for each item
      });

      // Update the localStorage with the new cart state
      localStorage.setItem('cart', JSON.stringify(cartItems));

      // Re-display the updated cart
      displayCartItems();
    });
  } else {
    console.log('The cart is empty.');
    totalPriceElement.textContent = '0.00';
    itemCountElement.textContent = '0';
  }
}
// Function to remove an item from the cart
function removeItem(index) {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Remove item from the cart
  cartItems.splice(index, 1);

  // Update the localStorage with the new cart array
  localStorage.setItem('cart', JSON.stringify(cartItems));

  // Update the cart item count in real-time
  updateCartItemCount();

  // Re-display the updated cart
  displayCartItems();
}

// Function to toggle the selection state of an item
function toggleSelection(index) {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Toggle the selected state of the item
  cartItems[index].selected = !cartItems[index].selected;

  // Update the localStorage with the new cart array
  localStorage.setItem('cart', JSON.stringify(cartItems));

  // Re-display the updated cart
  displayCartItems();
}

// Attach event listeners to all Add to Cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function() {
    const productElement = button.closest('.product-item'); // Get the closest product item

    // Get the product details
    const productName = productElement.querySelector('.product-name').textContent;
    const productPrice = productElement.querySelector('.product-price').textContent.replace('$', '');
    const productImage = productElement.querySelector('.product-image img').src;

    // Create the item object
    const productItem = {
      name: productName,
      price: parseFloat(productPrice),
      image: productImage
    };

    // Add the item to the cart (store in localStorage)
    addToCart(productItem);
  });
});

document.addEventListener('DOMContentLoaded', displayCartItems);


// Function to proceed to checkout
function proceedToCheckout() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

  // Filter selected items
  const selectedItems = cartItems.filter(item => item.selected);

  if (selectedItems.length === 0) {
    alert("No items selected for checkout!");
    return;
  }

  // Calculate the total bill for selected items
  const totalBill = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Store selected items and bill in localStorage
  const checkoutData = {
    items: selectedItems,
    total: totalBill
  };
  localStorage.setItem('checkout', JSON.stringify(checkoutData));

  // Redirect to payment page
  window.location.href = "payment.html";
}

// Select elements
const hamburgerMenu = document.getElementById('hamburger-menu');
const sidebar = document.getElementById('sidebar');

// Toggle the sidebar on hamburger click
hamburgerMenu.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

