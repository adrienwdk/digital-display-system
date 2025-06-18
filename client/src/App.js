// client/src/App.js - Version complète corrigée pour le filtrage par service
import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './styles/index.css';
import Header from './components/layout/Header';
import Avatar from './components/ui/Avatar';
import EmptyState from './components/ui/EmptyState';
import api from './services/api';
import AdminPanel from './components/admin/AdminPanel';
import Post from './components/posts/Post';
import oauthService from './services/oauthService';

// Import dynamique des composants OAuth
const OAuthCallback = React.lazy(() => import('./components/auth/OAuthCallback'));
const OAuthLogin = React.lazy(() => import('./components/auth/OAuthLogin'));

function App() {
  // États d'authentification
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Données du formulaire d'authentification
  const [authForm, setAuthForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    service: '',
    password: '',
    confirmPassword: ''
  });

  // États pour l'interface principale
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState([]);
  const [postService, setPostService] = useState('general');
  
  // État pour le mode administrateur
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // État des posts
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Utilisateur par défaut pour les tests
  const DEFAULT_USER = {
    firstName: 'Visiteur',
    lastName: '',
    role: 'Invité'
  };

  // Charger l'utilisateur et les posts au démarrage
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Vérifier s'il y a un token d'authentification
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Charger les données de l'utilisateur
            const res = await api.get('/auth/user');
            setCurrentUser(res.data);
            setIsLoggedIn(true);
          } catch (authError) {
            // Si le token est expiré, nettoyer le localStorage
            if (authError.response?.status === 401) {
              console.log('Token expiré, déconnexion automatique');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setCurrentUser(null);
              setIsLoggedIn(false);
            } else {
              throw authError;
            }
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'utilisateur:", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      try {
        // Charger les posts
        const res = await api.get('/posts');
        console.log("Posts chargés:", res.data);
        setPosts(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des posts:", err);
        setPosts([]);
      }
      
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  // Effet pour filtrer les posts - LOGIQUE CORRIGÉE
  useEffect(() => {
    let filtered = [];
    
    console.log("=== DÉBUT FILTRAGE ===");
    console.log("Onglet actif:", activeTab);
    console.log("Nombre total de posts:", posts.length);
    console.log("Terme de recherche:", searchQuery);
    
    // Si c'est l'onglet général, ne rien afficher pour le moment
    if (activeTab === 'general') {
      console.log("Onglet général sélectionné - aucun post affiché");
      filtered = []; // Vide pour le moment
    } else {
      // Filtrer par service/catégorie
      console.log("Services disponibles dans les posts:");
      posts.forEach(post => {
        console.log(`- Post ${post._id}: service="${post.service}", category="${post.category}"`);
      });
      
      // Filtrer par service OU category (pour compatibilité)
      filtered = posts.filter(post => {
        const postService = post.service || post.category;
        const matches = postService === activeTab;
        if (matches) {
          console.log(`✅ Post ${post._id} correspond au service "${activeTab}"`);
        }
        return matches;
      });
      
      console.log(`Posts trouvés pour le service "${activeTab}":`, filtered.length);
    }
    
    // Filtre par recherche si une recherche est active
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      console.log("Application du filtre de recherche:", query);
      
      filtered = filtered.filter(post => 
        (post.content && post.content.toLowerCase().includes(query)) ||
        (post.author && post.author.toLowerCase().includes(query)) ||
        (post.role && post.role.toLowerCase().includes(query))
      );
      
      console.log(`Posts après recherche:`, filtered.length);
    }
    
    console.log("=== FIN FILTRAGE ===");
    setFilteredPosts(filtered);
  }, [searchQuery, activeTab, posts]);

  // Fonction de succès OAuth
  const handleOAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    console.log('Utilisateur OAuth connecté:', user);
  };

  // Gestion du formulaire d'authentification
  const handleAuthFormChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction d'inscription
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (authForm.password !== authForm.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (!authForm.firstName || !authForm.lastName || !authForm.email || !authForm.password || !authForm.role || !authForm.service) {
      alert("Tous les champs sont obligatoires");
      return;
    }
    
    try {
      const res = await api.post('/auth/register', {
        firstName: authForm.firstName,
        lastName: authForm.lastName,
        email: authForm.email,
        password: authForm.password,
        role: authForm.role,
        service: authForm.service
      });
      
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      
      setAuthForm({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        service: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      alert(err.response?.data?.message || "Une erreur est survenue lors de l'inscription");
    }
  };

  // Fonction de connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!authForm.email || !authForm.password) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    
    try {
      const res = await api.post('/auth/login', {
        email: authForm.email,
        password: authForm.password
      });
      
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      
      setAuthForm({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        service: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      alert(err.response?.data?.message || "Identifiants invalides");
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    const isOAuth = oauthService.isOAuthUser();
    
    if (isOAuth) {
      oauthService.logout();
    } else {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsLoggedIn(false);
      setShowAdminPanel(false);
    }
  };

  // Gestion des fichiers pour la création de post
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Limiter à 4 images pour les photos
      const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
      // eslint-disable-next-line no-unused-vars
      const otherFiles = filesArray.filter(file => !file.type.startsWith('image/'));
      
      const currentImageCount = selectedFiles.filter(file => file.type.startsWith('image/')).length;
      
      if (currentImageCount + imageFiles.length > 4) {
        alert("Vous ne pouvez ajouter que 4 images maximum par publication");
        return;
      }
      
      // Vérifier la taille totale des fichiers (max 10MB par fichier, 50MB au total)
      const totalSize = [...selectedFiles, ...filesArray].reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        alert("La taille totale des fichiers ne doit pas dépasser 50MB");
        return;
      }
      
      // Limiter le nombre total de fichiers à 10
      if (selectedFiles.length + filesArray.length > 10) {
        alert("Vous ne pouvez pas ajouter plus de 10 fichiers par publication");
        return;
      }
      
      setSelectedFiles([...selectedFiles, ...filesArray]);
      
      // Créer des URLs pour la prévisualisation
      const newFileUrls = filesArray.map(file => {
        return {
          url: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size
        };
      });
      
      setFilePreviewUrls([...filePreviewUrls, ...newFileUrls]);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...filePreviewUrls];
    
    URL.revokeObjectURL(newUrls[index].url);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setFilePreviewUrls(newUrls);
  };

  // Création d'un nouveau post - LOGIQUE CORRIGÉE
  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedFiles.length === 0) return;
    
    try {
      const formData = new FormData();
      formData.append('content', newPostContent);
      
      // CORRECTION: Utiliser le service de l'utilisateur connecté si pas de service spécifique choisi
      let serviceToUse = postService;
      if (serviceToUse === 'general' && currentUser?.service && currentUser.service !== 'general') {
        serviceToUse = currentUser.service;
        console.log(`Service général choisi mais utilisateur a un service spécifique: ${serviceToUse}`);
      }
      
      // Utiliser 'service' au lieu de 'category' pour correspondre au backend
      formData.append('service', serviceToUse);
      
      console.log(`Création du post avec le service: ${serviceToUse}`);
      
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
      }
      
      const res = await api.post('/posts', formData);
      
      // Si l'utilisateur est admin, ajouter directement le post à la liste
      if (currentUser?.isAdmin) {
        console.log("Post créé par un admin, ajout direct à la liste");
        setPosts([res.data, ...posts]);
      } else {
        alert("Votre publication a été soumise et sera visible après modération.");
      }
      
      setNewPostContent('');
      setSelectedFiles([]);
      setFilePreviewUrls([]);
      setPostService('general');
      setShowCreatePostModal(false);
    } catch (err) {
      console.error("Erreur lors de la création du post:", err);
      alert("Une erreur est survenue lors de la création du post");
    }
  };

  // Rendu de la barre latérale
  const renderSidebar = () => {
    return (
      <div className="sidebar">
        {/* Avatar de l'utilisateur connecté ou logo par défaut */}
        {isLoggedIn && currentUser ? (
          <Avatar 
            user={currentUser} 
            size="large"
            className="sidebar-avatar"
          />
        ) : (
          <div className="logo"></div>
        )}
        
        <button 
          className={`sidebar-button ${!showAdminPanel ? 'active' : ''}`}
          onClick={() => setShowAdminPanel(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          className="sidebar-button"
          onClick={() => {
            if (isLoggedIn) {
              // CORRECTION: Définir le service par défaut selon l'utilisateur
              if (currentUser?.service && currentUser.service !== 'general') {
                setPostService(currentUser.service);
              } else {
                setPostService('general');
              }
              setShowCreatePostModal(true);
            } else {
              setShowLoginModal(true);
              setIsRegistering(false);
            }
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="sidebar-button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {currentUser?.isAdmin && (
          <button 
            className={`sidebar-button ${showAdminPanel ? 'active' : ''}`}
            onClick={() => setShowAdminPanel(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <button className="sidebar-button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="6" y1="1" x2="6" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="14" y1="1" x2="14" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="sidebar-button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 10.568L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return "À l'instant";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  // Préparation des données pour le composant Post
  const preparePostData = (post) => {
    const formattedDate = formatDate(post.createdAt);
    
    console.log('Preparing post data:', post);
    
    // Déterminer l'avatar à utiliser
    let authorAvatar = null;
    
    // Si l'utilisateur connecté est l'auteur du post, utiliser son avatar
    if (currentUser && post.author === `${currentUser.firstName} ${currentUser.lastName}`) {
      authorAvatar = currentUser.avatar;
      console.log('Using current user avatar:', authorAvatar);
    }
    
    // Sinon, utiliser l'avatar du post s'il existe
    if (!authorAvatar && post.authorAvatar) {
      authorAvatar = post.authorAvatar;
      console.log('Using post authorAvatar:', authorAvatar);
    }
    
    const preparedPost = {
      ...post,
      time: formattedDate,
      authorAvatar: authorAvatar
    };
    
    console.log('Prepared post data:', preparedPost);
    return preparedPost;
  };

  // Modal de création de post - LOGIQUE CORRIGÉE
  const renderCreatePostModal = () => {
    if (!showCreatePostModal) return null;

    const authorData = currentUser || DEFAULT_USER;
    const isUserAdmin = currentUser?.isAdmin;

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType) => {
      if (fileType.startsWith('image/')) {
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
            <path d="M21 15l-5-5-5 5" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      } else if (fileType === 'application/pdf') {
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      } else {
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Créer un post</h2>
            <button 
              className="close-button"
              onClick={() => setShowCreatePostModal(false)}
            >
              &times;
            </button>
          </div>
          
          <div className="modal-body">
            <div className="post-author-info">
              <Avatar 
                user={authorData} 
                size="medium"
                className="mr-3"
              />
              <div>
                <div className="author-name">{`${authorData.firstName} ${authorData.lastName}`}</div>
                <div className="author-role">{authorData.role}</div>
              </div>
            </div>
            
            {!isUserAdmin && (
              <div className="info-message">
                Note : Votre publication sera visible après validation par un administrateur.
              </div>
            )}

            <div className="form-group service-selector">
              <label htmlFor="postService">Service</label>
              <select
                id="postService"
                value={postService}
                onChange={(e) => setPostService(e.target.value)}
                className="service-select"
              >
                {/* CORRECTION: Afficher le service de l'utilisateur en premier */}
                {currentUser?.service && currentUser.service !== 'general' && (
                  <option value={currentUser.service}>
                    {currentUser.service.charAt(0).toUpperCase() + currentUser.service.slice(1)} (Mon service)
                  </option>
                )}
                <option value="general">Général</option>
                {currentUser?.service !== 'rh' && <option value="rh">RH</option>}
                {currentUser?.service !== 'commerce' && <option value="commerce">Commerce</option>}
                {currentUser?.service !== 'marketing' && <option value="marketing">Marketing</option>}
                {currentUser?.service !== 'informatique' && <option value="informatique">Informatique</option>}
                {currentUser?.service !== 'achat' && <option value="achat">Achat</option>}
                {currentUser?.service !== 'comptabilité' && <option value="comptabilité">Comptabilité</option>}
                {currentUser?.service !== 'logistique' && <option value="logistique">Logistique</option>}
              </select>
            </div>
            
            <textarea
              placeholder="Que voulez-vous partager ?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="post-textarea"
            />
            
            {filePreviewUrls.length > 0 && (
              <div className="file-previews">
                <div className="preview-header">
                  <span className="preview-count">
                    {filePreviewUrls.filter(f => f.type.startsWith('image/')).length} / 4 images
                    {filePreviewUrls.filter(f => !f.type.startsWith('image/')).length > 0 && 
                      ` • ${filePreviewUrls.filter(f => !f.type.startsWith('image/')).length} autres fichiers`
                    }
                  </span>
                </div>
                {filePreviewUrls.map((file, index) => (
                  <div className="file-preview" key={index}>
                    {file.type.startsWith('image/') ? (
                      <img src={file.url} alt={`Preview ${index}`} />
                    ) : (
                      <div className="file-icon">
                        {getFileIcon(file.type)}
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    )}
                    <button 
                      className="remove-file"
                      onClick={() => removeFile(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="file-upload-options">
              <div className="upload-option">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    multiple
                    className="file-input"
                  />
                  <span className="file-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
                      <path d="M21 15l-5-5-5 5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Images (max 4)
                  </span>
                </label>
              </div>
              
              <div className="upload-option">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    multiple
                    className="file-input"
                  />
                  <span className="file-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
                      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    PDF
                  </span>
                </label>
              </div>
              
              <div className="upload-option">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    multiple
                    className="file-input"
                  />
                  <span className="file-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
                      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Excel
                  </span>
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <div className="file-limits-info">
                Max: 4 images, 10 fichiers total, 10MB/fichier, 50MB au total
              </div>
              <button
                className="publish-button"
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() && selectedFiles.length === 0}
              >
                Publier
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal d'authentification avec OAuth
  const renderAuthModal = () => {
    if (!showLoginModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content auth-modal">
          <div className="modal-header">
            <h2>{isRegistering ? 'Créer un compte' : 'Connexion'}</h2>
            <button 
              className="close-button"
              onClick={() => setShowLoginModal(false)}
            >
              &times;
            </button>
          </div>
          
          <div className="modal-body">
            {/* Bouton OAuth Microsoft */}
            <Suspense fallback={<div>Chargement...</div>}>
              <OAuthLogin 
                onSuccess={handleOAuthSuccess}
                onError={(error) => {
                  console.error('Erreur OAuth:', error);
                  alert('Erreur lors de la connexion OAuth: ' + error);
                }}
              />
            </Suspense>
            
            {isRegistering ? (
              // Formulaire d'inscription
              <form onSubmit={handleRegister}>
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Prénom</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={authForm.firstName}
                      onChange={handleAuthFormChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Nom</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={authForm.lastName}
                      onChange={handleAuthFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleAuthFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Poste dans l'entreprise</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={authForm.role}
                    onChange={handleAuthFormChange}
                    required
                    placeholder="Ex: Développeur, Manager, Consultant..."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="service">Service</label>
                  <select
                    id="service"
                    name="service"
                    value={authForm.service}
                    onChange={handleAuthFormChange}
                    className="service-select"
                    required
                  >
                    <option value="">Sélectionnez votre service</option>
                    <option value="general">Général</option>
                    <option value="rh">RH</option>
                    <option value="commerce">Commerce</option>
                    <option value="marketing">Marketing</option>
                    <option value="informatique">Informatique</option>
                    <option value="achat">Achat</option>
                    <option value="comptabilité">Comptabilité</option>
                    <option value="logistique">Logistique</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={authForm.confirmPassword}
                    onChange={handleAuthFormChange}
                    required
                  />
                </div>
                
                <button type="submit" className="auth-submit-button">S'inscrire</button>
              </form>
            ) : (
              // Formulaire de connexion
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleAuthFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthFormChange}
                    required
                  />
                </div>
                
                <button type="submit" className="auth-submit-button">Se connecter</button>
              </form>
            )}
            
            <div className="auth-toggle">
              {isRegistering ? (
                <p>Déjà un compte ? <button onClick={() => setIsRegistering(false)}>Se connecter</button></p>
              ) : (
                <p>Pas encore de compte ? <button onClick={() => setIsRegistering(true)}>S'inscrire</button></p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  const handleOpenLoginModal = (isRegister) => {
    setShowLoginModal(true);
    setIsRegistering(isRegister);
  };

  // Composant de callback OAuth pour React Router v5
  const OAuthCallbackComponent = () => (
    <Suspense fallback={<div>Chargement de l'authentification...</div>}>
      <OAuthCallback onAuthSuccess={handleOAuthSuccess} />
    </Suspense>
  );

  // Composant principal pour React Router v5
  const MainComponent = () => (
    <div className="app">
      {renderSidebar()}

      <div className="main-content">
        {showAdminPanel ? (
          // Afficher le panel admin si activé
          <AdminPanel />
        ) : (
          // Sinon afficher le contenu normal
          <>
            {/* Utiliser le composant Header */}
            <Header 
              onTabChange={setActiveTab} 
              onSearch={setSearchQuery}
            />
            
            {/* Section utilisateur/authentification */}
            <div className="header-user-section">
              {isLoggedIn && currentUser && (
                <div className="user-menu">
                  <span className="user-name">
                    Bienvenue, {currentUser.firstName}
                    {currentUser.isAdmin && (
                      <span className="admin-badge" style={{
                        marginLeft: '8px',
                        padding: '2px 6px',
                        backgroundColor: '#ff5c39',
                        color: 'white',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>Admin</span>
                    )}
                    {currentUser.isOAuthUser && (
                      <span className="oauth-badge" style={{
                        marginLeft: '8px',
                        padding: '2px 6px',
                        backgroundColor: '#0078d4',
                        color: 'white',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>Microsoft</span>
                    )}
                  </span>
                  <button 
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </button>
                </div>
              )}
              
              {!isLoggedIn && (
                <div className="auth-buttons">
                  <button 
                    className="login-button"
                    onClick={() => handleOpenLoginModal(false)}
                  >
                    Connexion
                  </button>
                  <button 
                    className="register-button"
                    onClick={() => handleOpenLoginModal(true)}
                  >
                    Inscription
                  </button>
                </div>
              )}
            </div>
            
            <div className="announcement">
              <span className="announcement-title">Information du 20 mars : </span>
              Aujourd'hui, nous souhaitons un bon anniversaire à Delphine, Xavier et Matthieu !
              <span role="img" aria-label="Confetti">🎉</span>
            </div>
            
            <div className="feed">
              {/* AFFICHAGE CONDITIONNEL AMÉLIORÉ avec EmptyState moderne */}
              {activeTab === 'general' ? (
                // Section Général - État vide moderne
                <EmptyState 
                  type="general"
                  isLoggedIn={isLoggedIn}
                  currentUserService={currentUser?.service}
                  onCreatePost={() => {
                    if (currentUser?.service && currentUser.service !== 'general') {
                      setPostService(currentUser.service);
                    } else {
                      setPostService('general');
                    }
                    setShowCreatePostModal(true);
                  }}
                />
              ) : filteredPosts.length > 0 ? (
                // Afficher les posts filtrés
                filteredPosts.map(post => (
                  <Post 
                    key={post._id || post.id} 
                    post={preparePostData(post)} 
                    currentUser={currentUser}
                  />
                ))
              ) : (
                // Aucun post trouvé pour ce service - État vide moderne
                <EmptyState 
                  type={searchQuery.trim() !== '' ? 'search' : activeTab}
                  searchQuery={searchQuery}
                  isLoggedIn={isLoggedIn}
                  currentUserService={currentUser?.service}
                  onCreatePost={() => {
                    setPostService(activeTab);
                    setShowCreatePostModal(true);
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {renderCreatePostModal()}
      {renderAuthModal()}
    </div>
  );

  return (
    <Router>
      <Switch>
        {/* Route de callback OAuth */}
        <Route path="/auth/callback" component={OAuthCallbackComponent} />
        
        {/* Route principale */}
        <Route path="/" component={MainComponent} />
      </Switch>
    </Router>
  );
}

export default App;