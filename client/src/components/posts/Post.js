// client/src/components/posts/Post.js
import React, { useState } from 'react';
import ImageGallery from './ImageGallery';
import Avatar from '../ui/Avatar';

const Post = ({ post }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      case 'technique':
        return '#007bff';
      case 'finance':
        return '#ffc107';
      case 'direction':
        return '#dc3545';
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
      case 'technique':
        return 'Technique';
      case 'finance':
        return 'Finance';
      case 'direction':
        return 'Direction';
      case 'autre':
        return 'Autre';
      default:
        return dept ? dept.charAt(0).toUpperCase() + dept.slice(1) : 'Non défini';
    }
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
        return 'quad'; // Limité à 4 max
    }
  };

  // Rendu des images avec layout adaptatif
  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null;

    // Limiter à 4 images maximum
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
            {/* Overlay pour indiquer qu'on peut cliquer */}
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

  console.log("Rendering post with images:", post.images);

  return (
    <>
      <div className="post">
      <div className="post-header">
  {/* Utiliser le composant Avatar au lieu de la div vide */}
  <Avatar 
    user={{
      firstName: post.author?.split(' ')[0] || '',
      lastName: post.author?.split(' ').slice(1).join(' ') || '',
      avatar: post.authorAvatar // Nouvelle propriété à ajouter
    }} 
    size="medium"
  />
  
  <div className="post-meta">
    <div className="post-author">{post.author}</div>
    <div className="post-role">{post.role}</div>
  </div>
  
  <div className="post-header-right">
    {/* Badge de département */}
    {post.department && (
      <div 
        className="department-badge"
        style={{ 
          padding: '3px 8px', 
          borderRadius: '12px', 
          backgroundColor: getDepartmentBadgeClass(post.department),
          color: '#fff',
          fontSize: '11px',
          fontWeight: 'bold',
          marginBottom: '5px'
        }}
      >
        {formatDepartmentName(post.department)}
      </div>
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
        
        {/* Images avec nouveau système de galerie */}
        {renderImages()}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Actions du post */}
        <div className="post-actions">
          <div className="like-counter">
          <span className="like-icon" role="img" aria-label="J'aime">👍</span> 
            <span className="like-count">{post.likes || 0}</span>
          </div>
          <div className="comment-counter">
            <span className="comment-icon" role="img" aria-label="Commentaires">💬</span>
            <span className="comment-count">{post.comments || 0} Commentaire{post.comments !== 1 ? 's' : ''}</span>
          </div>
          
          {/* Statut du post */}
          {post.status && (
            <div className={`post-status status-${post.status}`}>
              {post.status === 'approved' ? 'Approuvé' : 
               post.status === 'pending' ? 'En attente' : 
               'Rejeté'}
            </div>
          )}
        </div>
      </div>

      {/* Galerie en plein écran */}
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