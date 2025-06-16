// server/services/emailService.js

// Service d'emails basique (sera amélioré avec nodemailer)
const emailService = {
  /**
   * Simulation d'envoi de notifications pour un nouveau post
   * @param {Object} post - Le post approuvé
   * @param {Array} users - Liste des utilisateurs à notifier
   */
  sendNewPostNotifications: async (post, users) => {
    console.log(`[Simulation] Envoi de notifications à ${users.length} utilisateurs pour le post ${post._id}`);
    // Cette fonction sera implémentée avec nodemailer plus tard
    return true;
  }
};

module.exports = emailService;