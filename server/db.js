const mongoose = require('mongoose');

// URL de connexion à MongoDB (locale)
const MONGODB_URI = 'mongodb://localhost:27017/digital_display_system';

// Fonction pour connecter à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connecté avec succès!');
  } catch (err) {
    console.error('Erreur de connexion à MongoDB:', err.message);
    // Quitter le processus en cas d'échec
    process.exit(1);
  }
};

module.exports = connectDB;