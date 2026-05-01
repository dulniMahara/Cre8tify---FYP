const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// @route   POST /api/requests
// @desc    Create a new design request
router.post('/', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   GET /api/requests
// @desc    Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/requests/customer/:customerId
// @desc    Get requests by customer
router.get('/customer/:customerId', async (req, res) => {
    try {
      const requests = await Request.find({ customerId: req.params.customerId }).sort({ createdAt: -1 });
      res.json(requests);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/requests/:id
// @desc    Update request status or details
router.put('/:id', async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete a request
router.delete('/:id', async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
