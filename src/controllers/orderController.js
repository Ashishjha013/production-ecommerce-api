const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Place an order
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate('items.product', 'price stock name');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.name}`,
        });
      }

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      });

      totalAmount += item.product.price * item.quantity;
    }

    // Reduce stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error while placing order' });
  }
};

// Get orders for a user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: 'Server error while fetching orders',
    });
  }
};

// ADMIN: GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: 'Server error while fetching all orders',
    });
  }
};
