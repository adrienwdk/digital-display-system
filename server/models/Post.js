// models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    required: true
  },
  role: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Nouveau champ pour le département
  service: {
    type: String,
    enum: ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité']
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Nouveau champ pour suivre si les notifications ont été envoyées
  notificationSent: {
    type: Boolean,
    default: false
  },
  images: [String],
  files: [{
    path: String,
    originalName: String,
    fileType: String,
    size: Number
  }],
  // Nouveaux champs pour les tags et l'approbation
  tags: [String],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);