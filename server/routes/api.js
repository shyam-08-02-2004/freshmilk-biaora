const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');

// Get all users (Admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a user (simplified for this demo)
router.post('/users', async (req, res) => {
  try {
    const { name, mobile, password, location, flat } = req.body;
    let user = await User.findOne({ mobile });
    if (user) {
      user.name = name || user.name;
      user.password = password || user.password;
      user.location = location || user.location;
      user.flat = flat || user.flat;
      await user.save();
    } else {
      user = new User({ name, mobile, password, location, flat });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders for a user
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (Admin)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update an order for a specific date
router.post('/orders', async (req, res) => {
  try {
    const { userId, date, milk, ghee, chach } = req.body;
    
    // If all quantities are 0, we can delete the order for that day
    if (milk === 0 && ghee === 0 && chach === 0) {
      await Order.findOneAndDelete({ userId, date });
      return res.json({ message: 'Order cleared' });
    }

    let order = await Order.findOne({ userId, date });
    if (order) {
      order.milk = milk;
      order.ghee = ghee;
      order.chach = chach;
      await order.save();
    } else {
      order = new Order({ userId, date, milk, ghee, chach });
      await order.save();
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
