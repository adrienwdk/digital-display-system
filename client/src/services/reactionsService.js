// client/src/services/reactionsService.js
import api from './api';

class ReactionsService {
  /**
   * Ajouter ou modifier une réaction sur un post
   */
  async addReaction(postId, reactionType) {
    try {
      const response = await api.post(`/posts/${postId}/react`, {
        reactionType
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error);
      throw error;
    }
  }

  /**
   * Retirer une réaction d'un post
   */
  async removeReaction(postId) {
    try {
      const response = await api.delete(`/posts/${postId}/react`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la réaction:', error);
      throw error;
    }
  }

  /**
   * Obtenir toutes les réactions d'un post
   */
  async getPostReactions(postId) {
    try {
      const response = await api.get(`/posts/${postId}/reactions`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des réactions:', error);
      throw error;
    }
  }

  /**
   * Obtenir la réaction de l'utilisateur connecté sur un post
   */
  async getUserReaction(postId) {
    try {
      const response = await api.get(`/posts/${postId}/user-reaction`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la réaction utilisateur:', error);
      throw error;
    }
  }

  /**
   * Basculer une réaction (ajouter si pas présente, retirer si présente)
   */
  async toggleReaction(postId, reactionType, currentUserReaction) {
    try {
      if (currentUserReaction === reactionType) {
        // Si l'utilisateur a déjà cette réaction, la retirer
        return await this.removeReaction(postId);
      } else {
        // Sinon, ajouter/changer la réaction
        return await this.addReaction(postId, reactionType);
      }
    } catch (error) {
      console.error('Erreur lors du basculement de la réaction:', error);
      throw error;
    }
  }
}

export default new ReactionsService();