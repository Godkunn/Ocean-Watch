const express = require('express');
const axios = require('axios');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get social media posts (mock implementation)
router.get('/posts', verifyToken, async (req, res) => {
  try {
    const { keyword, limit = 10 } = req.query;
    
    // In a real implementation, this would connect to Twitter/Facebook APIs
    // For demo purposes, we'll return mock data
    
    const mockPosts = [
      {
        id: 1,
        text: `High waves observed at Marina Beach today. ${keyword || 'ocean hazard'}`,
        user: 'BeachLover23',
        platform: 'twitter',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        location: { latitude: 13.0560, longitude: 80.2790 }
      },
      {
        id: 2,
        text: `Unusual tidal patterns noticed in Chennai. ${keyword || 'ocean hazard'}`,
        user: 'WeatherWatcher',
        platform: 'facebook',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        location: { latitude: 13.0827, longitude: 80.2707 }
      },
      {
        id: 3,
        text: `Strong currents at Vizag beach today. ${keyword || 'ocean hazard'}`,
        user: 'SurferDude',
        platform: 'twitter',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        location: { latitude: 17.6868, longitude: 83.2185 }
      }
    ];
    
    // Filter by keyword if provided
    const filteredPosts = keyword 
      ? mockPosts.filter(post => post.text.toLowerCase().includes(keyword.toLowerCase()))
      : mockPosts;
    
    res.json(filteredPosts.slice(0, limit));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analyze sentiment (mock implementation)
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    // In a real implementation, this would use an NLP library
    // For demo purposes, we'll return mock analysis
    
    const sentiments = ['positive', 'negative', 'neutral'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    const keywords = text ? text.split(' ').slice(0, 5) : ['ocean', 'hazard', 'warning', 'beach', 'safety'];
    
    res.json({
      sentiment: randomSentiment,
      keywords: keywords,
      urgency: Math.random() > 0.7 ? 'high' : 'medium'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Share to social media
router.post('/share', verifyToken, async (req, res) => {
  try {
    const { postId, platform } = req.body;
    
    // In a real implementation, this would use the respective platform's API
    // For demo purposes, we'll return a mock share URL
    
    const shareUrl = `https://${platform}.com/share/${postId}`;
    
    // Update share count in the database
    // This would be implemented in a real scenario
    
    res.json({ url: shareUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;