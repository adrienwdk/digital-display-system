// client/src/services/oauthService.js - Version avec gestion d'erreur
import api from './api';

class OAuthService {
  /**
   * Initie le processus d'authentification OAuth
   */
  async initiateOAuth() {
    try {
      console.log('🔍 Initiation OAuth - Début');
      const response = await api.get('/oauth/auth-url');
      console.log('🔍 URL d\'auth reçue:', response.data.authUrl);
      return response.data.authUrl;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initiation OAuth:', error);
      console.error('❌ Détails de l\'erreur:', error.response?.data);
      throw new Error('Impossible d\'initier l\'authentification OAuth: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Traite le callback OAuth avec le code d'autorisation
   */
  async handleCallback(code, state) {
    try {
      console.log('🔍 Callback OAuth - Code reçu:', code?.substring(0, 20) + '...');
      console.log('🔍 Callback OAuth - State:', state);
      
      const response = await api.post('/oauth/callback', {
        code,
        state
      });
      
      console.log('🔍 Callback OAuth - Réponse reçue:', {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        userEmail: response.data.user?.email
      });
      
      // Stocker le token et les informations utilisateur
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors du callback OAuth:', error);
      console.error('❌ Détails de l\'erreur:', error.response?.data);
      
      // Si c'est une erreur de code déjà utilisé, vérifier si l'utilisateur est déjà connecté
      if (error.response?.data?.error === 'invalid_grant' || 
          error.message.includes('already redeemed')) {
        console.log('🔍 Code déjà utilisé, vérification de l\'état de connexion...');
        
        // Vérifier si on a déjà un token valide
        const existingToken = localStorage.getItem('token');
        if (existingToken) {
          try {
            // Vérifier que le token est valide
            const userResponse = await api.get('/auth/user');
            console.log('✅ Utilisateur déjà connecté, récupération des données');
            return {
              token: existingToken,
              user: userResponse.data
            };
          } catch (tokenError) {
            console.log('Token existant invalide, nettoyage...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
      
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'authentification');
    }
  }

  /**
   * Obtient le profil utilisateur depuis Microsoft Graph
   */
  async getUserProfile(accessToken) {
    try {
      const response = await api.post('/oauth/profile', {
        accessToken
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw new Error('Impossible de récupérer le profil utilisateur');
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté via OAuth
   */
  isOAuthUser() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.isOAuthUser || false;
    }
    return false;
  }

  /**
   * Déconnexion OAuth
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Rediriger vers la déconnexion Microsoft si nécessaire
    if (this.isOAuthUser()) {
      const tenantId = process.env.REACT_APP_AZURE_TENANT_ID;
      const logoutUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;
      window.location.href = logoutUrl;
    }
  }
}

export default new OAuthService();