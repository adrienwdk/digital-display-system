// server/routes/oauth.js - Version complète avec JWT_SECRET corrigé
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const azureConfig = require('../config/azureConfig');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_par_défaut';

// Fonction pour mapper les départements Microsoft vers nos services
const mapDepartmentToService = (department) => {
  if (!department) return 'general';
  
  const deptLower = department.toLowerCase();
  
  // Mapping français
  if (deptLower.includes('rh') || deptLower.includes('ressources humaines') || 
      deptLower.includes('human resources') || deptLower.includes('hr')) {
    return 'rh';
  }
  if (deptLower.includes('marketing') || deptLower.includes('communication') || 
      deptLower.includes('comm')) {
    return 'marketing';
  }
  if (deptLower.includes('informatique') || deptLower.includes('it') || 
      deptLower.includes('information technology') || deptLower.includes('tech')) {
    return 'informatique';
  }
  if (deptLower.includes('commercial') || deptLower.includes('vente') || 
      deptLower.includes('sales') || deptLower.includes('commerce')) {
    return 'commerce';
  }
  if (deptLower.includes('achat') || deptLower.includes('procurement') || 
      deptLower.includes('purchasing')) {
    return 'achat';
  }
  if (deptLower.includes('comptabilité') || deptLower.includes('finance') || 
      deptLower.includes('accounting') || deptLower.includes('compta')) {
    return 'comptabilité';
  }
  if (deptLower.includes('logistique') || deptLower.includes('supply chain') || 
      deptLower.includes('logistics')) {
    return 'logistique';
  }
  
  return 'general'; // Service par défaut
};

// Route de test pour vérifier la configuration
router.get('/test-config', (req, res) => {
  const config = {
    hasClientId: !!process.env.AZURE_CLIENT_ID,
    hasClientSecret: !!process.env.AZURE_CLIENT_SECRET,
    hasTenantId: !!process.env.AZURE_TENANT_ID,
    redirectUri: azureConfig.redirectUri,
    authority: azureConfig.authority,
    clientIdLength: process.env.AZURE_CLIENT_ID?.length || 0,
    tenantIdLength: process.env.AZURE_TENANT_ID?.length || 0
  };
  
  res.json({
    message: 'Configuration OAuth',
    config: config,
    note: 'Vérifiez que toutes les valeurs sont présentes'
  });
});

// Route pour obtenir l'URL d'autorisation (sans MSAL)
router.get('/auth-url', async (req, res) => {
  try {
    console.log('🔍 Génération URL d\'autorisation manuelle...');
    console.log('🔍 Redirect URI utilisé:', azureConfig.redirectUri);
    console.log('🔍 Scopes demandés:', azureConfig.scopes);
    
    // Construire l'URL d'autorisation manuellement
    const baseUrl = `https://login.microsoftonline.com/${azureConfig.tenantId}/oauth2/v2.0/authorize`;
    const params = new URLSearchParams({
      client_id: azureConfig.clientId,
      response_type: 'code',
      redirect_uri: azureConfig.redirectUri,
      scope: azureConfig.scopes.join(' '),
      response_mode: 'query',
      state: Math.random().toString(36).substring(2, 15) // État aléatoire pour la sécurité
    });
    
    const authUrl = `${baseUrl}?${params.toString()}`;
    console.log('🔍 URL générée manuellement:', authUrl);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'URL d\'auth:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération de l\'URL d\'authentification',
      error: error.message
    });
  }
});

