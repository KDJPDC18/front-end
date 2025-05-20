// Simple Node.js backend to save order summary to a txt file

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // <-- Add this line
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // <-- Add this line
app.use(express.json());

app.post('/save-order', (req, res) => {
    const order = req.body;
    const now = new Date();
    const filename = `order_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.txt`;
    const filePath = path.join(__dirname, 'orders', filename);

    // Format order summary as text
    let content = `Order Summary - ${now.toLocaleString()}\n\n`;
    content += `Customer: ${order.firstname} ${order.surname}\n`;
    content += `Contact: ${order.contact}\n`;
    content += `Email: ${order.email}\n`;
    if (order.address) content += `Address: ${order.address}\n`;
    content += `Order Type: ${order.orderType}\n`;
    content += `Payment Method: ${order.paymentMethod}\n\n`;
    content += `Items:\n`;
    order.cart.forEach(item => {
        content += `- ${item.name} x${item.quantity} (₱${item.price} each)\n`;
        if (item.addons && item.addons.length) {
            item.addons.forEach(addon => {
                content += `   * Add-on: ${addon.name} x${addon.quantity} (₱${addon.price} each)\n`;
            });
        }
    });
    content += `\nTotal: ₱${order.total}\n`;

    // Ensure orders directory exists
    fs.mkdir(path.join(__dirname, 'orders'), { recursive: true }, (err) => {
        if (err) {
            res.status(500).send('Failed to create directory');
            return;
        }
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                res.status(500).send('Failed to save order');
            } else {
                res.send('Order saved');
            }
        });
    });
});

// Optional: Add a root route for browser GET requests
app.get('/', (req, res) => {
    res.send('Order backend is running. Use POST /save-order to save an order.');
});

app.listen(PORT, () => {
    console.log(`Order backend running at http://localhost:${PORT}`);
});
