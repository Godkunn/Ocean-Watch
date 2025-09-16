const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['hazard', 'discussion', 'news', 'update'],
    default: 'hazard'
  },
  hazardType: {
    type: String,
    enum: ['tsunami', 'storm_surge', 'high_waves', 'swell_surge', 
           'coastal_current', 'abnormal_sea', 'flood', 'erosion', 'other'],
    required: function() {
      return this.type === 'hazard';
    }
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
    },
    name: String
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'verified', 'in_progress', 'resolved', 'false_alarm'],
    default: 'reported'
  },
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'document']
    },
    caption: String
  }],
  votes: {
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    score: {
      type: Number,
      default: 0
    }
  },
  shares: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  nlpAnalysis: {
    isDisasterRelated: Boolean,
    confidence: Number,
    keywords: [String],
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries and sorting
postSchema.index({ location: '2dsphere' });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'votes.score': -1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);