// Route de callback pour traiter le code d'autorisation (sans MSAL)
router.post('/callback', async (req, res) => {
  try {
    console.log('🔍 Callback OAuth reçu (implémentation manuelle)...');
    const { code, state } = req.body;
    console.log('🔍 Code:', code ? 'Présent' : 'Absent');
    console.log('🔍 State:', state);

    if (!code) {
      console.error('❌ Code d\'autorisation manquant');
      return res.status(400).json({ message: 'Code d\'autorisation manquant' });
    }

    // Échanger le code contre un token avec une requête HTTP manuelle
    console.log('🔍 Échange du code contre un token (requête manuelle)...');
    
    const tokenEndpoint = `https://login.microsoftonline.com/${azureConfig.tenantId}/oauth2/v2.0/token`;
    
    const tokenRequestBody = new URLSearchParams({
      client_id: azureConfig.clientId,
      client_secret: azureConfig.clientSecret,
      code: code,
      redirect_uri: azureConfig.redirectUri,
      grant_type: 'authorization_code',
      scope: azureConfig.scopes.join(' ')
    });

    console.log('🔍 Endpoint de token:', tokenEndpoint);
    console.log('🔍 Paramètres de la requête:', {
      client_id: azureConfig.clientId,
      has_client_secret: !!azureConfig.clientSecret,
      redirect_uri: azureConfig.redirectUri,
      grant_type: 'authorization_code',
      scope: azureConfig.scopes.join(' ')
    });

    // Faire la requête avec axios (désactiver SSL pour le développement)
    const tokenResponse = await axios.post(tokenEndpoint, tokenRequestBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 10000, // Timeout de 10 secondes
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false // SEULEMENT pour le développement !
      })
    });

    console.log('🔍 Token obtenu avec succès:', {
      status: tokenResponse.status,
      hasAccessToken: !!tokenResponse.data.access_token,
      hasIdToken: !!tokenResponse.data.id_token
    });

    const { access_token, id_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error('Token d\'accès non reçu');
    }

    // Décoder le ID token pour obtenir les informations utilisateur
    console.log('🔍 Décodage du ID token...');
    const idTokenPayload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
    
    console.log('🔍 Informations utilisateur du ID token:', {
      email: idTokenPayload.email || idTokenPayload.preferred_username,
      name: idTokenPayload.name,
      given_name: idTokenPayload.given_name,
      family_name: idTokenPayload.family_name
    });

    const userEmail = idTokenPayload.email || idTokenPayload.preferred_username;
    const userName = idTokenPayload.name || '';
    const firstName = idTokenPayload.given_name || userName.split(' ')[0] || '';
    const lastName = idTokenPayload.family_name || userName.split(' ').slice(1).join(' ') || '';

    if (!userEmail) {
      throw new Error('Email utilisateur non trouvé dans le token');
    }

    // Récupérer les informations détaillées depuis Microsoft Graph
    console.log('🔍 Récupération des informations Microsoft Graph...');
    let jobTitle = 'Employé'; // Valeur par défaut
    let department = 'general'; // Valeur par défaut
    let profilePhotoUrl = null; // Photo de profil

    try {
      // Essayer d'abord l'endpoint /me pour les informations de base
      const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        },
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        }),
        timeout: 5000
      });

      console.log('🔍 Données Microsoft Graph reçues:', {
        jobTitle: graphResponse.data.jobTitle,
        department: graphResponse.data.department,
        companyName: graphResponse.data.companyName,
        officeLocation: graphResponse.data.officeLocation
      });

      // Récupérer la photo de profil
      try {
        console.log('🔍 Récupération de la photo de profil...');
        const photoResponse = await axios.get('https://graph.microsoft.com/v1.0/me/photo/$value', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
          responseType: 'arraybuffer', // Important pour les images
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false
          }),
          timeout: 5000
        });

        if (photoResponse.data && photoResponse.data.byteLength > 0) {
          // Convertir l'image en base64
          const base64Image = Buffer.from(photoResponse.data).toString('base64');
          const mimeType = photoResponse.headers['content-type'] || 'image/jpeg';
          profilePhotoUrl = `data:${mimeType};base64,${base64Image}`;
          console.log('✅ Photo de profil récupérée avec succès');
        }
      } catch (photoError) {
        console.warn('⚠️ Impossible de récupérer la photo de profil:', photoError.message);
        // Continuer sans photo
      }

      // Si pas de département dans /me, essayer avec l'endpoint étendu
      if (!graphResponse.data.department) {
        console.log('🔍 Tentative de récupération étendue des informations...');
        
        try {
          const extendedResponse = await axios.get('https://graph.microsoft.com/v1.0/me?$select=department,jobTitle,companyName,officeLocation,employeeId,mail', {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Accept': 'application/json'
            },
            httpsAgent: new (require('https').Agent)({
              rejectUnauthorized: false
            }),
            timeout: 5000
          });

          console.log('🔍 Données étendues Microsoft Graph:', extendedResponse.data);
          
          if (extendedResponse.data.department) {
            graphResponse.data.department = extendedResponse.data.department;
          }
        } catch (extError) {
          console.warn('⚠️ Impossible de récupérer les informations étendues:', extError.message);
        }
      }

      // Utiliser les vraies informations de poste et département
      if (graphResponse.data.jobTitle) {
        jobTitle = graphResponse.data.jobTitle;
      }
      
      if (graphResponse.data.department) {
        // Mapper le département Microsoft vers nos services
        department = mapDepartmentToService(graphResponse.data.department);
      } else if (graphResponse.data.officeLocation) {
        // Si pas de département, essayer d'utiliser l'officeLocation
        console.log('🔍 Utilisation de officeLocation comme fallback:', graphResponse.data.officeLocation);
        department = mapDepartmentToService(graphResponse.data.officeLocation);
      }

    } catch (graphError) {
      console.warn('⚠️ Impossible de récupérer les informations Graph, utilisation des valeurs par défaut:', graphError.message);
      // On continue avec les valeurs par défaut
    }

    // Vérifier si l'utilisateur existe déjà
    console.log('🔍 Recherche utilisateur existant...');
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log('🔍 Création nouvel utilisateur OAuth...');
      try {
        user = new User({
          firstName: firstName,
          lastName: lastName,
          email: userEmail,
          role: jobTitle, // Utilise le vrai poste depuis Microsoft Graph
          service: department, // Utilise le vrai service depuis Microsoft Graph
          avatar: profilePhotoUrl, // Photo de profil Microsoft
          isOAuthUser: true
        });

        await user.save();
        console.log('✅ Nouvel utilisateur OAuth créé:', user.email);
      } catch (error) {
        if (error.code === 11000) {
          // L'utilisateur a été créé entre-temps par une autre requête
          console.log('🔍 Utilisateur créé simultanément, récupération...');
          user = await User.findOne({ email: userEmail });
        } else {
          throw error;
        }
      }
    } else {
      // Mettre à jour la dernière connexion et les informations depuis Microsoft Graph
      user.lastLogin = new Date();
      user.isOAuthUser = true;
      
      // Mettre à jour le poste et le service si disponibles depuis Microsoft Graph
      if (jobTitle && jobTitle !== 'Employé') {
        user.role = jobTitle;
      }
      if (department && department !== 'general') {
        user.service = department;
      }
      // Mettre à jour la photo de profil si disponible
      if (profilePhotoUrl) {
        user.avatar = profilePhotoUrl;
      }
      
      await user.save();
      console.log('✅ Utilisateur OAuth existant connecté et mis à jour:', user.email);
      console.log('✅ Poste:', user.role);
      console.log('✅ Service:', user.service);
      console.log('✅ Photo de profil:', profilePhotoUrl ? 'Mise à jour' : 'Non disponible');
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
    console.log('✅ Token JWT généré');

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        service: user.service,
        avatar: user.avatar, // Inclure l'avatar dans la réponse
        isAdmin: user.isAdmin,
        isOAuthUser: user.isOAuthUser
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du callback OAuth:', error);
    console.error('❌ Message:', error.message);
    
    // Détails spécifiques aux erreurs axios
    if (error.response) {
      console.error('❌ Statut HTTP:', error.response.status);
      console.error('❌ Données de réponse:', error.response.data);
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de l\'authentification OAuth',
      error: error.message,
      details: error.response?.data || 'Aucun détail disponible'
    });
  }
});

// Route de test de connectivité réseau
router.get('/test-network', async (req, res) => {
  try {
    const tokenEndpoint = `https://login.microsoftonline.com/${azureConfig.tenantId}/oauth2/v2.0/token`;
    
    console.log('🔍 Test de connectivité vers:', tokenEndpoint);
    
    // Test simple de connectivité avec axios
    const testResponse = await axios.post(tokenEndpoint, 'grant_type=client_credentials', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 5000,
      validateStatus: () => true // Accepter tous les codes de statut pour le test
    });
    
    console.log('🔍 Réponse du test:', testResponse.status);
    
    res.json({
      message: 'Test de connectivité réseau',
      tokenEndpoint: tokenEndpoint,
      httpStatus: testResponse.status,
      reachable: testResponse.status !== undefined,
      canConnect: testResponse.status < 500
    });
    
  } catch (error) {
    console.error('❌ Erreur de connectivité:', error.message);
    res.status(500).json({
      message: 'Erreur de connectivité réseau',
      error: error.message,
      suggestion: 'Vérifiez votre connexion internet et les paramètres de proxy'
    });
  }
});

module.exports = router;