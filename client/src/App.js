import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/layout/Header';
import api from './services/api';
import AdminPanel from './components/admin/AdminPanel';
import Post from './components/posts/Post'; // Chemin d'importation corrigé


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
    service: '', // Ajout du service à l'état du formulaire
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
  // Ajout d'un état pour les posts filtrés
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Utilisateur par défaut pour les tests - utilisé uniquement si aucun utilisateur n'est connecté
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
          // Charger les données de l'utilisateur
          const res = await api.get('/auth/user');
          setCurrentUser(res.data);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'utilisateur:", err);
        localStorage.removeItem('token');
      }
      
      try {
        // Charger les posts, qu'on soit connecté ou non
        const res = await api.get('/posts');
        console.log("Posts chargés:", res.data);
        setPosts(res.data);
        setFilteredPosts(res.data); // Initialiser les posts filtrés avec tous les posts
      } catch (err) {
        console.error("Erreur lors du chargement des posts:", err);
      }
      
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  // Effet pour filtrer les posts lorsque la recherche ou l'onglet change
  useEffect(() => {
    // Filtrer les posts en fonction de la recherche et de l'onglet actif
    let filtered = posts;
    
    // Filtre par recherche
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(post => 
        // Vérifier dans le contenu du post
        (post.content && post.content.toLowerCase().includes(query)) ||
        // Vérifier dans les informations de l'auteur
        (post.author && post.author.firstName && post.author.firstName.toLowerCase().includes(query)) ||
        (post.author && post.author.lastName && post.author.lastName.toLowerCase().includes(query)) ||
        (post.author && post.author.role && post.author.role.toLowerCase().includes(query))
      );
    }
    
    // Filtre par onglet (service/catégorie)
    if (activeTab !== 'general') {
      // Filtrer par catégorie
      filtered = filtered.filter(post => post.category === activeTab);
    }
    
    setFilteredPosts(filtered);
  }, [searchQuery, activeTab, posts]);

  // Ajouter cette fonction pour gérer la suppression de la recherche
  const clearSearch = () => {
    setSearchQuery('');
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
    
    // Validation basique
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
        service: authForm.service // Ajout du service lors de l'inscription
      });
      
      // Enregistrer le token
      localStorage.setItem('token', res.data.token);
      
      // Mettre à jour l'état
      setCurrentUser(res.data.user);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      
      // Réinitialiser le formulaire
      setAuthForm({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        service: '', // Réinitialiser le service
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
      
      // Enregistrer le token
      localStorage.setItem('token', res.data.token);
      
      // Mettre à jour l'état
      setCurrentUser(res.data.user);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      
      // Réinitialiser le formulaire
      setAuthForm({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        service: '', // Réinitialiser le service
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
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowAdminPanel(false); // Quitter le mode admin en se déconnectant
  };

  // Gestion des fichiers pour la création de post
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Vérifier la taille totale des fichiers (max 10MB par fichier, 50MB au total)
      const totalSize = [...selectedFiles, ...filesArray].reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        alert("La taille totale des fichiers ne doit pas dépasser 50MB");
        return;
      }
      
      // Limiter le nombre de fichiers à 10
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
    
    // Libérer l'URL de l'objet pour éviter les fuites de mémoire
    URL.revokeObjectURL(newUrls[index].url);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setFilePreviewUrls(newUrls);
  };

  // Création d'un nouveau post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedFiles.length === 0) return;
    
    try {
      // Préparer les données pour l'envoi
      const formData = new FormData();
      formData.append('content', newPostContent);
      formData.append('category', postService);
      
      // Ajouter les fichiers s'il y en a
      if (selectedFiles.length > 0) {
        console.log("Fichiers à envoyer:", selectedFiles);
        selectedFiles.forEach(file => {
          // Essayer les deux noms de champs
          formData.append('files', file);
        });
      }
      
      // Log du contenu formData
      console.log("FormData entries:", [...formData.entries()].map(e => {
        if (e[1] instanceof File) {
          return [e[0], { name: e[1].name, type: e[1].type, size: e[1].size }];
        }
        return e;
      }));
      
      // Envoyer la requête avec le header multipart/form-data supprimé (géré par l'interceptor)
      const res = await api.post('/posts', formData);
      console.log("Réponse de création de post:", res.data);
      
      // Si l'utilisateur est admin, le post est automatiquement approuvé
      if (currentUser?.isAdmin) {
        setPosts([res.data, ...posts]);
      } else {
        // Informer l'utilisateur que son post sera modéré
        alert("Votre publication a été soumise et sera visible après modération.");
      }
      
      // Réinitialiser le formulaire
      setNewPostContent('');
      setSelectedFiles([]);
      setFilePreviewUrls([]);
      setPostService('general'); // Réinitialiser le service à sa valeur par défaut
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
        <div className="logo"></div>
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
        {/* Bouton admin visible seulement pour les administrateurs */}
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

  // Formatage de la date pour les posts
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
    // Déboguer la structure du post
    console.log("Préparation du post:", post._id || post.id);
    
    // Tester l'accès aux images
    if (post.images && post.images.length > 0) {
      console.log(`Post ${post._id || post.id} contient ${post.images.length} image(s):`, post.images);
    }

    // Formatter la date pour l'affichage
    const formattedDate = formatDate(post.createdAt);
    
    // Retourner l'objet post formaté pour le composant
    return {
      ...post,
      time: formattedDate
    };
  };

  // Rendu du modal de création de post
  const renderCreatePostModal = () => {
    if (!showCreatePostModal) return null;

    // Utiliser les données de l'utilisateur courant ou l'utilisateur par défaut
    const authorData = currentUser || DEFAULT_USER;
    const isUserAdmin = currentUser?.isAdmin;

    // Formatage de la taille des fichiers
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Récupérer l'icône appropriée pour le type de fichier
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
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
            <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      } else if (
        fileType === 'application/vnd.ms-excel' || 
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
            <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
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
              <div className="avatar-small"></div>
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
                <option value="general">Général</option>
                <option value="rh">RH</option>
                <option value="commerce">Commerce</option>
                <option value="marketing">Marketing</option>
                <option value="informatique">Informatique</option>
                <option value="achat">Achat</option>
                <option value="comptabilité">Compta</option>
                <option value="logistique">Logistique</option>
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
                    Images
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
                      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
                      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
                      <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
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
                      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
                      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
                      <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Excel
                  </span>
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <div className="file-limits-info">
                Max: 10 fichiers, 10MB/fichier, 50MB au total
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

  // Rendu du modal d'authentification (connexion/inscription)
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
                    <option value="comptabilité">Compta</option>
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

  return (
    <div className="app">
      {renderSidebar()}

      <div className="main-content">
        {showAdminPanel ? (
          // Afficher le panel admin si activé
          <AdminPanel />
        ) : (
          // Sinon afficher le contenu normal
          <>
            {/* Utiliser le composant Header à la place de renderHeader() */}
            <Header 
              onTabChange={setActiveTab} 
              onSearch={setSearchQuery}
            />
            
            {/* Ajouter la partie utilisateur/authentification après le Header */}
            <div className="header-user-section">
              {isLoggedIn && currentUser && (
                <div className="user-menu">
                  <span className="user-name">
                    Bienvenue, {currentUser.firstName}
                    {currentUser.isAdmin && (
                      <span className="admin-badge">Admin</span>
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
              {filteredPosts.length > 0 ? (
                // Afficher les posts filtrés au lieu des posts originaux
                filteredPosts.map(post => (
                  <Post key={post._id || post.id} post={preparePostData(post)} />
                ))
              ) : (
                // Afficher un message si aucun résultat
                searchQuery.trim() !== '' && (
                  <div className="no-results-message">
                    Aucun résultat trouvé pour votre recherche.
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {renderCreatePostModal()}
      {renderAuthModal()}
    </div>
  );
}

export default App;