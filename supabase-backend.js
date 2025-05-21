// supabase-backend.js - Modern Supabase implementation

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

// Supabase configuration
const SUPABASE_URL = 'https://qshwxiosvzaajgjcipuu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzaHd4aW9zdnphYWpnamNpcHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTIwNzksImV4cCI6MjA2MzM2ODA3OX0.6qT7FnaXDY4tw48B8kyu0el9obkJxaFLtyrlgdlb4WU'; // Use service role for backend
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Email configuration (same as before)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kaylebrews@gmail.com',
        pass: 'mtuk scgc sjvs dhnx'
    }
});

app.use(cors());
app.use(express.json());

app.post('/save-order', async (req, res) => {
    const order = req.body;
    
    try {
        // 1. Save to Supabase
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                customer_name: `${order.firstname} ${order.surname}`,
                contact_number: order.contact,
                email: order.email,
                address: order.address || null,
                order_type: order.orderType,
                payment_method: order.paymentMethod,
                items: order.cart,
                total_amount: parseFloat(order.total),
                status: 'pending'
            }])
            .select();
        
        if (error) throw error;

        // 2. Send email (same as before)
        const now = new Date();
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

        const mailOptions = {
            from: 'kaylebrews@gmail.com',
            to: order.email, // Now using the customer's actual email
            cc: 'kaylebrews@gmail.com', // Also send to yourself
            subject: `Your Kayle Brews Order - ${now.toLocaleString()}`,
            text: content,
            html: generateHtmlReceipt(order) // You can create this function
        };

        await transporter.sendMail(mailOptions);
        
        res.json({
            success: true,
            message: 'Order saved and confirmation sent',
            order_id: data[0].id
        });
        
    } catch (error) {
        console.error('Order processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process order'
        });
    }
});

// Helper function for HTML email
function generateHtmlReceipt(order) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B5A2B;">Kayle Brews Order Confirmation</h2>
            <p>Thank you for your order!</p>
            <!-- Add your HTML receipt template here -->
        </div>
    `;
}

app.listen(PORT, () => {
    console.log(`Supabase backend running at http://localhost:${PORT}`);
});
