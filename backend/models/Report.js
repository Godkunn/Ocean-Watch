const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hazardType: {
    type: String,
    required: true,
    enum: ['tsunami', 'storm_surge', 'high_waves', 'swell_surge', 'coastal_current', 'abnormal_sea', 'other']
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  media: [String],
  status: {
    type: String,
    enum: ['reported', 'verified', 'in_progress', 'resolved'],
    default: 'reported'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);