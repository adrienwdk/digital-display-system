// client/src/components/posts/Post.js - Version simplifiée sans erreurs
import React, { useState, useEffect } from 'react';
import ImageGallery from './ImageGallery';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import reactionsService from '../../services/reactionsService';
import AlgorithmBadge from '../ui/AlgorithmBadge';

const Post = ({ post, currentUser }) => {
  // États pour la galerie d'images
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  
  // États pour les réactions
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [activeReactionTab, setActiveReactionTab] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [reactions, setReactions] = useState(post.reactions || {
    like: { count: 0, users: [] },
    love: { count: 0, users: [] },
    bravo: { count: 0, users: [] },
    interesting: { count: 0, users: [] },
    welcome: { count: 0, users: [] }
  });
  
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Configuration des types de réactions
  const reactionTypes = {
    like: { emoji: '👍', label: 'J\'aime', color: '#d2691e' },
    love: { emoji: '❤️', label: 'J\'adore', color: '#cd853f' },
    bravo: { emoji: '👏', label: 'Bravo', color: '#ff8c00' },
    interesting: { emoji: '🤔', label: 'Intéressant', color: '#8b6f47' },
    welcome: { emoji: '👋', label: 'Bienvenue', color: '#228b22' }
  };

  // Charger la réaction de l'utilisateur
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

  // Fonction pour générer l'URL complète de l'image
  const getImagePath = (imagePath) => {
    if (!imagePath) {
      console.warn('🖼️ Image path is empty or null');
      return '';
    }
    if (imagePath.startsWith('http')) return imagePath;
    const imgPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${imgPath}`;
  };

  // Ouvrir la galerie d'images
  const openGallery = (index) => {
    console.log('🖼️ Ouverture de la galerie, index:', index);
    console.log('🖼️ Images du post:', post.images);
    
    if (!post.images || !Array.isArray(post.images) || post.images.length === 0) {
      console.error('❌ Aucune image disponible pour la galerie');
      return;
    }

    // Préparer les URLs complètes des images
    const fullImageUrls = post.images.map(img => {
      const fullUrl = getImagePath(img);
      console.log('🖼️ Image URL préparée:', fullUrl);
      return fullUrl;
    });

    // Vérifier que l'index est valide
    const safeIndex = Math.max(0, Math.min(index, fullImageUrls.length - 1));
    
    setGalleryImages(fullImageUrls);
    setSelectedImageIndex(safeIndex);
    setShowGallery(true);
    
    console.log('🖼️ Galerie configurée:', { 
      images: fullImageUrls, 
      selectedIndex: safeIndex,
      showGallery: true 
    });
  };

  // Fermer la galerie
  const closeGallery = () => {
    console.log('🖼️ Fermeture de la galerie');
    setShowGallery(false);
    setGalleryImages([]);
    setSelectedImageIndex(0);
  };

  // Gestion des réactions
  const handleReaction = async (reactionType) => {
    if (!currentUser) {
      alert('Vous devez être connecté pour réagir');
      return;
    }

    if (loading) return;

    setLoading(true);
    setShowReactionPicker(false);

    try {
      const response = await reactionsService.toggleReaction(post._id, reactionType, userReaction);
      setReactions(response.reactions);
      setUserReaction(response.userReaction);
    } catch (error) {
      console.error('Erreur lors de la réaction:', error);
      alert('Erreur lors de l\'ajout de la réaction. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
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

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((total, reaction) => total + reaction.count, 0);
  };

  const getTopReactions = () => {
    return Object.entries(reactions)
      .filter(([_, reaction]) => reaction.count > 0)
      .sort(([_, a], [__, b]) => b.count - a.count)
      .slice(0, 3);
  };

  const getImageLayout = (imageCount) => {
    switch (imageCount) {
      case 1: return 'single';
      case 2: return 'double';
      case 3: return 'triple';
      case 4: return 'quad';
      default: return 'quad';
    }
  };

  const truncateText = (text, maxLength = 280) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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

  const getRelativeTime = () => {
    if (!post.time) return '';
    
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

  // Rendu des images
  const renderImages = () => {
    if (!post.images || post.images.length === 0) {
      console.log('ℹ️ Aucune image à afficher');
      return null;
    }

    console.log('🖼️ Rendu de', post.images.length, 'images');
    
    const images = post.images.slice(0, 4);
    const layout = getImageLayout(images.length);

    return (
      <div className={`post-images-grid ${layout}`}>
        {images.map((image, index) => {
          const imageUrl = getImagePath(image);
          
          return (
            <div 
              key={`img-${index}-${post._id || index}`}
              className={`image-container image-${index + 1}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖼️ Clic sur image', index, 'URL:', imageUrl);
                openGallery(index);
              }}
              style={{ 
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <img 
                src={imageUrl} 
                alt={`Image ${index + 1} du post`}
                className="post-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  console.error(`❌ Erreur image ${index}:`, imageUrl);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                }}
                onLoad={() => {
                  console.log(`✅ Image ${index} chargée:`, imageUrl);
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
          );
        })}
      </div>
    );
  };

  const shouldTruncate = post.content && post.content.length > 280;
  const displayContent = isExpanded ? post.content : truncateText(post.content);

  console.log('🔍 Post render:', { 
    postId: post._id, 
    images: post.images, 
    showGallery, 
    galleryImages: galleryImages.length 
  });

  return (
    <>
      <article className="post" data-post-id={post._id}>
        {/* En-tête du post */}
        <header className="post-header">
          <Avatar user={getAuthorData()} size="medium" />
          
          <div className="post-meta">
            <div className="post-author-info">
              <h3 className="post-author">
                {typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim()}
              </h3>
              <p className="post-role">{post.role}</p>
            </div>
          </div>
          
          <div className="post-header-right">
            {/* Indicateur d'algorithme */}
            {post.algorithmLabel && (
              <AlgorithmBadge 
                label={post.algorithmLabel}
                color={post.algorithmColor}
                reason={post.feedReason}
              />
            )}
            
            {/* Post épinglé */}
            {post.isPinned && (
              <span className="pinned-indicator" title="Post épinglé">📌</span>
            )}
            
            {/* Badge de service */}
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
            
            {/* Timestamp */}
            <time className="post-time" dateTime={post.createdAt}>
              {getRelativeTime()}
            </time>
          </div>
        </header>
        
        {/* Contenu du post */}
        <div className="post-content">
          {post.title && <h2 className="post-title">{post.title}</h2>}
          
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
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}
        
        {/* Section des réactions */}
        <div className="post-reactions-section">
          {/* Affichage des réactions existantes */}
          {getTotalReactions() > 0 && (
            <button 
              className="reactions-summary"
              onClick={() => setShowReactionDetails(!showReactionDetails)}
              aria-label="Voir qui a réagi"
            >
              <div className="reactions-summary-left">
                <div className="reaction-emojis">
                  {getTopReactions().map(([type, reaction], index) => (
                    <div 
                      key={type} 
                      className={`reaction-emoji-container ${type}`}
                      style={{ zIndex: getTopReactions().length - index }}
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
          )}
          
          {/* Boutons d'action */}
          <div className="post-actions">
            <div className="reaction-button-container">
              <button 
                className={`reaction-button ${userReaction ? 'has-reaction' : ''} ${loading ? 'loading' : ''}`}
                onClick={() => setShowReactionPicker(!showReactionPicker)}
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
              
              {/* Picker de réactions */}
              {showReactionPicker && !loading && (
                <div className="reaction-picker">
                  {Object.entries(reactionTypes).map(([type, config]) => (
                    <button
                      key={type}
                      className="reaction-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(type);
                      }}
                      aria-label={`Réagir avec ${config.label}`}
                    >
                      {config.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Statut du post */}
        {post.status && post.status !== 'approved' && (
          <div className={`post-status status-${post.status}`}>
            <div className="status-indicator">
              <span>
                {post.status === 'pending' ? 'En attente de modération' : 
                 post.status === 'rejected' ? 'Rejeté' : post.status}
              </span>
            </div>
          </div>
        )}
      </article>

      {/* Galerie d'images */}
      {showGallery && galleryImages.length > 0 && (
        <ImageGallery 
          images={galleryImages}
          initialIndex={selectedImageIndex}
          onClose={closeGallery}
        />
      )}
    </>
  );
};

export default Post;