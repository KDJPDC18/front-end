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
    // Initialize Supabase client at the top level
    const SUPABASE_URL = 'https://qshwxiosvzaajgjcipuu.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzaHd4aW9zdnphYWpnamNpcHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTIwNzksImV4cCI6MjA2MzM2ODA3OX0.6qT7FnaXDY4tw48B8kyu0el9obkJxaFLtyrlgdlb4WU';
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    document.addEventListener('DOMContentLoaded', () => {
        // ... [keep all your existing DOM element declarations and setup code] ...

        // Handle Form Submission
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(checkoutForm);
            const userDetails = Object.fromEntries(formData.entries());

            // [keep all your existing display code for user info and cart summary] ...

            // Add event listener for the final checkout button
            setTimeout(() => {
                const finalCheckoutBtn = document.getElementById('final-checkout-btn');
                if (finalCheckoutBtn) {
                    finalCheckoutBtn.addEventListener('click', async function() {
                        // Generate order data
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

                        // Save to Supabase
                        try {
                            const { data, error } = await supabase
                                .from('orders')
                                .insert([
                                    {
                                        customer_name: `${orderData.firstname} ${orderData.surname}`,
                                        contact_number: orderData.contact,
                                        email: orderData.email,
                                        address: orderData.address || null,
                                        order_type: orderData.orderType,
                                        payment_method: orderData.paymentMethod,
                                        items: orderData.cart,
                                        total_amount: parseFloat(orderData.total),
                                        status: 'pending'
                                    }
                                ]);
                            
                            if (error) throw error;

                            // Show receipt only after successful save
                            showReceiptModal(userDetails, orderData);
                            
                        } catch (err) {
                            console.error('Error saving order:', err);
                            alert('Failed to save order. Please try again.');
                        }
                    });
                }
            }, 100);
        });

        // Moved receipt modal to its own function
        function showReceiptModal(userDetails, orderData) {
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
                    <p style="font-size:18px;"><strong>Total Paid:</strong> ₱${orderData.total}</p>
                    <p style="text-align:center;margin-top:24px;">Thank you for your order!</p>
                </div>
            `;

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

            document.getElementById('close-receipt-btn').onclick = function() {
                document.body.removeChild(receiptModal);
                localStorage.removeItem('cart');
                window.location.href = 'index.html';
            };
        }

        // [keep all your other existing functions] ...
    });
}
