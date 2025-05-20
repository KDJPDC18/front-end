 // Initialize cart from localStorage
 let cart = JSON.parse(localStorage.getItem('cart')) || [];

 // Mobile Menu Toggle
 const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
 const nav = document.querySelector('nav');

 mobileMenuBtn.addEventListener('click', () => {
     nav.classList.toggle('active');
     mobileMenuBtn.innerHTML = nav.classList.contains('active') ? 
         '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
 });

 // Close mobile menu when clicking on a link
 const navLinks = document.querySelectorAll('nav ul li a');
 navLinks.forEach(link => {
     link.addEventListener('click', () => {
         nav.classList.remove('active');
         mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
     });
 });

 // Cart Functionality
 const cartIcon = document.getElementById('cart-icon');
 const cartModal = document.getElementById('cart-modal');
 const closeModal = document.querySelector('.close-modal');
 const cartItemsContainer = document.getElementById('cart-items');
 const cartTotalElement = document.getElementById('cart-total');

 // Open/Close Cart Modal
 cartIcon.addEventListener('click', () => {
     cartModal.classList.add('active');
 });

 closeModal.addEventListener('click', () => {
     cartModal.classList.remove('active');
 });

 // Close modal when clicking outside
 cartModal.addEventListener('click', (e) => {
     if (e.target === cartModal) {
         cartModal.classList.remove('active');
     }
 });

 // Handle size selection
 document.addEventListener('click', function(e) {
     // For product cards
     if (e.target.closest('.product-card .size-option')) {
         const sizeOption = e.target.closest('.size-option');
         const productCard = sizeOption.closest('.product-card');
         
         // Update active state
         productCard.querySelectorAll('.size-option').forEach(opt => {
             opt.classList.remove('active');
         });
         sizeOption.classList.add('active');
         
         // Update add to cart button
         const addButton = productCard.querySelector('.add-to-cart');
         const price = sizeOption.querySelector('span:last-child').textContent.replace('₱', '');
         const size = sizeOption.getAttribute('data-size');
         const productName = productCard.querySelector('.product-name').textContent;
         
         addButton.setAttribute('data-price', price);
         addButton.setAttribute('data-name', `${productName} (${size.charAt(0).toUpperCase() + size.slice(1)})`);
     }
     
     // For menu items
     if (e.target.closest('.menu-item .size-option')) {
         const sizeOption = e.target.closest('.size-option');
         const menuItem = sizeOption.closest('.menu-item');
         
         // Update active state
         menuItem.querySelectorAll('.size-option').forEach(opt => {
             opt.classList.remove('active');
         });
         sizeOption.classList.add('active');
         
         // Update displayed price
         const price = sizeOption.querySelector('span:last-child').textContent;
         menuItem.querySelector('.item-price').textContent = price;
     }
     
     // Handle Add to Cart for products
     // Handle Add to Cart for products (including those without size options)
     if (e.target.classList.contains('add-to-cart')) {
         const button = e.target;
         const productCard = button.closest('.product-card');

         const sizeOption = productCard.querySelector('.size-option.active');
         const size = sizeOption ? sizeOption.getAttribute('data-size') : null;
         const id = button.getAttribute('data-id') + (size ? `-${size}` : '');
         const name = size ? `${button.getAttribute('data-name')} (${size.charAt(0).toUpperCase() + size.slice(1)})` : button.getAttribute('data-name');
         const price = parseFloat(button.getAttribute('data-price'));
         const img = button.getAttribute('data-img');

         addItemToCart(id, name, price, img, size);
     }
     
     // Handle Add to Cart for menu items
     if (e.target.classList.contains('add-to-cart-btn-food')) {
         const button = e.target;
         const menuItem = button.closest('.menu-item');
         const size = menuItem.querySelector('.size-option.active').getAttribute('data-size');
         const price = parseFloat(menuItem.querySelector('.size-option.active span:last-child').textContent.replace('₱', ''));
         const flavor = menuItem.querySelector('.flavor-option.active').getAttribute('data-flavor'); // Get selected flavor

         addItemToCart(
             `${menuItem.getAttribute('data-id')}-${size}-${flavor}`, // Include flavor in ID
             `${menuItem.getAttribute('data-name')} (${size.charAt(0).toUpperCase() + size.slice(1)}, ${flavor.charAt(0).toUpperCase() + flavor.slice(1)})`, // Include flavor in name
             price,
             'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
             size
         );
     }

     // Handle Add to Cart for menu items
     if (e.target.classList.contains('add-to-cart-btn')) {
         const button = e.target;
         const menuItem = button.closest('.menu-item');
         const size = menuItem.querySelector('.size-option.active').getAttribute('data-size');
         const price = parseFloat(menuItem.querySelector('.size-option.active span:last-child').textContent.replace('₱', '')); // Get selected flavor

         addItemToCart(
             `${menuItem.getAttribute('data-id')}-${size}`, // Include flavor in ID
             `${menuItem.getAttribute('data-name')} (${size.charAt(0).toUpperCase() + size.slice(1)})`, // Include flavor in name
             price,
             'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
             size
         );
     }
     
     // Handle Remove Item
     if (e.target.classList.contains('remove-item')) {
         const itemId = e.target.getAttribute('data-id');
         removeItemFromCart(itemId);
     }
 });

 // Unified Add to Cart Function
 function addItemToCart(id, name, price, img, size) {
     const existingItem = cart.find(item => item.id === id);
     
     if (existingItem) {
         existingItem.quantity += 1;
     } else {
         cart.push({
             id,
             name,
             price,
             img,
             size,
             quantity: 1
         });
     }
     
     updateCart();
     showAddToCartMessage(name);
 }

 // Remove Item Function (decrements by 1 or removes if quantity is 1)
 function removeItemFromCart(itemId) {
     const itemIndex = cart.findIndex(item => item.id === itemId);
     
     if (itemIndex !== -1) {
         if (cart[itemIndex].quantity > 1) {
             cart[itemIndex].quantity -= 1;
         } else {
             cart.splice(itemIndex, 1);
         }
         updateCart();
     }
 }

 // Update Cart Display
 function updateCart() {
     cartItemsContainer.innerHTML = '';
     let total = 0;

     if (cart.length === 0) {
         cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
     } else {
         cart.forEach(item => {
             const itemTotal = item.price * item.quantity;
             total += itemTotal;

             const cartItemElement = document.createElement('div');
             cartItemElement.classList.add('cart-item');
             cartItemElement.innerHTML = `
                 <div class="cart-item-info">
                     <div class="cart-item-img">
                         <img src="${item.img}" alt="${item.name}">
                     </div>
                     <div>
                         <div class="cart-item-name">${item.name}</div>
                         ${item.size ? `<div class="cart-item-size">Size: ${item.size}</div>` : ''}
                         <div class="cart-item-price">₱${item.price} x ${item.quantity}</div>
                     </div>
                 </div>
                 <div>
                     <div>₱${itemTotal.toFixed(2)}</div>
                     <div class="remove-item" data-id="${item.id}">Remove</div>
                 </div>
             `;
             cartItemsContainer.appendChild(cartItemElement);
         });
     }

     cartTotalElement.textContent = total.toFixed(2);
     updateCartIcon();
     saveCartToLocalStorage();
 }

 // Save Cart to Local Storage
 function saveCartToLocalStorage() {
     localStorage.setItem('cart', JSON.stringify(cart));
 }

 // Show Notification
 function showAddToCartMessage(itemName) {
     const message = document.createElement('div');
     message.className = 'cart-notification';
     message.textContent = `${itemName} added to cart!`;
     document.body.appendChild(message);
     
     setTimeout(() => {
         message.remove();
     }, 3000);
 }

 // Update Cart Icon
 function updateCartIcon() {
     const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
     
     if (itemCount > 0) {
         cartIcon.innerHTML = `<i class="fas fa-shopping-cart"></i><span class="cart-count">${itemCount}</span>`;
     } else {
         cartIcon.innerHTML = '<i class="fas fa-shopping-cart"></i>';
     }
 }

 // Newsletter Form Submission
 const newsletterForm = document.querySelector('.newsletter-form');
 newsletterForm.addEventListener('submit', (e) => {
     e.preventDefault();
     const email = newsletterForm.querySelector('input').value;
     alert(`Thank you for subscribing with ${email}!`);
     newsletterForm.reset();
 });

 // Initialize cart on page load
 updateCart();

 // Handle flavor selection
 document.addEventListener('click', function (e) {
     if (e.target.closest('.flavor-option')) {
         const flavorOption = e.target.closest('.flavor-option');
         const flavorOptionsContainer = flavorOption.parentElement;

         // Update active state
         flavorOptionsContainer.querySelectorAll('.flavor-option').forEach(opt => {
             opt.classList.remove('active');
         });
         flavorOption.classList.add('active');
     }
 });