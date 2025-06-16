// server/models/User.js (version mise à jour)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      // Le mot de passe n'est requis que pour les utilisateurs non-OAuth
      return !this.isOAuthUser;
    }
  },
  // Nouveau champ pour identifier les utilisateurs OAuth
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  // Stockage optionnel des données OAuth
  oAuthProvider: {
    type: String,
    enum: ['microsoft', 'google'],
    default: null
  },
  oAuthId: {
    type: String,
    default: null
  },
  service: {
    type: String,
    enum: ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité', 'general'],
    default: 'general'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'Employé'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Middleware pour hacher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
  // Ne pas hacher si c'est un utilisateur OAuth ou si le mot de passe n'a pas été modifié
  if (this.isOAuthUser || !this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(plainPassword) {
  // Les utilisateurs OAuth ne peuvent pas se connecter avec un mot de passe
  if (this.isOAuthUser) {
    return false;
  }
  return await bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);