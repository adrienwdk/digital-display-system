const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assurez-vous que ce chemin est correct
const auth = require('../middleware/auth');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_par_défaut'; // Utilisez la même clé que dans le middleware
const JWT_EXPIRATION = '24h';

// Route POST /api/auth/register
// Inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    const { firstName, lastName, email, password, role, service } = req.body;

    // Validation des entrées
    if (!firstName || !lastName || !email || !password || !role || !service) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer un nouvel utilisateur
    user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      service
    });

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Sauvegarder l'utilisateur dans la base de données
    await user.save();
    console.log('Utilisateur créé:', user);

    // Créer le payload pour le JWT
    const payload = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        service: user.service
      }
    };

    // Générer le token JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION },
      (err, token) => {
        if (err) throw err;
        console.log('Token généré:', token);
        res.status(201).json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            service: user.service
          }
        });
      }
    );
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route POST /api/auth/login
// Connexion d'un utilisateur
router.post('/login', async (req, res) => {
  try {
    console.log('Tentative de connexion:', req.body);
    const { email, password } = req.body;

    // Validation des entrées
    if (!email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Créer le payload pour le JWT
    const payload = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        service: user.service
      }
    };

    // Générer le token JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION },
      (err, token) => {
        if (err) throw err;
        console.log('Token généré lors de la connexion:', token);
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            service: user.service
          }
        });
      }
    );
  } catch (err) {
    console.error('Erreur lors de la connexion:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route GET /api/auth/user
// Récupérer les informations de l'utilisateur courant
router.get('/user', auth, async (req, res) => {
  try {
    console.log('Requête utilisateur reçue, ID:', req.user.id);
    
    // Récupérer l'utilisateur sans le mot de passe
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    console.log('Utilisateur trouvé:', user);
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;