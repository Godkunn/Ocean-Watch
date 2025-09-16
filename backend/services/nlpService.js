const axios = require('axios');

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:5001';

exports.analyzeText = async (text) => {
  try {
    const response = await axios.post(`${NLP_SERVICE_URL}/analyze`, {
      text: text
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calling NLP service:', error.message);
    throw error;
  }
};