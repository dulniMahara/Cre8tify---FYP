const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Notification = require('../models/notificationModel');

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
    const filter = {};
    if (req.query.type) filter.requestType = req.query.type;
    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/requests/customer/:customerId
// @desc    Get requests by customer
router.get('/customer/:customerId', async (req, res) => {
    try {
      const filter = { customerId: req.params.customerId };
      if (req.query.type) filter.requestType = req.query.type;
      const requests = await Request.find(filter).sort({ createdAt: -1 });
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

    // 🟢 ADD NOTIFICATION TRIGGER
    if (req.body.status && updatedRequest) {
        let title = 'Design Update';
        let message = `Your request for ${updatedRequest.productName} has been updated to ${req.body.status}.`;
        
        if (req.body.status === 'Completed') {
            title = 'Customization Approved! 🎉';
            message = `Great news! Your custom design for ${updatedRequest.productName} has been approved. You can now proceed to purchase it from your "My Custom Designs" dashboard.`;
        } else if (req.body.status === 'Rejected') {
            title = 'Design Update';
            message = `Your customization request for ${updatedRequest.productName} was not approved at this time.`;
        }

        await Notification.create({
            user: updatedRequest.customerId,
            title,
            message,
            type: 'status_update'
        });
    }

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
