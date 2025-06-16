// server/models/Post.js - Version avec système de réactions
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
  service: {
    type: String,
    enum: ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité', 'general'],
    default: 'general'
  },
  // NOUVEAU: Système de réactions
  reactions: {
    like: {
      count: { type: Number, default: 0 },
      users: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        reactedAt: { type: Date, default: Date.now }
      }]
    },
    love: {
      count: { type: Number, default: 0 },
      users: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        reactedAt: { type: Date, default: Date.now }
      }]
    },
    bravo: {
      count: { type: Number, default: 0 },
      users: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        reactedAt: { type: Date, default: Date.now }
      }]
    },
    interesting: {
      count: { type: Number, default: 0 },
      users: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        reactedAt: { type: Date, default: Date.now }
      }]
    },
    welcome: {
      count: { type: Number, default: 0 },
      users: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        reactedAt: { type: Date, default: Date.now }
      }]
    }
  },
  // Ancien système de likes (conservé pour compatibilité)
  likes: {
    type: Number,
    default: 0
  },
  // SUPPRIMÉ: comments (plus utilisé)
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
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

// Méthode pour calculer le total des réactions
PostSchema.methods.getTotalReactions = function() {
  return Object.values(this.reactions).reduce((total, reaction) => total + reaction.count, 0);
};

// Méthode pour ajouter une réaction
PostSchema.methods.addReaction = function(userId, userName, reactionType) {
  const validReactions = ['like', 'love', 'bravo', 'interesting', 'welcome'];
  
  if (!validReactions.includes(reactionType)) {
    throw new Error('Type de réaction invalide');
  }
  
  // Vérifier si l'utilisateur a déjà réagi
  const existingReactionType = this.getUserReaction(userId);
  
  // Si l'utilisateur avait déjà une réaction, la retirer
  if (existingReactionType) {
    this.removeReaction(userId, existingReactionType);
  }
  
  // Ajouter la nouvelle réaction
  this.reactions[reactionType].users.push({
    userId: userId,
    userName: userName,
    reactedAt: new Date()
  });
  this.reactions[reactionType].count += 1;
  
  return this;
};

// Méthode pour retirer une réaction
PostSchema.methods.removeReaction = function(userId, reactionType) {
  const reaction = this.reactions[reactionType];
  if (reaction) {
    reaction.users = reaction.users.filter(user => user.userId.toString() !== userId.toString());
    reaction.count = Math.max(0, reaction.users.length);
  }
  return this;
};

// Méthode pour obtenir la réaction d'un utilisateur
PostSchema.methods.getUserReaction = function(userId) {
  for (const [reactionType, reaction] of Object.entries(this.reactions)) {
    if (reaction.users.some(user => user.userId.toString() === userId.toString())) {
      return reactionType;
    }
  }
  return null;
};

// Méthode pour obtenir les réactions formatées pour le frontend
PostSchema.methods.getFormattedReactions = function() {
  const formatted = {};
  
  for (const [reactionType, reaction] of Object.entries(this.reactions)) {
    formatted[reactionType] = {
      count: reaction.count,
      users: reaction.users.map(user => user.userName)
    };
  }
  
  return formatted;
};

module.exports = mongoose.model('Post', PostSchema);