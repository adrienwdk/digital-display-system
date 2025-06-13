// client/src/services/oauthService.js
import api from './api';

class OAuthService {
  /**
   * Initie le processus d'authentification OAuth
   */
  async initiateOAuth() {
    try {
      const response = await api.get('/oauth/auth-url');
      return response.data.authUrl;
    } catch (error) {
      console.error('Erreur lors de l\'initiation OAuth:', error);
      throw new Error('Impossible d\'initier l\'authentification OAuth');
    }
  }

  /**
   * Traite le callback OAuth avec le code d'autorisation
   */
  async handleCallback(code, state) {
    try {
      const response = await api.post('/oauth/callback', {
        code,
        state
      });
      
      // Stocker le token et les informations utilisateur
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du callback OAuth:', error);
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