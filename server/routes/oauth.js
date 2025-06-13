// server/routes/oauth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const azureConfig = require('../config/azureConfig');
const { ConfidentialClientApplication } = require('@azure/msal-node');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_par_défaut';

// Configuration MSAL
const msalConfig = {
  auth: {
    clientId: azureConfig.clientId,
    clientSecret: azureConfig.clientSecret,
    authority: azureConfig.authority
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

// Route pour obtenir l'URL d'autorisation
router.get('/auth-url', async (req, res) => {
  try {
    const authCodeUrlParameters = {
      scopes: azureConfig.scopes,
      redirectUri: azureConfig.redirectUri,
    };

    const response = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.json({ authUrl: response });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'auth:', error);
    res.status(500).json({ message: 'Erreur lors de la génération de l\'URL d\'authentification' });
  }
});

// Route de callback pour traiter le code d'autorisation
router.post('/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code d\'autorisation manquant' });
    }

    const tokenRequest = {
      code: code,
      scopes: azureConfig.scopes,
      redirectUri: azureConfig.redirectUri,
    };

    // Échanger le code contre un token
    const response = await cca.acquireTokenByCode(tokenRequest);
    
    // Extraire les informations utilisateur du token
    const userInfo = response.account;
    
    if (!userInfo) {
      return res.status(400).json({ message: 'Informations utilisateur non disponibles' });
    }

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: userInfo.username });

    if (!user) {
      // Créer un nouvel utilisateur
      const nameParts = userInfo.name ? userInfo.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      user = new User({
        firstName: firstName,
        lastName: lastName,
        email: userInfo.username,
        password: 'oauth_user', // Mot de passe fictif pour les utilisateurs OAuth
        role: 'Employé', // Rôle par défaut
        service: 'general', // Service par défaut
        isOAuthUser: true // Nouveau champ à ajouter au modèle
      });

      await user.save();
      console.log('Nouvel utilisateur OAuth créé:', user.email);
    } else {
      // Mettre à jour la dernière connexion
      user.lastLogin = new Date();
      await user.save();
      console.log('Utilisateur OAuth existant connecté:', user.email);
    }

    // Créer le payload JWT
    const payload = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        service: user.service,
        isAdmin: user.isAdmin
      }
    };

    // Générer le token JWT
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        service: user.service,
        isAdmin: user.isAdmin,
        isOAuthUser: user.isOAuthUser
      }
    });

  } catch (error) {
    console.error('Erreur lors du callback OAuth:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'authentification OAuth',
      error: error.message 
    });
  }
});

// Route pour obtenir les informations du profil utilisateur depuis Microsoft Graph
router.get('/profile', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Token d\'accès manquant' });
    }

    // Appel à Microsoft Graph pour obtenir le profil
    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!graphResponse.ok) {
      throw new Error('Erreur lors de l\'appel à Microsoft Graph');
    }

    const profile = await graphResponse.json();
    res.json(profile);

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

module.exports = router;