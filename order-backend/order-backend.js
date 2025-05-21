const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Replace with your Supabase project credentials
const supabaseUrl = 'https://qshwxiosvzaajgjcipuu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzaHd4aW9zdnphYWpnamNpcHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc5MjA3OSwiZXhwIjoyMDYzMzY4MDc5fQ.46gYFvNj4f6wDBeRBy4dlzpDMYX7pRMmu5h9o1uehN4'; // Use Service Role Key only on the backend
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

app.post('/save-order', async (req, res) => {
    const order = req.body;

    try {
        const { data, error } = await supabase.from('orders').insert([
            {
                customer_name: `${order.firstname} ${order.surname}`,
                email: order.email,
                contact_number: order.contact,
                address: order.address || null,
                order_type: order.orderType,
                payment_method: order.paymentMethod,
                items: order.cart,
                total_amount: parseFloat(order.total),
                created_at: new Date().toISOString()
            }
        ]);

        if (error) {
            console.error('❌ Supabase insert error:', error);
            return res.status(500).json({ message: 'Failed to save order', error: error.message });
        }

        res.status(200).json({ message: '✅ Order saved to Supabase', data });
    } catch (err) {
        console.error('❌ Server error:', err);
        res.status(500).json({ message: 'Unexpected server error' });
    }
});

// Optional root route
app.get('/', (req, res) => {
    res.send('Backend is connected to Supabase. POST /save-order to submit orders.');
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
