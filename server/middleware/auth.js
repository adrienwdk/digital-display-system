const jwt = require('jsonwebtoken');

// Assurez-vous d'avoir une variable d'environnement pour votre clé secrète JWT
// ou définissez-la directement ici (moins sécurisé pour la production)
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_par_défaut';

/**
 * Middleware d'authentification
 * Vérifie si le token JWT est valide
 */
const auth = (req, res, next) => {
  // Récupérer le token du header Authorization ou x-auth-token
  const tokenFromAuthHeader = req.header('Authorization')?.startsWith('Bearer ') 
    ? req.header('Authorization').substring(7) 
    : null;
  const tokenFromXAuthHeader = req.header('x-auth-token');
  
  // Utiliser le premier token disponible
  const token = tokenFromAuthHeader || tokenFromXAuthHeader;
  
  // Si aucun token n'est fourni
  if (!token) {
    console.log('Aucun token fourni');
    return res.status(401).json({ message: 'Accès refusé, token manquant' });
  }
  
  try {
    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Log pour le débogage
    console.log('Token décodé:', decoded);
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Erreur de validation du token:', err.message);
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = auth;