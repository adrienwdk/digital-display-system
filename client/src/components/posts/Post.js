// client/src/components/posts/Post.js - Version avec modal de réactions
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
  const [activeReactionTab, setActiveReactionTab] = useState('all');
  const [pickerTimeout, setPickerTimeout] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  // Configuration des types de réactions avec couleurs terra-cotta
  const reactionTypes = {
    like: { emoji: '👍', label: 'J\'aime', color: '#d2691e' },
    love: { emoji: '❤️', label: 'J\'adore', color: '#cd853f' },
    bravo: { emoji: '👏', label: 'Bravo', color: '#ff8c00' },
    interesting: { emoji: '🤔', label: 'Intéressant', color: '#8b6f47' },
    welcome: { emoji: '👋', label: 'Bienvenue', color: '#228b22' }
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

    if (pickerTimeout) {
      clearTimeout(pickerTimeout);
      setPickerTimeout(null);
    }

    try {
      const response = await reactionsService.toggleReaction(post._id, reactionType, userReaction);
      
      setReactions(response.reactions);
      setUserReaction(response.userReaction);
      
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
      }, 600);
      setPickerTimeout(timeout);
    }
  };

  const handleMouseLeaveButton = () => {
    if (pickerTimeout) {
      clearTimeout(pickerTimeout);
      setPickerTimeout(null);
    }
    
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
    const colors = {
      marketing: '#cd853f',
      rh: '#d2691e',
      informatique: '#8b6f47',
      commerce: '#ff8c00',
      achat: '#d2691e',
      comptabilité: '#bf5f1a',
      logistique: '#228b22',
      general: '#8d6e63'
    };
    return colors[dept] || colors.general;
  };

  // Formater le nom du département pour l'affichage
  const formatDepartmentName = (dept) => {
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
      case 1: return 'single';
      case 2: return 'double';
      case 3: return 'triple';
      case 4: return 'quad';
      default: return 'quad';
    }
  };

  // Fonction pour tronquer le texte
  const truncateText = (text, maxLength = 280) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2"/>
                  <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" strokeWidth="2"/>
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
    if (typeof post.author === 'string') {
      const nameParts = post.author.split(' ');
      return {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        avatar: post.authorAvatar || null
      };
    }
    
    if (typeof post.author === 'object') {
      return {
        firstName: post.author.firstName || '',
        lastName: post.author.lastName || '',
        avatar: post.author.avatar || post.authorAvatar || null
      };
    }

    return {
      firstName: 'Utilisateur',
      lastName: '',
      avatar: null
    };
  };

  // Calculer le temps relatif avec plus de précision
  const getRelativeTime = () => {
    if (!post.time) return '';
    
    // Si c'est déjà formaté, le retourner tel quel
    if (typeof post.time === 'string' && post.time.includes('Il y a')) {
      return post.time;
    }
    
    const now = new Date();
    const postDate = new Date(post.createdAt || post.time);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes}min`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours}h`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    if (days < 7) return `Il y a ${days}j`;
    
    return postDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Fonction pour gérer le clic sur le résumé des réactions
  const handleReactionsSummaryClick = () => {
    setActiveReactionTab('all');
    setShowReactionDetails(!showReactionDetails);
  };

  // Fonction pour rendre la liste des réactions dans le modal
  const renderReactionsList = () => {
    let usersToShow = [];
    
    if (activeReactionTab === 'all') {
      // Rassembler tous les utilisateurs avec leurs réactions
      Object.entries(reactions).forEach(([reactionType, reaction]) => {
        reaction.users.forEach(user => {
          usersToShow.push({
            ...user,
            reactionType: reactionType
          });
        });
      });
      // Trier par date de réaction (plus récent en premier)
      usersToShow.sort((a, b) => new Date(b.reactedAt) - new Date(a.reactedAt));
    } else {
      // Afficher seulement les utilisateurs de la réaction sélectionnée
      usersToShow = reactions[activeReactionTab]?.users || [];
    }

    if (usersToShow.length === 0) {
      return (
        <div className="reaction-empty-state">
          <p>Aucune réaction pour le moment</p>
        </div>
      );
    }

    return (
      <div className="reaction-users-list">
        {usersToShow.map((user, index) => (
          <div key={`${user.userId}-${index}`} className="reaction-user-item">
            <div className="reaction-user-avatar-container">
              <Avatar 
                user={{
                  firstName: user.userName?.split(' ')[0] || 'Utilisateur',
                  lastName: user.userName?.split(' ').slice(1).join(' ') || '',
                  avatar: null // Vous pouvez ajouter l'avatar si disponible
                }} 
                size="medium"
                className="reaction-user-avatar"
              />
              {activeReactionTab === 'all' && (
                <div className={`reaction-user-badge ${user.reactionType}`}>
                  <span className={`reaction-emoji ${user.reactionType}`}></span>
                </div>
              )}
            </div>
            
            <div className="reaction-user-info">
              <div className="reaction-user-name">{user.userName}</div>
              <div className="reaction-user-role">
                {/* Vous pouvez ajouter le rôle ici si disponible dans les données */}
                Employé
              </div>
            </div>
            
            {activeReactionTab !== 'all' && (
              <div className={`reaction-user-reaction ${activeReactionTab}`}>
                <span className={`reaction-emoji ${activeReactionTab}`}></span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
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

  const shouldTruncate = post.content && post.content.length > 280;
  const displayContent = isExpanded ? post.content : truncateText(post.content);

  return (
    <>
      <article className="post" data-post-id={post._id}>
        {/* En-tête du post avec informations utilisateur */}
        <header className="post-header">
          <Avatar 
            user={getAuthorData()} 
            size="medium"
          />
          
          <div className="post-meta">
            <div className="post-author-info">
              <h3 className="post-author">
                {typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim()}
              </h3>
              <p className="post-role">{post.role}</p>
            </div>
          </div>
          
          <div className="post-header-right">
  {post.isPinned && (
    <span className="pinned-indicator" title="Post épinglé">
      📌
    </span>
  )}
  {(post.service || post.department) && (
    <Tooltip 
      content={`Service : ${formatDepartmentName(post.service || post.department)}`}
      position="bottom"
    >
      <span 
        className="department-badge"
        style={{ 
          backgroundColor: getDepartmentBadgeClass(post.service || post.department)
        }}
      >
        {formatDepartmentName(post.service || post.department)}
      </span>
    </Tooltip>
  )}
  <time className="post-time" dateTime={post.createdAt}>
    {getRelativeTime()}
  </time>
</div>
        </header>
        
        {/* Contenu du post */}
        <div className="post-content">
          {post.title && (
            <h2 className="post-title">{post.title}</h2>
          )}
          
          <div className="post-text">
            {displayContent}
            {shouldTruncate && (
              <button 
                className="expand-button"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        </div>
        
        {/* Images du post */}
        {renderImages()}
        
        {/* Tags du post */}
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
              <button 
                className="reactions-summary"
                onClick={handleReactionsSummaryClick}
                aria-label="Voir qui a réagi"
              >
                <div className="reactions-summary-left">
                  <div className="reaction-emojis">
                    {getTopReactions().map(([type, reaction], index) => (
                      <div 
                        key={type} 
                        className={`reaction-emoji-container ${type}`}
                        style={{ 
                          zIndex: getTopReactions().length - index,
                        }}
                        title={`${reaction.count} ${reactionTypes[type].label}`}
                      >
                        <span className={`reaction-emoji ${type}`}></span>
                      </div>
                    ))}
                  </div>
                  <span className="reactions-count">
                    {getTotalReactions()} {getTotalReactions() > 1 ? 'réactions' : 'réaction'}
                  </span>
                </div>
              </button>
            </Tooltip>
          )}
          
          {/* Boutons d'action - UNIQUEMENT LES RÉACTIONS */}
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
                  aria-label={userReaction ? `Réaction actuelle: ${reactionTypes[userReaction].label}` : 'Ajouter une réaction'}
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
                        aria-label={`Réagir avec ${config.label}`}
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
        
        {/* Statut du post (pour les admins) */}
        {post.status && post.status !== 'approved' && (
          <div className={`post-status status-${post.status}`}>
            <div className="status-indicator">
              {post.status === 'pending' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {post.status === 'rejected' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>
                {post.status === 'pending' ? 'En attente de modération' : 
                 post.status === 'rejected' ? 'Rejeté' : post.status}
              </span>
            </div>
          </div>
        )}
      </article>

      {/* Modal des réactions détaillées */}
      {showReactionDetails && getTotalReactions() > 0 && (
        <>
          <div className="reaction-details-overlay" onClick={() => setShowReactionDetails(false)} />
          <div className="reaction-details-modal">
            <div className="reaction-details-header">
              <h3 className="reaction-details-title">Réactions</h3>
              <button 
                className="reaction-details-close" 
                onClick={() => setShowReactionDetails(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            
            <div className="reaction-details-tabs">
              <button 
                className={`reaction-details-tab ${activeReactionTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveReactionTab('all')}
              >
                <span className="tab-label">Tout</span>
                <span className="tab-count">{getTotalReactions()}</span>
              </button>
              
              {Object.entries(reactions)
                .filter(([_, reaction]) => reaction.count > 0)
                .sort(([_, a], [__, b]) => b.count - a.count)
                .map(([type, reaction]) => (
                  <button
                    key={type}
                    className={`reaction-details-tab ${activeReactionTab === type ? 'active' : ''}`}
                    onClick={() => setActiveReactionTab(type)}
                  >
                    <div className={`reaction-details-tab-emoji ${type}`}>
                      <span className={`reaction-emoji ${type}`}></span>
                    </div>
                    <span className="tab-count">{reaction.count}</span>
                  </button>
                ))}
            </div>
            
            <div className="reaction-details-content">
              {renderReactionsList()}
            </div>
          </div>
        </>
      )}

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