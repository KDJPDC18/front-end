// Prevent checkout if cart is empty (run before anything else)
let cart = [];
try {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
} catch (e) {
    cart = [];
}
if (!cart.length) {
    alert('Your cart is empty. Please add items before checking out.');
    window.history.back();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        const deliveryBtn = document.getElementById('delivery-btn');
        const pickupBtn = document.getElementById('pickup-btn');
        const cashBtn = document.getElementById('cash-btn');
        const gcashBtn = document.getElementById('gcash-btn');
        const step1 = document.getElementById('step-1');
        const step2Delivery = document.getElementById('step-2-delivery');
        const step3Form = document.getElementById('step-3-form');
        const step4Summary = document.getElementById('step-4-summary');
        const addressGroup = document.getElementById('address-group');
        const checkoutForm = document.getElementById('checkout-form');
        const userInfo = document.getElementById('user-info');
        const cartSummary = document.getElementById('cart-summary');
        const stepCustomize = document.createElement('div'); // Step for customization

        let orderType = ''; // Track delivery or pick-up
        let paymentMethod = ''; // Track payment method

        // Add customization step
        stepCustomize.id = 'step-customize';
        stepCustomize.classList.add('checkout-step', 'hidden');
        stepCustomize.innerHTML = `
            <h2>Customize Your Order</h2>
            <div id="customize-items"></div>
            <button class="btn" id="customize-done-btn">Done</button>
        `;
        document.querySelector('.checkout-container').insertBefore(stepCustomize, step3Form);

        // Add pick-up payment step
        const step2Pickup = document.createElement('div');
        step2Pickup.id = 'step-2-pickup';
        step2Pickup.classList.add('checkout-step', 'hidden');
        step2Pickup.innerHTML = `
            <h2>Choose Payment Method</h2>
            <button class="btn" id="pickup-cash-btn">Cash</button>
            <button class="btn" id="pickup-gcash-btn">GCash</button>
        `;
        document.querySelector('.checkout-container').insertBefore(step2Pickup, stepCustomize);

        // Add a left arrow for navigating back to the previous page or option
        const backArrow = document.createElement('div');
        backArrow.innerHTML = `
            <a href="javascript:void(0)" id="back-arrow" class="back-arrow" style="position: absolute; top: 20px; left: 20px; font-size: 40px; text-decoration: none; color: #000;">
                &#8592;
            </a>
        `;
        document.body.appendChild(backArrow);

        const backArrowElement = document.getElementById('back-arrow');
        backArrowElement.addEventListener('click', () => {
            if (!step2Delivery.classList.contains('hidden')) {
                // Go back to step 1 from step 2 (Delivery)
                step2Delivery.classList.add('hidden');
                step1.classList.remove('hidden');
            } else if (!step2Pickup.classList.contains('hidden')) {
                // Go back to step 1 from step 2 (Pick-Up)
                step2Pickup.classList.add('hidden');
                step1.classList.remove('hidden');
            } else if (!stepCustomize.classList.contains('hidden')) {
                // Reset add-ons when going back to step 2 from customization
                resetAddOns();
                stepCustomize.classList.add('hidden');
                if (orderType === 'Delivery') {
                    step2Delivery.classList.remove('hidden');
                } else if (orderType === 'Pick-Up') {
                    step2Pickup.classList.remove('hidden');
                }
            } else if (!step3Form.classList.contains('hidden')) {
                // Reset add-ons when going back to customization from step 3
                resetAddOns();
                step3Form.classList.add('hidden');
                stepCustomize.classList.remove('hidden');
            } else if (!step4Summary.classList.contains('hidden')) {
                // Go back to step 3 (form) from order summary
                step4Summary.classList.add('hidden');
                step3Form.classList.remove('hidden');
            } else if (!step1.classList.contains('hidden')) {
                // Go back to the previous page from step 1
                window.history.back();
            }
            
        });

        // Function to reset add-ons
        function resetAddOns() {
            cart.forEach(item => {
                if (item.addons) {
                    item.addons = []; // Clear all add-ons
                }
            });
        }

        // Handle Delivery Option
        deliveryBtn.addEventListener('click', () => {
            orderType = 'Delivery';
            step1.classList.add('hidden');
            step2Delivery.classList.remove('hidden');
            addressGroup.classList.remove('hidden'); // Show address field for delivery
        });

        // Handle Pick-Up Option
        pickupBtn.addEventListener('click', () => {
            orderType = 'Pick-Up';
            step1.classList.add('hidden');
            step2Pickup.classList.remove('hidden'); // Show payment step for pick-up
            addressGroup.classList.add('hidden'); // Hide address field for pick-up
        });

        // Handle Payment Method Selection for Delivery
        cashBtn.addEventListener('click', () => {
            paymentMethod = 'Cash';
            step2Delivery.classList.add('hidden');
            stepCustomize.classList.remove('hidden');
            showCustomizationOptions();
        });

        gcashBtn.addEventListener('click', () => {
            paymentMethod = 'GCash';
            step2Delivery.classList.add('hidden');
            stepCustomize.classList.remove('hidden');
            showCustomizationOptions();
        });

        // Handle Payment Method Selection for Pick-Up
        step2Pickup.addEventListener('click', (e) => {
            if (e.target.id === 'pickup-cash-btn') {
                paymentMethod = 'Cash';
                step2Pickup.classList.add('hidden');
                stepCustomize.classList.remove('hidden');
                showCustomizationOptions();
            } else if (e.target.id === 'pickup-gcash-btn') {
                paymentMethod = 'GCash';
                step2Pickup.classList.add('hidden');
                stepCustomize.classList.remove('hidden');
                showCustomizationOptions();
            }
        });

        // Show customization options
        function showCustomizationOptions() {
            const coffeeItems = [
                'iced americano', 'iced latte', 'iced vanilla', 'iced spanish latte', 
                'iced caramel', 'iced salted caramel', 'iced mocha', 
                'iced white chocolate', 'iced hazelnut', 'iced vanilla sweetcream'
            ];
            const nonCoffeeItems = [
                'strawberry milk', 'blueberry milk', 'mango milk', 'matcha'
            ];
            const fruitSodaItems = ['kiwi', 'lychee', 'honey peach', 'green apple', 'passion fruit', 'lemon'];

            const customizeItems = document.getElementById('customize-items');
            customizeItems.innerHTML = cart.map((item, index) => {
                if (coffeeItems.some(coffee => item.name.toLowerCase().includes(coffee))) {
                    // Add-ons for Coffee
                    return `
                        <div class="customize-item">
                            <h3>${item.name}</h3>
                            <div class="addon">
                                <span>Cold Brew (+₱10)</span>
                                <button class="addon-minus" data-index="${index}" data-addon="ColdBrew" data-price="10">-</button>
                                <span id="addon-count-${index}-ColdBrew">0</span>
                                <button class="addon-plus" data-index="${index}" data-addon="ColdBrew" data-price="10">+</button>
                            </div>
                            <div class="addon">
                                <span>Milk (+₱10)</span>
                                <button class="addon-minus" data-index="${index}" data-addon="Milk" data-price="10">-</button>
                                <span id="addon-count-${index}-Milk">0</span>
                                <button class="addon-plus" data-index="${index}" data-addon="Milk" data-price="10">+</button>
                            </div>
                            <div class="addon">
                                <span>Syrup (+₱10)</span>
                                <button class="addon-minus" data-index="${index}" data-addon="Syrup" data-price="10">-</button>
                                <span id="addon-count-${index}-Syrup">0</span>
                                <button class="addon-plus" data-index="${index}" data-addon="Syrup" data-price="10">+</button>
                            </div>
                            <div class="addon">
                                <span>Ice (+₱5)</span>
                                <button class="addon-minus" data-index="${index}" data-addon="Ice" data-price="5">-</button>
                                <span id="addon-count-${index}-Ice">0</span>
                                <button class="addon-plus" data-index="${index}" data-addon="Ice" data-price="5">+</button>
                            </div>
                        </div>
                    `;
                } else if (nonCoffeeItems.some(nonCoffee => item.name.toLowerCase().includes(nonCoffee))) {
                    // Add-ons for Non-Coffee
                    return `
                        <div class="customize-item">
                            <h3>${item.name}</h3>
                            <div class="addon">
                                <span>Milk (+₱10)</span>
                                <button class="addon-minus" data-index="${index}" data-addon="Milk" data-price="10">-</button>
                                <span id="addon-count-${index}-Milk">0</span>
                                <button class="addon-plus" data-index="${index}" data-addon="Milk" data-price="10">+</button>
                            </div>
                            <div class="addon">
                                <span>Ice (+₱5)</span>
                                <button class="addon-minus" data-index="${index}" data-addon="Ice" data-price="5">-</button>
                                <span id="addon-count-${index}-Ice">0</span>
                                <button class="addon-plus" data-index="${index}" data-addon="Ice" data-price="5">+</button>
                            </div>
                        </div>
                    `;
                } else if (fruitSodaItems.some(fruit => item.name.toLowerCase().includes(fruit))) {
                    // Add-ons for Fruit Soda
                    return `
                        <div class="customize-item">
                            <h3>${item.name}</h3>
                            <div class="addon">
                                <span>Nata de Coco (+₱15)</span>
                                <button class="addon-minus" data-index="${index}" data-addon="NataDeCoco" data-price="15">-</button>
                                <span id="addon-count-${index}-NataDeCoco">0</span>
                                <button class="addon-plus" data-index="${index}" data-addon="NataDeCoco" data-price="15">+</button>
                            </div>
                            <div class="addon">
                                <span>Ice (+₱5)</span>
                                <button class="addon-minus" data-index="${index}" data-addon="Ice" data-price="5">-</button>
                                <span id="addon-count-${index}-Ice">0</span>
                                <button class="addon-plus" data-index="${index}" data-addon="Ice" data-price="5">+</button>
                            </div>
                        </div>
                    `;
                }
                return ''; // No add-ons for other items
            }).join('');

            // Always initialize the addons array for each cart item
            cart.forEach(item => {
                if (!item.addons) item.addons = [];
            });

            // Add event listeners for plus and minus buttons
            document.querySelectorAll('.addon-plus').forEach(button => {
                button.addEventListener('click', () => {
                    const index = parseInt(button.dataset.index, 10);
                    // Use the exact string for id and add-on name to avoid mismatch
                    const addon = button.dataset.addon;
                    const price = parseInt(button.dataset.price, 10);
                    const countSpan = document.getElementById(`addon-count-${index}-${addon}`);
                    let count = parseInt(countSpan.textContent, 10);

                    // Only allow 1 per add-on
                    const existingAddon = cart[index].addons.find(a => a.name.replace(/ /g, '') === addon);
                    if (!existingAddon || existingAddon.quantity < 1) {
                        count = 1;
                        countSpan.textContent = count;
                        if (existingAddon) {
                            existingAddon.quantity = 1;
                        } else {
                            cart[index].addons.push({ name: addon.replace(/([A-Z])/g, ' $1').trim(), price, quantity: 1 });
                        }
                        cart[index].price += price;
                    } else {
                        alert('You can only add 1 of each add-on per item.');
                    }
                });
            });

            document.querySelectorAll('.addon-minus').forEach(button => {
                button.addEventListener('click', () => {
                    const index = parseInt(button.dataset.index, 10);
                    const addon = button.dataset.addon;
                    const price = parseInt(button.dataset.price, 10);
                    const countSpan = document.getElementById(`addon-count-${index}-${addon}`);
                    let count = parseInt(countSpan.textContent, 10);

                    if (count > 0) {
                        count = 0;
                        countSpan.textContent = count;
                        const existingAddon = cart[index].addons.find(a => a.name.replace(/ /g, '') === addon);
                        if (existingAddon) {
                            cart[index].price -= price * existingAddon.quantity;
                            cart[index].addons = cart[index].addons.filter(a => a.name.replace(/ /g, '') !== addon);
                        }
                    }
                });
            });
        }

        // Handle customization completion
        document.getElementById('customize-done-btn').addEventListener('click', () => {
            stepCustomize.classList.add('hidden');
            step3Form.classList.remove('hidden');
        });

        // Handle Form Submission
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(checkoutForm);
            const userDetails = Object.fromEntries(formData.entries());

            // Display user info
            userInfo.innerHTML = `
                <h3>User Information</h3>
                <p><strong>Surname:</strong> ${userDetails.surname}</p>
                <p><strong>First Name:</strong> ${userDetails.firstname}</p>
                <p><strong>Contact Number:</strong> ${userDetails.contact}</p>
                <p><strong>Email:</strong> ${userDetails.email}</p>
                ${userDetails.address ? `<p><strong>Address:</strong> ${userDetails.address}</p>` : ''}
                <p><strong>Order Type:</strong> ${orderType}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            `;

            // Display cart summary
            cartSummary.innerHTML = `
                <h3>Cart Summary</h3>
                ${cart.map(item => {
                    const originalPrice = item.price - (item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0);
                    const addonsTotal = item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0;
                    const totalPrice = (originalPrice + addonsTotal) * item.quantity;

                    return `
                        <p>
                            ${item.name} - Original Price: ₱${originalPrice.toFixed(2)} 
                            ${item.addons ? `+ Add-ons: ₱${addonsTotal.toFixed(2)}` : ''} 
                            x ${item.quantity} = ₱${totalPrice.toFixed(2)}
                        </p>
                        ${item.addons ? `<ul>${item.addons.map(addon => `<li>${addon.name} x ${addon.quantity} (+₱${(addon.price * addon.quantity).toFixed(2)})</li>`).join('')}</ul>` : ''}
                    `;
                }).join('')}
                <p><strong>Total:</strong> ₱${cart.reduce((total, item) => {
                    const originalPrice = item.price - (item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0);
                    const addonsTotal = item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0;
                    return total + ((originalPrice + addonsTotal) * item.quantity);
                }, 0).toFixed(2)}</p>
                <button class="btn" id="final-checkout-btn" style="margin-top:20px;">Checkout</button>
            `;

            // Add GCash QR code and message if GCash is chosen
            if (paymentMethod === 'GCash') {
                let gcashMessage = '';
                if (orderType === 'Delivery') {
                    gcashMessage = `
                        <p>You can scan the QR code below to pay for your order.</p>
                        <p>You can pay right away or when the order is delivered to your place.</p>
                    `;
                } else if (orderType === 'Pick-Up') {
                    gcashMessage = `
                        <p>You can scan the QR code below to pay for your order.</p>
                        <p>You can pay right away or when you are at the shop to pick up your order.</p>
                    `;
                }

                cartSummary.innerHTML += `
                    <div class="gcash-payment" style="text-align: center;">
                        <h3>GCash Payment</h3>
                        ${gcashMessage}
                        <img src="Gcash QR.jpg" alt="GCash QR Code" class="gcash-qr" style="width: 400px; height: 600px;">
                    </div>
                `;
            }

            step3Form.classList.add('hidden');
            step4Summary.classList.remove('hidden');

            // Add event listener for the final checkout button
            setTimeout(() => { // Ensure DOM is updated
                const finalCheckoutBtn = document.getElementById('final-checkout-btn');
                if (finalCheckoutBtn) {
                    finalCheckoutBtn.addEventListener('click', function() {
                        // --- Email sending logic (client-side) ---
                        // Note: This requires a backend or a third-party email API (like EmailJS, SMTP.js, etc.)
                        // The following is a placeholder for integration.

                        // Generate digital receipt HTML
                        const receiptHtml = `
                            <div style="max-width:400px;margin:40px auto;padding:24px;background:#fff;border-radius:10px;box-shadow:0 2px 12px #0002;text-align:left;">
                                <h2 style="text-align:center;color:#8B5A2B;">Kayle Brews</h2>
                                <h3 style="text-align:center;">Digital Receipt</h3>
                                <hr>
                                <p><strong>Name:</strong> ${userDetails.firstname} ${userDetails.surname}</p>
                                <p><strong>Email:</strong> ${userDetails.email}</p>
                                <p><strong>Contact:</strong> ${userDetails.contact}</p>
                                ${userDetails.address ? `<p><strong>Address:</strong> ${userDetails.address}</p>` : ''}
                                <p><strong>Order Type:</strong> ${orderType}</p>
                                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                                <hr>
                                <h4>Order Items:</h4>
                                <ul style="padding-left:18px;">
                                    ${cart.map(item => {
                                        const originalPrice = item.price - (item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0);
                                        const addonsTotal = item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0;
                                        const totalPrice = (originalPrice + addonsTotal) * item.quantity;
                                        return `
                                            <li>
                                                <div><strong>${item.name}</strong> x ${item.quantity} - ₱${totalPrice.toFixed(2)}</div>
                                                ${item.addons && item.addons.length ? `<ul style="margin:0 0 8px 16px;">${item.addons.map(addon => `<li>${addon.name} x ${addon.quantity} (+₱${(addon.price * addon.quantity).toFixed(2)})</li>`).join('')}</ul>` : ''}
                                            </li>
                                        `;
                                    }).join('')}
                                </ul>
                                <hr>
                                <p style="font-size:18px;"><strong>Total Paid:</strong> ₱${cart.reduce((total, item) => {
                                    const originalPrice = item.price - (item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0);
                                    const addonsTotal = item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0;
                                    return total + ((originalPrice + addonsTotal) * item.quantity);
                                }, 0).toFixed(2)}</p>
                                <p style="text-align:center;margin-top:24px;">Thank you for your order!</p>
                            </div>
                        `;

                        // Show digital receipt in a modal
                        const receiptModal = document.createElement('div');
                        receiptModal.style.position = 'fixed';
                        receiptModal.style.top = '0';
                        receiptModal.style.left = '0';
                        receiptModal.style.width = '100vw';
                        receiptModal.style.height = '100vh';
                        receiptModal.style.background = 'rgba(0,0,0,0.7)';
                        receiptModal.style.zIndex = '9999';
                        receiptModal.style.display = 'flex';
                        receiptModal.style.justifyContent = 'center';
                        receiptModal.style.alignItems = 'center';
                        receiptModal.innerHTML = `
                            <div style="position:relative;">
                                <button id="close-receipt-btn" style="position:absolute;top:-30px;right:0;font-size:2rem;background:none;border:none;color:#fff;cursor:pointer;">&times;</button>
                                ${receiptHtml}
                            </div>
                        `;
                        document.body.appendChild(receiptModal);

                        // Only clear cart and close modal, do NOT reset checkout steps or redirect
                        document.getElementById('close-receipt-btn').onclick = function() {
                            document.body.removeChild(receiptModal);
                            localStorage.removeItem('cart');
                            
                        const orderData = {
                            firstname: userDetails.firstname,
                            surname: userDetails.surname,
                            contact: userDetails.contact,
                            email: userDetails.email,
                            address: userDetails.address,
                            orderType: orderType,
                            paymentMethod: paymentMethod,
                            cart: cart,
                            total: cart.reduce((total, item) => {
                                const originalPrice = item.price - (item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0);
                                const addonsTotal = item.addons ? item.addons.reduce((sum, a) => sum + (a.price * a.quantity), 0) : 0;
                                return total + ((originalPrice + addonsTotal) * item.quantity);
                            }, 0).toFixed(2)
                        };
                        sendOrderToBackend(orderData);
                            
                        window.location.href = 'index.html'; // Redirect to home page
                            // Do not reset/hide steps or redirect, just close the modal
                        };

                        // Send order data to backend
                        
                    });
                }
            }, 100);
        });

        // Consent modal before proceeding to forms
        function showConsentModal() {
            const consentModal = document.createElement('div');
            consentModal.style.position = 'fixed';
            consentModal.style.top = '0';
            consentModal.style.left = '0';
            consentModal.style.width = '100vw';
            consentModal.style.height = '100vh';
            consentModal.style.background = 'rgba(0,0,0,0.7)';
            consentModal.style.zIndex = '99999';
            consentModal.style.display = 'flex';
            consentModal.style.justifyContent = 'center';
            consentModal.style.alignItems = 'center';
            consentModal.innerHTML = `
                <div style="background:#fff;padding:32px 24px;border-radius:10px;max-width:400px;text-align:center;box-shadow:0 2px 12px #0002;">
                    <h2 style="color:#8B5A2B;">Data Privacy Consent</h2>
                    <p style="margin:18px 0 24px 0;">
                        To proceed with your order, we need your consent to collect and process your personal information (name, contact, address, and order details) for the purpose of order fulfillment and communication. Your data will be handled securely and only used for this transaction.
                    </p>
                    <button id="consent-accept-btn" class="btn" style="margin-right:12px;">I Agree</button>
                    <button id="consent-decline-btn" class="btn" style="background:#ccc;color:#333;">Decline</button>
                </div>
            `;
            document.body.appendChild(consentModal);

            document.getElementById('consent-accept-btn').onclick = function() {
                document.body.removeChild(consentModal);
                // Show the first step (choose order type)
                step1.classList.remove('hidden');
            };
            document.getElementById('consent-decline-btn').onclick = function() {
                alert('You must accept the data privacy consent to proceed with your order.');
                window.location.href = "Menu.html";
            };
        }

        // Hide all steps initially and show consent modal
        step1.classList.add('hidden');
        step2Delivery.classList.add('hidden');
        step2Pickup.classList.add('hidden');
        stepCustomize.classList.add('hidden');
        step3Form.classList.add('hidden');
        step4Summary.classList.add('hidden');
        showConsentModal();
    });
}

// After successful checkout and before showing the digital receipt
function sendOrderToBackend(orderData) {
    fetch('http://localhost:3001/save-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(res => res.ok ? res.text() : Promise.reject('Failed to save order'))
    .then(msg => {
        // Optionally show a message or log
        console.log(msg);
    })
    .catch(err => {
        alert('Order could not be saved to backend.\n\nMake sure:\n- The backend server is running (node order-backend.js)\n- You are not blocking requests (CORS/network error)\n- The backend is accessible at http://localhost:3001/save-order');
        console.error(err);
    });
}