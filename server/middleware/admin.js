const User = require('../models/User');

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur
 */
const admin = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur existe et est un administrateur
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ 
        message: 'Accès refusé, privilèges administrateur requis' 
      });
    }
    
    next();
  } catch (err) {
    console.error('Erreur dans le middleware admin:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = admin;