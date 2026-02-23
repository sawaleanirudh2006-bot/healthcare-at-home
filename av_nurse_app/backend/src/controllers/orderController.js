const supabase = require('../config/supabase');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }

    // 1. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
            user_id: req.user.id,
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            tax_price: taxPrice,
            shipping_price: shippingPrice,
            total_price: totalPrice,
        }])
        .select()
        .single();

    if (orderError) {
        return res.status(500).json({ message: orderError.message });
    }

    // 2. Create Order Items
    const itemsToInsert = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.product, // Assuming product ID is passed
        name: item.name,
        qty: item.qty,
        price: item.price,
        image: item.image
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

    if (itemsError) {
        // Ideally rollback order here, but keeping it simple
        return res.status(500).json({ message: itemsError.message });
    }

    res.status(201).json(order);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      users (name, email),
      order_items (*)
    `)
        .eq('id', req.params.id)
        .single();

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const { data: order, error } = await supabase
        .from('orders')
        .update({
            is_paid: true,
            paid_at: new Date().toISOString(),
            payment_result: {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            }
        })
        .eq('id', req.params.id)
        .select()
        .single();

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
};
