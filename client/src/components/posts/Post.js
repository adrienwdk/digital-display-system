// client/src/components/posts/Post.js
import React, { useState, useEffect } from 'react';
import ImageGallery from './ImageGallery';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import reactionsService from '../../services/reactionsService';
import { useReactionAnimations, addAnimationStyles, ReactionSounds } from '../../utils/reactionAnimations';

const Post = ({ post, currentUser }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [pickerTimeout, setPickerTimeout] = useState(null);
  
  // États pour les réactions
  const [reactions, setReactions] = useState(post.reactions || {
    like: { count: 0, users: [] },
    love: { count: 0, users: [] },
    bravo: { count: 0, users: [] },
    interesting: { count: 0, users: [] },
    welcome: { count: 0, users: [] }
  });
  
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hook pour les animations
  const { animateReaction, animateError } = useReactionAnimations();

  // Configuration des types de réactions
  const reactionTypes = {
    like: { emoji: '👍', label: 'J\'aime', color: '#1877f2' },
    love: { emoji: '❤️', label: 'J\'adore', color: '#e74c3c' },
    bravo: { emoji: '👏', label: 'Bravo', color: '#f39c12' },
    interesting: { emoji: '🤔', label: 'Intéressant', color: '#9b59b6' },
    welcome: { emoji: '👋', label: 'Bienvenue', color: '#2ecc71' }
  };

  // Initialiser les styles d'animation au montage
  useEffect(() => {
    addAnimationStyles();
    ReactionSounds.init();
  }, []);

  // Charger la réaction de l'utilisateur au montage du composant
  useEffect(() => {
    const loadUserReaction = async () => {
      if (currentUser && post._id) {
        try {
          const response = await reactionsService.getUserReaction(post._id);
          setUserReaction(response.userReaction);
          if (response.reactions) {
            setReactions(response.reactions);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la réaction utilisateur:', error);
          if (post.reactions) {
            setReactions(post.reactions);
          }
        }
      } else if (post.reactions) {
        setReactions(post.reactions);
      }
    };

    loadUserReaction();
  }, [currentUser, post._id, post.reactions]);

  // Gestion des réactions avec API et animations
  const handleReaction = async (reactionType, event) => {
    if (!currentUser) {
      alert('Vous devez être connecté pour réagir');
      return;
    }

    if (loading) return;

    setLoading(true);
    setShowReactionPicker(false);

    // Nettoyer le timeout du picker
    if (pickerTimeout) {
      clearTimeout(pickerTimeout);
      setPickerTimeout(null);
    }

    try {
      const response = await reactionsService.toggleReaction(post._id, reactionType, userReaction);
      
      // Mettre à jour l'état local
      setReactions(response.reactions);
      setUserReaction(response.userReaction);
      
      // Animations seulement si la réaction a été ajoutée (pas retirée)
      if (response.userReaction === reactionType) {
        const buttonElement = event?.target.closest('.reaction-button') || 
                             document.querySelector(`[data-post-id="${post._id}"] .reaction-button`);
        
        if (buttonElement) {
          animateReaction(
            buttonElement, 
            reactionType, 
            reactionTypes[reactionType].emoji, 
            reactionTypes[reactionType].color
          );
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la réaction:', error);
      
      // Animation d'erreur
      const buttonElement = event?.target.closest('.reaction-button') || 
                           document.querySelector(`[data-post-id="${post._id}"] .reaction-button`);
      if (buttonElement) {
        animateError(buttonElement);
      }
      
      alert('Erreur lors de l\'ajout de la réaction. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Gestion intelligente du picker avec délais
  const handleMouseEnterButton = () => {
    if (!loading && !showReactionPicker) {
      const timeout = setTimeout(() => {
        setShowReactionPicker(true);
      }, 600); // Délai plus long pour éviter l'ouverture accidentelle
      setPickerTimeout(timeout);
    }
  };

  const handleMouseLeaveButton = () => {
    if (pickerTimeout) {
      clearTimeout(pickerTimeout);
      setPickerTimeout(null);
    }
    
    // Fermer après un délai si pas d'interaction avec le picker
    setTimeout(() => {
      const picker = document.querySelector('.reaction-picker:hover');
      const button = document.querySelector('.reaction-button:hover');
      if (!picker && !button) {
        setShowReactionPicker(false);
      }
    }, 300);
  };

  // Fonction pour s'assurer que les chemins d'images sont corrects
  const getImagePath = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const imgPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${imgPath}`;
  };

  // Obtenir la classe CSS pour l'indicateur de département
  const getDepartmentBadgeClass = (dept) => {
    switch(dept) {
      case 'marketing':
        return '#28a745';
      case 'rh':
        return '#17a2b8';
      case 'informatique':
        return '#007bff';
      case 'commerce':
        return '#fd7e14';
      case 'achat':
        return '#6f42c1';
      case 'comptabilité':
        return '#ffc107';
      case 'logistique':
        return '#20c997';
      case 'general':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  // Formater le nom du département pour l'affichage
  const formatDepartmentName = (dept) => {
    switch(dept) {
      case 'marketing':
        return 'Marketing';
      case 'rh':
        return 'RH';
      case 'informatique':
        return 'Informatique';
      case 'commerce':
        return 'Commerce';
      case 'achat':
        return 'Achat';
      case 'comptabilité':
        return 'Compta';
      case 'logistique':
        return 'Logistique';
      case 'general':
        return 'Général';
      default:
        return dept ? dept.charAt(0).toUpperCase() + dept.slice(1) : 'Non défini';
    }
  };

  // Calculer le nombre total de réactions
  const getTotalReactions = () => {
    return Object.values(reactions).reduce((total, reaction) => total + reaction.count, 0);
  };

  // Obtenir les réactions principales à afficher
  const getTopReactions = () => {
    return Object.entries(reactions)
      .filter(([_, reaction]) => reaction.count > 0)
      .sort(([_, a], [__, b]) => b.count - a.count)
      .slice(0, 3);
  };

  // Obtenir le texte de tooltip pour le résumé des réactions
  const getReactionsSummaryTooltip = () => {
    const topReactions = getTopReactions();
    if (topReactions.length === 0) return '';
    
    const parts = topReactions.map(([type, reaction]) => 
      `${reaction.count} ${reactionTypes[type].label}`
    );
    
    return parts.join(' • ');
  };

  // Ouvrir la galerie à une image spécifique
  const openGallery = (index) => {
    setSelectedImageIndex(index);
    setShowGallery(true);
  };

  // Fermer la galerie
  const closeGallery = () => {
    setShowGallery(false);
  };

  // Déterminer le layout des images selon le nombre
  const getImageLayout = (imageCount) => {
    switch (imageCount) {
      case 1:
        return 'single';
      case 2:
        return 'double';
      case 3:
        return 'triple';
      case 4:
        return 'quad';
      default:
        return 'quad';
    }
  };

  // Rendu des images avec layout adaptatif
  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null;

    const images = post.images.slice(0, 4);
    const layout = getImageLayout(images.length);

    return (
      <div className={`post-images-grid ${layout}`}>
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`image-container image-${index + 1}`}
            onClick={() => openGallery(index)}
          >
            <img 
              src={getImagePath(image)} 
              alt={`Contenu du post ${index + 1}`}
              className="post-image"
              onError={(e) => {
                console.error(`Erreur de chargement de l'image: ${image}`, e);
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
              }}
            />
            <div className="image-overlay">
              <div className="zoom-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2"/>
                  <line x1="8" y1="11" x2="14" y2="11" stroke="white" strokeWidth="2"/>
                  <line x1="11" y1="8" x2="11" y2="14" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Préparer les données utilisateur pour l'avatar
  const getAuthorData = () => {
    console.log('Post author data:', post.author);
    console.log('Post authorAvatar:', post.authorAvatar);
    
    if (typeof post.author === 'string') {
      const nameParts = post.author.split(' ');
      const authorData = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        avatar: post.authorAvatar || null
      };
      console.log('Author data created:', authorData);
      return authorData;
    }
    
    if (typeof post.author === 'object') {
      const authorData = {
        firstName: post.author.firstName || '',
        lastName: post.author.lastName || '',
        avatar: post.author.avatar || post.authorAvatar || null
      };
      console.log('Author data from object:', authorData);
      return authorData;
    }

    const fallbackData = {
      firstName: 'Utilisateur',
      lastName: '',
      avatar: null
    };
    console.log('Using fallback data:', fallbackData);
    return fallbackData;
  };

  // Fermer le picker de réactions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReactionPicker && !event.target.closest('.reaction-button-container')) {
        setShowReactionPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (pickerTimeout) {
        clearTimeout(pickerTimeout);
      }
    };
  }, [showReactionPicker, pickerTimeout]);

  console.log("Rendering post with images:", post.images);

  return (
    <>
      <div className="post" data-post-id={post._id}>
        <div className="post-header">
          <Avatar 
            user={getAuthorData()} 
            size="medium"
          />
          
          <div className="post-meta">
            <div className="post-author">
              {typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim()}
            </div>
            <div className="post-role">{post.role}</div>
          </div>
          
          <div className="post-header-right">
            {(post.service || post.department) && (
              <Tooltip 
                content={`Service : ${formatDepartmentName(post.service || post.department)}`}
                position="bottom"
              >
                <div 
                  className="department-badge"
                  style={{ 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: getDepartmentBadgeClass(post.service || post.department),
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '5px'
                  }}
                >
                  {formatDepartmentName(post.service || post.department)}
                </div>
              </Tooltip>
            )}
            <div className="post-time">{post.time}</div>
          </div>
        </div>
        
        <div className="post-content">
          {post.title && (
            <h3 className="post-title">
              {post.title}
            </h3>
          )}
          <div className="post-text">{post.content}</div>
        </div>
        
        {renderImages()}
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Section des réactions */}
        <div className="post-reactions-section">
          {/* Affichage des réactions existantes */}
          {getTotalReactions() > 0 && (
            <Tooltip 
              content={getReactionsSummaryTooltip()}
              position="top"
              delay={300}
            >
              <div 
                className="reactions-summary"
                onClick={() => setShowReactionDetails(!showReactionDetails)}
                title="Voir qui a réagi"
              >
                <div className="reactions-summary-left">
                  <div className="reaction-emojis">
                    {getTopReactions().map(([type, reaction], index) => (
                      <div 
                        key={type} 
                        className="reaction-emoji-container"
                        style={{ 
                          zIndex: getTopReactions().length - index,
                          backgroundColor: `${reactionTypes[type].color}15`,
                          borderColor: `${reactionTypes[type].color}30`
                        }}
                        title={`${reaction.count} ${reactionTypes[type].label}`}
                      >
                        <span className="reaction-emoji">
                          {reactionTypes[type].emoji}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="reactions-count">
                    {getTotalReactions()}
                  </span>
                </div>
              </div>
            </Tooltip>
          )}
          
          {/* Boutons d'action */}
          <div className="post-actions">
            <div className="reaction-button-container">
              <Tooltip
                content={userReaction ? `Vous avez réagi : ${reactionTypes[userReaction].label}` : 'Réagir à cette publication'}
                position="top"
                delay={500}
              >
                <button 
                  className={`reaction-button ${userReaction ? 'has-reaction' : ''} ${loading ? 'loading' : ''}`}
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  onMouseEnter={handleMouseEnterButton}
                  onMouseLeave={handleMouseLeaveButton}
                  style={userReaction ? { color: reactionTypes[userReaction].color } : {}}
                  disabled={loading}
                >
                  <span className="reaction-icon">
                    {loading ? '⏳' : userReaction ? reactionTypes[userReaction].emoji : '👍'}
                  </span>
                  <span className="reaction-text">
                    {loading ? 'Chargement...' : userReaction ? reactionTypes[userReaction].label : 'J\'aime'}
                  </span>
                </button>
              </Tooltip>
              
              {/* Picker de réactions avec tooltips */}
              {showReactionPicker && !loading && (
                <div 
                  className="reaction-picker"
                  onMouseEnter={() => {
                    if (pickerTimeout) {
                      clearTimeout(pickerTimeout);
                      setPickerTimeout(null);
                    }
                    setShowReactionPicker(true);
                  }}
                  onMouseLeave={() => {
                    setTimeout(() => setShowReactionPicker(false), 200);
                  }}
                >
                  {Object.entries(reactionTypes).map(([type, config]) => (
                    <Tooltip
                      key={type}
                      content={config.label}
                      position="top"
                      delay={200}
                    >
                      <button
                        className="reaction-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(type, e);
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.3)';
                          e.target.style.backgroundColor = `${config.color}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        {config.emoji}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Détails des réactions avec style amélioré */}
        {showReactionDetails && getTotalReactions() > 0 && (
          <div className="reaction-details">
            <h4>
              <span style={{ color: '#0a66c2' }}>
                {getTotalReactions()}
              </span>
              {' '}personne{getTotalReactions() > 1 ? 's ont' : ' a'} réagi à cette publication
            </h4>
            {Object.entries(reactions)
              .filter(([_, reaction]) => reaction.count > 0)
              .sort(([_, a], [__, b]) => b.count - a.count)
              .map(([type, reaction]) => (
                <div key={type} className="reaction-detail-item">
                  <div className="reaction-type">
                    <span style={{ fontSize: '16px' }}>{reactionTypes[type].emoji}</span>
                    <span style={{ color: reactionTypes[type].color }}>
                      {reactionTypes[type].label}
                    </span>
                  </div>
                  <span className="reaction-count">
                    {reaction.count}
                  </span>
                  <div className="reaction-users">
                    {reaction.users.slice(0, 5).join(', ')}
                    {reaction.users.length > 5 && (
                      <span style={{ color: '#0a66c2', fontWeight: '500' }}>
                        {' '}et {reaction.users.length - 5} autre{reaction.users.length - 5 > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            
            {/* Bouton pour fermer */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '12px', 
              paddingTop: '8px', 
              borderTop: '1px solid #e9ecef' 
            }}>
              <button
                onClick={() => setShowReactionDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0a66c2',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(10, 102, 194, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Masquer les détails
              </button>
            </div>
          </div>
        )}
        
        {/* Statut du post (pour les admins) */}
        {post.status && post.status !== 'approved' && (
          <div className={`post-status status-${post.status}`}>
            {post.status === 'pending' ? 'En attente de modération' : 
             post.status === 'rejected' ? 'Rejeté' : post.status}
          </div>
        )}
      </div>

      {showGallery && (
        <ImageGallery 
          images={post.images.slice(0, 4).map(img => getImagePath(img))}
          initialIndex={selectedImageIndex}
          onClose={closeGallery}
        />
      )}
    </>
  );
};

export default Post;