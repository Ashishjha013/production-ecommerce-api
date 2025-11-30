const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// GET /api/cart  — user's cart
exports.getCart = async (req, res) => {
  try {
    // Fetch the user's cart
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name price image category'
    );

    // If cart doesn't exist, return empty cart structure
    if (!cart) {
      return res.json({ items: [], totalItems: 0, totalPrice: 0 });
    }

    cart.items = cart.items.filter((item) => item.product != null);
    await cart.save();

    // Calculate total items and total price
    const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
      0
    );

    res.json({ items: cart.items, totalItems, totalPrice });
  } catch (err) {
    console.error('Get cart error: ', err);
    res.status(500).json({
      message: 'Server error while fetching cart.',
    });
  }
};

// POST /api/cart/add  — add or increase quantity
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({
        message: 'Product ID is required.',
      });
    }

    const qty = Math.max(1, Number(quantity) || 1);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    const existing = cart ? cart.items.find((i) => i.product.toString() === productId) : null;
    const currentQty = existing ? existing.quantity : 0;
    if (product.stock < currentQty + qty) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock.`,
      });
    }

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity: qty }],
      });
    } else {
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.items.push({ product: productId, quantity: qty });
      }
      await cart.save();
    }

    cart = await cart.populate('items.product', 'name price image category stock');
    res.json({ message: 'Item added to cart.', cart });
  } catch (err) {
    console.error('Added to cart error', err);
    res.status(500).json({
      message: 'Server error while adding to cart.',
    });
  }
};

// DELETE /api/cart/remove  — remove product from cart
exports.removeFromCart = async (req, res) => {
  try {
    // Validate request body
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID is required.' });

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    const updatedCart = await cart.populate('items.product', 'name price image category stock');
    res.json({ message: 'Item removed from cart', cart: updatedCart });
  } catch (err) {
    console.error('Remove from cart error: ', err);
    res.status(500).json({ message: 'Server error while removing from cart.' });
  }
};

// DELETE /api/cart/clear  — clear all items
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error: ', err);
    res.status(500).json({ message: 'Server error while clearing cart.' });
  }
};
