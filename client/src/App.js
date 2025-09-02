// client/src/App.js - Version corrigée pour éviter les re-renders du modal
import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './styles/index.css';
import Header from './components/layout/Header';
import Avatar from './components/ui/Avatar';
import EmptyState from './components/ui/EmptyState';
import api from './services/api';
import AdminPanel from './components/admin/AdminPanel';
import Post from './components/posts/Post';
import oauthService from './services/oauthService';
import CreatePostModal from './components/modals/CreatePostModal';
import { useStableForm } from './hooks/useStableForm';
import StableInput from './components/ui/StableInput';
import StableSelect from './components/ui/StableSelect';


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
  
  // Données du formulaire d'authentification - ÉTAT STABLE
  const [authForm, setAuthForm] = useState(() => ({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    service: '',
    password: '',
    confirmPassword: ''
  }));

  // États pour l'interface principale
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  // CORRECTION: États du formulaire de création de post - SIMPLIFIÉS et STABLES
  const [postContent, setPostContent] = useState('');
  const [postService, setPostService] = useState('general');
  const [shouldPin, setShouldPin] = useState(false);
  const [pinLocations, setPinLocations] = useState(['general', 'service']);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState([]);
  
  // État pour le mode administrateur
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // État des posts
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Utilisateur par défaut pour les tests - MÉMORISÉ
  const DEFAULT_USER = useMemo(() => ({
    firstName: 'Visiteur',
    lastName: '',
    role: 'Invité'
  }), []);

  // ========== FONCTIONS STABLES AVEC useCallback ==========
  
  const handleAuthFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // CORRECTION: Gestionnaires simplifiés pour le formulaire de post
  const handlePostFormChange = useCallback((field, value) => {
    switch (field) {
      case 'content':
        setPostContent(value);
        break;
      case 'service':
        setPostService(value);
        break;
      case 'shouldPin':
        setShouldPin(value);
        break;
      case 'pinLocations':
        setPinLocations(value);
        break;
      default:
        break;
    }
  }, []);

  const handleTabChange = useCallback((tabId) => {
    console.log(`Onglet sélectionné: ${tabId}`);
    setActiveTab(tabId);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleOpenLoginModal = useCallback((isRegister = false) => {
    setShowLoginModal(true);
    setIsRegistering(isRegister);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setShowLoginModal(false);
    setIsRegistering(false);
    // Réinitialiser le formulaire
    setAuthForm({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      service: '',
      password: '',
      confirmPassword: ''
    });
  }, []);

  const handleOpenCreatePostModal = useCallback(() => {
    if (isLoggedIn) {
      if (currentUser?.service && currentUser.service !== 'general') {
        setPostService(currentUser.service);
      } else {
        setPostService('general');
      }
      setShowCreatePostModal(true);
    } else {
      handleOpenLoginModal(false);
    }
  }, [isLoggedIn, currentUser, handleOpenLoginModal]);

  // CORRECTION PRINCIPALE: Fonction stable pour fermer le modal
  const handleCloseCreatePostModal = useCallback(() => {
    setShowCreatePostModal(false);
    // Réinitialiser le formulaire
    setPostContent('');
    setPostService('general');
    setShouldPin(false);
    setPinLocations(['general', 'service']);
    setSelectedFiles([]);
    setFilePreviewUrls(prev => {
      prev.forEach(file => URL.revokeObjectURL(file.url));
      return [];
    });
  }, []);

  // ========== GESTION DES FICHIERS ==========
  
  const handleFileChange = useCallback((e) => {
    if (!e.target.files) return;
    
    const filesArray = Array.from(e.target.files);
    const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
    const currentImageCount = selectedFiles.filter(file => file.type.startsWith('image/')).length;
    
    if (currentImageCount + imageFiles.length > 4) {
      alert("Vous ne pouvez ajouter que 4 images maximum par publication");
      return;
    }
    
    const totalSize = [...selectedFiles, ...filesArray].reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      alert("La taille totale des fichiers ne doit pas dépasser 50MB");
      return;
    }
    
    if (selectedFiles.length + filesArray.length > 10) {
      alert("Vous ne pouvez pas ajouter plus de 10 fichiers par publication");
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...filesArray]);
    
    const newFileUrls = filesArray.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size
    }));
    
    setFilePreviewUrls(prev => [...prev, ...newFileUrls]);
  }, [selectedFiles]);

  const removeFile = useCallback((index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setFilePreviewUrls(prev => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index].url);
      newUrls.splice(index, 1);
      return newUrls;
    });
  }, []);

  // ========== FONCTIONS D'AUTHENTIFICATION ==========

  const handleOAuthSuccess = useCallback((user) => {
    console.log('🔍 App.js - OAuth Success reçu:', user);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, []);

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    
    if (authForm.password !== authForm.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (!authForm.firstName || !authForm.lastName || !authForm.email || 
        !authForm.password || !authForm.role || !authForm.service) {
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
      handleCloseLoginModal();
      
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      alert(err.response?.data?.message || "Une erreur est survenue lors de l'inscription");
    }
  }, [authForm, handleCloseLoginModal]);

  const handleLogin = useCallback(async (e) => {
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
      handleCloseLoginModal();
      
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      alert(err.response?.data?.message || "Identifiants invalides");
    }
  }, [authForm, handleCloseLoginModal]);

  const handleLogout = useCallback(() => {
    const isOAuth = oauthService.isOAuthUser();
    
    if (isOAuth) {
      oauthService.logout();
    } else {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsLoggedIn(false);
      setShowAdminPanel(false);
    }
  }, []);

  // ========== CRÉATION DE POST ==========

  const handleCreatePost = useCallback(async () => {
    if (!postContent.trim() && selectedFiles.length === 0) return;
    
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      
      let serviceToUse = postService;
      if (serviceToUse === 'general' && currentUser?.service && currentUser.service !== 'general') {
        serviceToUse = currentUser.service;
      }
      
      formData.append('service', serviceToUse);
      
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
      }
      
      const res = await api.post('/posts', formData);
      
      if (currentUser?.isAdmin && shouldPin && pinLocations.length > 0) {
        try {
          await api.put(`/admin/posts/${res.data._id}/pin`, { 
            locations: pinLocations 
          });
        } catch (pinError) {
          console.error("Erreur lors de l'épinglage:", pinError);
        }
      }
      
      if (currentUser?.isAdmin) {
        const newPost = {
          ...res.data,
          isPinned: shouldPin,
          pinnedLocations: shouldPin ? pinLocations : []
        };
        setPosts(prev => [newPost, ...prev]);
      } else {
        alert("Votre publication a été soumise et sera visible après modération.");
      }
      
      // Fermer le modal et réinitialiser
      handleCloseCreatePostModal();
      
    } catch (err) {
      console.error("Erreur lors de la création du post:", err);
      alert("Une erreur est survenue lors de la création du post");
    }
  }, [postContent, selectedFiles, currentUser, postService, shouldPin, pinLocations, handleCloseCreatePostModal]);

  // ========== FONCTIONS UTILITAIRES MÉMORISÉES ==========

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }, []);

  const formatDepartmentName = useCallback((dept) => {
    const names = {
      marketing: 'Marketing',
      rh: 'RH',
      informatique: 'IT',
      commerce: 'Commerce',
      achat: 'Achats',
      comptabilité: 'Compta',
      logistique: 'Logistique',
      general: 'Général'
    };
    return names[dept] || (dept ? dept.charAt(0).toUpperCase() + dept.slice(1) : 'Non défini');
  }, []);

  // ========== EFFECTS ==========

  // Charger l'utilisateur et les posts au démarrage
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const res = await api.get('/auth/user');
            setCurrentUser(res.data);
            setIsLoggedIn(true);
          } catch (authError) {
            if (authError.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setCurrentUser(null);
              setIsLoggedIn(false);
            }
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'utilisateur:", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      try {
        const res = await api.get('/posts');
        setPosts(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des posts:", err);
        setPosts([]);
      }
      
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  // Effet pour filtrer les posts - OPTIMISÉ
  useEffect(() => {
    const loadPostsForTab = async () => {
      let filtered = [];
      
      if (activeTab === 'general') {
        try {
          const res = await api.get('/posts/general-feed');
          filtered = res.data.posts;
          
          filtered.forEach(post => {
            switch (post.feedReason) {
              case 'pinned':
                post.algorithmLabel = 'Épinglé';
                post.algorithmColor = '#ff6b35';
                break;
              case 'top_of_month':
                post.algorithmLabel = 'Post du mois';
                post.algorithmColor = '#ffd700';
                break;
              case 'recent':
                post.algorithmLabel = 'Récent';
                post.algorithmColor = '#4caf50';
                break;
              case 'filler':
                post.algorithmLabel = 'Suggéré';
                post.algorithmColor = '#9e9e9e';
                break;
              default:
                post.algorithmLabel = null;
                post.algorithmColor = null;
            }
          });
          
        } catch (error) {
          console.error("Erreur lors du chargement de l'algorithme général:", error);
          filtered = posts.filter(post => 
            post.isPinned && post.pinnedLocations && post.pinnedLocations.includes('general')
          );
        }
      } else {
        try {
          const res = await api.get(`/posts/service/${activeTab}`);
          filtered = res.data;
        } catch (error) {
          console.error(`Erreur lors du chargement des posts du service "${activeTab}":`, error);
          filtered = posts.filter(post => {
            const postService = post.service || post.category;
            return postService === activeTab;
          });
        }
      }
      
      // Filtre par recherche
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(post => 
          (post.content && post.content.toLowerCase().includes(query)) ||
          (post.author && post.author.toLowerCase().includes(query)) ||
          (post.role && post.role.toLowerCase().includes(query))
        );
      }
      
      setFilteredPosts(filtered);
    };
  
    loadPostsForTab();
  }, [searchQuery, activeTab, posts]);

  // ========== FONCTIONS DE RENDU MÉMORISÉES ==========

  const renderSidebar = useMemo(() => (
    <div className="sidebar">
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
        onClick={handleOpenCreatePostModal}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {/* Autres boutons de la sidebar */}
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
    </div>
  ), [isLoggedIn, currentUser, showAdminPanel, handleOpenCreatePostModal]);

  const preparePostData = useCallback((post) => {
    const formattedDate = formatDate(post.createdAt);
    
    let authorAvatar = null;
    if (currentUser && post.author === `${currentUser.firstName} ${currentUser.lastName}`) {
      authorAvatar = currentUser.avatar;
    } else if (post.authorAvatar) {
      authorAvatar = post.authorAvatar;
    }
    
    return {
      ...post,
      time: formattedDate,
      authorAvatar: authorAvatar
    };
  }, [currentUser, formatDate]);

  // CORRECTION PRINCIPALE: Props stables pour le modal CreatePost
  const createPostModalProps = useMemo(() => ({
    isOpen: showCreatePostModal,
    onClose: handleCloseCreatePostModal, // ← Fonction stable
    currentUser,
    // Objet postForm stable
    postForm: {
      content: postContent,
      service: postService,
      shouldPin: shouldPin,
      pinLocations: pinLocations
    },
    onPostFormChange: handlePostFormChange, // ← Fonction stable
    filePreviewUrls,
    selectedFiles,
    onFileChange: handleFileChange,
    onRemoveFile: removeFile,
    onCreatePost: handleCreatePost,
    formatDepartmentName
  }), [
    showCreatePostModal,
    handleCloseCreatePostModal,
    currentUser,
    postContent,
    postService,
    shouldPin,
    pinLocations,
    handlePostFormChange,
    filePreviewUrls,
    selectedFiles,
    handleFileChange,
    removeFile,
    handleCreatePost,
    formatDepartmentName
  ]);

  const AuthModalComponent = memo(({ 
    isRegistering, 
    onClose, 
    onRegister, 
    onLogin, 
    onOAuthSuccess 
  }) => {
    const { values, handleChange, reset } = useStableForm({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      service: '',
      password: '',
      confirmPassword: ''
    });
  
    const handleSubmitRegister = (e) => {
      e.preventDefault();
      onRegister(values);
    };
  
    const handleSubmitLogin = (e) => {
      e.preventDefault();
      onLogin(values);
    };
  
    return (
      <div className="modal-overlay">
        <div className="modal-content auth-modal">
          <div className="modal-header">
            <h2>{isRegistering ? 'Créer un compte' : 'Connexion'}</h2>
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </div>
          
          <div className="modal-body">
            <Suspense fallback={<div>Chargement...</div>}>
              <OAuthLogin 
                onSuccess={onOAuthSuccess}
                onError={(error) => {
                  console.error('Erreur OAuth:', error);
                  alert('Erreur lors de la connexion OAuth: ' + error);
                }}
              />
            </Suspense>
            
            {isRegistering ? (
              <form onSubmit={handleSubmitRegister}>
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Prénom</label>
                    <StableInput
                      type="text"
                      id="firstName"
                      value={values.firstName}
                      onChange={handleChange('firstName')}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Nom</label>
                    <StableInput
                      type="text"
                      id="lastName"
                      value={values.lastName}
                      onChange={handleChange('lastName')}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <StableInput
                    type="email"
                    id="email"
                    value={values.email}
                    onChange={handleChange('email')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Poste dans l'entreprise</label>
                  <StableInput
                    type="text"
                    id="role"
                    value={values.role}
                    onChange={handleChange('role')}
                    required
                    placeholder="Ex: Développeur, Manager, Consultant..."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="service">Service</label>
                  <StableSelect
                    id="service"
                    value={values.service}
                    onChange={handleChange('service')}
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
                  </StableSelect>
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <StableInput
                    type="password"
                    id="password"
                    value={values.password}
                    onChange={handleChange('password')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <StableInput
                    type="password"
                    id="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    required
                  />
                </div>
                
                <button type="submit" className="auth-submit-button">S'inscrire</button>
              </form>
            ) : (
              <form onSubmit={handleSubmitLogin}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <StableInput
                    type="email"
                    id="email"
                    value={values.email}
                    onChange={handleChange('email')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <StableInput
                    type="password"
                    id="password"
                    value={values.password}
                    onChange={handleChange('password')}
                    required
                  />
                </div>
                
                <button type="submit" className="auth-submit-button">Se connecter</button>
              </form>
            )}
            
            <div className="auth-toggle">
              {isRegistering ? (
                <p>Déjà un compte ? <button type="button" onClick={() => setIsRegistering(false)}>Se connecter</button></p>
              ) : (
                <p>Pas encore de compte ? <button type="button" onClick={() => setIsRegistering(true)}>S'inscrire</button></p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });

  // ========== RENDU PRINCIPAL ==========

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // Composant de callback OAuth pour React Router v5
  const OAuthCallbackComponent = () => {
    console.log('🔍 OAuthCallbackComponent monté');
    
    return (
      <Suspense fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f6f8fa'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #0078d4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h2>Chargement de l'authentification...</h2>
          </div>
        </div>
      }>
        <OAuthCallback onAuthSuccess={handleOAuthSuccess} />
      </Suspense>
    );
  };

  // Composant principal pour React Router v5
  const MainComponent = () => (
    <div className="app">
      {renderSidebar}

      <div className="main-content">
        {showAdminPanel ? (
          <AdminPanel />
        ) : (
          <>
            <Header 
              onTabChange={handleTabChange} 
              onSearch={handleSearch}
            />
            
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
            
            <div className="feed">
              {activeTab === 'general' && filteredPosts.length === 0 ? (
                <EmptyState 
                  type="general"
                  isLoggedIn={isLoggedIn}
                  currentUserService={currentUser?.service}
                  onCreatePost={handleOpenCreatePostModal}
                />
              ) : activeTab === 'general' ? (
                filteredPosts.map(post => (
                  <Post 
                    key={post._id || post.id} 
                    post={preparePostData(post)} 
                    currentUser={currentUser}
                  />
                ))
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <Post 
                    key={post._id || post.id} 
                    post={preparePostData(post)} 
                    currentUser={currentUser}
                  />
                ))
              ) : (
                <EmptyState 
                  type={searchQuery.trim() !== '' ? 'search' : activeTab}
                  searchQuery={searchQuery}
                  isLoggedIn={isLoggedIn}
                  currentUserService={currentUser?.service}
                  onCreatePost={handleOpenCreatePostModal}
                />
              )}
            </div>
          </>
        )}
      </div>

      <CreatePostModal {...createPostModalProps} />
      {renderAuthModal}
    </div>
  );

  return (
    <Router>
      <Switch>
        <Route path="/auth/callback" component={OAuthCallbackComponent} />
        <Route path="/" component={MainComponent} />
      </Switch>
    </Router>
  );
}

export default App;