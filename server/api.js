import axios from 'axios';

// Création d'une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Ajouter un intercepteur pour les requêtes
api.interceptors.request.use(config => {
  // Récupérer le token d'authentification du localStorage
  const token = localStorage.getItem('token');
  
  // Si un token existe, l'ajouter aux en-têtes de la requête
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Ajouter un intercepteur pour les réponses
api.interceptors.response.use(response => {
  return response;
}, error => {
  // Traitement personnalisé des erreurs
  if (error.response) {
    // La requête a été faite et le serveur a répondu avec un code d'état
    // qui n'est pas dans la plage 2xx
    console.error('Erreur de réponse:', error.response.status, error.response.data);
    
    // Gérer la déconnexion si le token est expiré ou invalide
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      // Si nécessaire, rediriger vers la page de connexion ou afficher un message
    }
  } else if (error.request) {
    // La requête a été faite mais aucune réponse n'a été reçue
    console.error('Pas de réponse du serveur:', error.request);
  } else {
    // Une erreur s'est produite lors de la configuration de la requête
    console.error('Erreur de configuration:', error.message);
  }
  
  return Promise.reject(error);
});

export default api;