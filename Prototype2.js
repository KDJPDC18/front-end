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

        // Get image from data-img attribute or fallback to a default
        const img = menuItem.getAttribute('data-img') || 'Fries.png';

        addItemToCart(
            `${menuItem.getAttribute('data-id')}-${size}-${flavor}`, // Include flavor in ID
            `${menuItem.getAttribute('data-name')} (${size.charAt(0).toUpperCase() + size.slice(1)}, ${flavor.charAt(0).toUpperCase() + flavor.slice(1)})`, // Include flavor in name
            price,
            img,
            size
        );
    }

    // Handle Add to Cart for menu items
    if (e.target.classList.contains('add-to-cart-btn')) {
        const button = e.target;
        const menuItem = button.closest('.menu-item');
        const size = menuItem.querySelector('.size-option.active').getAttribute('data-size');
        const price = parseFloat(menuItem.querySelector('.size-option.active span:last-child').textContent.replace('₱', ''));

        // Get image from data-img attribute or fallback to a default
        const img = menuItem.getAttribute('data-img') || 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';

        addItemToCart(
            `${menuItem.getAttribute('data-id')}-${size}`,
            `${menuItem.getAttribute('data-name')} (${size.charAt(0).toUpperCase() + size.slice(1)})`,
            price,
            img,
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
    
    updateCart(); // Update cart and save to localStorage
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
                    <div class="cart-item-controls">
                        <button class="cart-minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="cart-plus" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }

    cartTotalElement.textContent = total.toFixed(2);
    updateCartIcon();
    saveCartToLocalStorage(); // Save cart after updating

    // Add event listeners for plus and minus buttons
    document.querySelectorAll('.cart-plus').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            if (item) {
                item.quantity++;
                updateCart();
            }
        });
    });

    document.querySelectorAll('.cart-minus').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart.splice(cart.indexOf(item), 1);
                }
                updateCart();
            }
        });
    });
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

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Function to render cart items
    function renderCart() {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <span>${item.name}</span>
                <div class="cart-item-controls">
                    <button class="cart-minus" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="cart-plus" data-index="${index}">+</button>
                </div>
                <span>₱${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        // Update total price
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = total.toFixed(2);

        // Add event listeners for plus and minus buttons
        document.querySelectorAll('.cart-plus').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.dataset.index;
                cart[index].quantity++;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            });
        });

        document.querySelectorAll('.cart-minus').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.dataset.index;
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                } else {
                    cart.splice(index, 1); // Remove item if quantity is 0
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            });
        });
    }

    // Initial render of the cart
    renderCart();
});

// Simple localStorage-based review system
    function loadReviews() {
        const reviews = JSON.parse(localStorage.getItem('customerReviews') || '[]');
        const container = document.getElementById('reviews-container');
        if (!reviews.length) {
            container.innerHTML = '<p style="color:#888;">No reviews yet. Be the first to leave feedback!</p>';
            return;
        }
        container.innerHTML = reviews.slice(-5).reverse().map(r => `
            <div style="background:#fff;border-radius:8px;padding:14px 12px;margin-bottom:12px;box-shadow:0 1px 6px #0001;">
                <div style="font-size:15px;color:#333;">${r.message.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
                <div style="font-size:13px;color:#8B5A2B;margin-top:6px;">
                    — ${r.name ? r.name.replace(/</g,"&lt;").replace(/>/g,"&gt;") : "Anonymous"}
                </div>
            </div>
        `).join('');
    }

    document.getElementById('review-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('review-name').value.trim();
        const message = document.getElementById('review-message').value.trim();
        if (!message) return;
        const reviews = JSON.parse(localStorage.getItem('customerReviews') || '[]');
        reviews.push({ name, message, date: new Date().toISOString() });
        localStorage.setItem('customerReviews', JSON.stringify(reviews));
        document.getElementById('review-form').reset();
        loadReviews();
        alert('Thank you for your feedback!');
    });

    document.addEventListener('DOMContentLoaded', loadReviews);

