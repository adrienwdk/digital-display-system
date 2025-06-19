// server/models/Post.js - Version complète avec épinglage
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
  // CORRECTION: Services mis à jour et validation stricte
  service: {
    type: String,
    enum: {
      values: ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité', 'general'],
      message: 'Service invalide. Services autorisés: marketing, commerce, achat, informatique, logistique, rh, comptabilité, general'
    },
    default: 'general',
    required: true
  },
  
  // ========== NOUVEAUX CHAMPS POUR L'ÉPINGLAGE ==========
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedLocations: [{
    type: String,
    enum: ['general', 'service'],
    default: []
  }],
  pinnedAt: {
    type: Date
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedOrder: {
    type: Number,
    default: 0
  },
  // ========== FIN DES CHAMPS D'ÉPINGLAGE ==========
  
  // Historique des modifications
  lastModified: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    at: {
      type: Date
    },
    reason: {
      type: String
    }
  },
  
  // Historique complet des modifications
  modificationHistory: [{
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    changes: {
      content: {
        old: String,
        new: String
      },
      service: {
        old: String,
        new: String
      }
    },
    reason: String
  }],
  // Système de réactions complet
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

// Middleware de validation avant sauvegarde
PostSchema.pre('save', function(next) {
  console.log(`Sauvegarde du post avec service: ${this.service}`);
  
  // Validation supplémentaire du service
  const validServices = ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité', 'general'];
  if (!validServices.includes(this.service)) {
    const error = new Error(`Service invalide: ${this.service}. Services autorisés: ${validServices.join(', ')}`);
    return next(error);
  }
  
  // Initialiser les réactions si elles n'existent pas
  if (!this.reactions) {
    this.reactions = {
      like: { count: 0, users: [] },
      love: { count: 0, users: [] },
      bravo: { count: 0, users: [] },
      interesting: { count: 0, users: [] },
      welcome: { count: 0, users: [] }
    };
  }
  
  next();
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

// ========== NOUVELLES MÉTHODES POUR L'ÉPINGLAGE ==========
// Méthode pour épingler un post
PostSchema.methods.pin = function(userId, locations) {
  this.isPinned = true;
  this.pinnedLocations = locations;
  this.pinnedAt = new Date();
  this.pinnedBy = userId;
  this.pinnedOrder = Date.now(); // Utilise le timestamp pour l'ordre
  return this;
};

// Méthode pour désépingler un post
PostSchema.methods.unpin = function() {
  this.isPinned = false;
  this.pinnedLocations = [];
  this.pinnedAt = null;
  this.pinnedBy = null;
  this.pinnedOrder = 0;
  return this;
};

// Méthode pour vérifier si le post est épinglé dans une location spécifique
PostSchema.methods.isPinnedIn = function(location) {
  return this.isPinned && this.pinnedLocations.includes(location);
};
// ========== FIN DES MÉTHODES D'ÉPINGLAGE ==========

// Méthode statique pour obtenir les services valides
PostSchema.statics.getValidServices = function() {
  return ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité', 'general'];
};

// Méthode statique pour valider un service
PostSchema.statics.isValidService = function(service) {
  return this.getValidServices().includes(service);
};

PostSchema.methods.trackModification = function(userId, changes, reason = 'Modification administrative') {
  // Ajouter à l'historique
  this.modificationHistory.push({
    modifiedBy: userId,
    modifiedAt: new Date(),
    changes: changes,
    reason: reason
  });
  
  // Mettre à jour lastModified
  this.lastModified = {
    by: userId,
    at: new Date(),
    reason: reason
  };
  
  return this;
};

module.exports = mongoose.model('Post', PostSchema);