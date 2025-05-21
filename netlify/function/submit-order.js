const { createClient } = require('@supabase/supabase-js');

// Set these via Netlify environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const {
      customerName,
      items,
      totalAmount,
      paymentMethod,
      deliveryOption,
    } = body;

    const { data, error } = await supabase.from('orders').insert([
      {
        customer_name: customerName,
        items,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        delivery_option: deliveryOption,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order submitted!', id: data[0].id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error saving order', error: err.message }),
    };
  }
};
