const express = require('express');
const multer = require('multer');
const Report = require('../models/Report');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Create report
router.post('/', verifyToken, upload.array('media', 5), async (req, res) => {
  try {
    const { hazardType, description, latitude, longitude, severity } = req.body;
    
    const report = new Report({
      userId: req.user.id,
      hazardType,
      description,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      severity: severity || 'medium',
      media: req.files ? req.files.map(file => file.filename) : []
    });
    
    await report.save();
    await report.populate('userId', 'username');
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const { hazardType, severity, startDate, endDate } = req.query;
    let filter = {};
    
    if (hazardType) filter.hazardType = hazardType;
    if (severity) filter.severity = severity;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const reports = await Report.find(filter)
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reports by location
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query;
    
    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('userId', 'username');
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;