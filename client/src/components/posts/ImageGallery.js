// client/src/components/posts/ImageGallery.js - Version corrigée
import React, { useState, useEffect, useCallback } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Navigation avec les flèches du clavier
  const goToPrevious = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setIsLoading(true);
  }, [images]);

  const goToNext = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setIsLoading(true);
  }, [images]);

  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'Escape':
        if (onClose) onClose();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      default:
        break;
    }
  }, [onClose, goToPrevious, goToNext]);

  // Vérifier que les images sont valides
  useEffect(() => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      console.error('ImageGallery: Images invalides ou vides', images);
      if (onClose) onClose();
      return;
    }

    // Vérifier l'index initial
    if (initialIndex >= 0 && initialIndex < images.length) {
      setCurrentIndex(initialIndex);
    } else {
      setCurrentIndex(0);
    }
  }, [initialIndex, images, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Empêcher le scroll
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  // Gestion du touch pour mobile
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Gestion du chargement des images
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (e) => {
    console.error('Erreur de chargement de l\'image:', e);
    setIsLoading(false);
  };

  // Fermer en cliquant sur l'arrière-plan
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('gallery-backdrop')) {
      if (onClose) onClose();
    }
  };

  // Vérifications de sécurité avant le rendu
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  // Vérifier que l'index actuel est valide
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, images.length - 1));
  const currentImage = images[safeCurrentIndex];

  if (!currentImage) {
    console.error('Image actuelle invalide:', { currentIndex, safeCurrentIndex, imagesLength: images.length });
    return null;
  }

  return (
    <div 
      className="gallery-backdrop" 
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="gallery-container">
        {/* Header avec compteur et bouton fermer */}
        <div className="gallery-header">
          <div className="image-counter">
            {safeCurrentIndex + 1} / {images.length}
          </div>
          <button className="close-button" onClick={() => onClose && onClose()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        {/* Image principale */}
        <div className="gallery-content">
          {isLoading && (
            <div className="gallery-loading">
              <div className="spinner"></div>
            </div>
          )}
          
          <img
            src={currentImage}
            alt={`Contenu ${safeCurrentIndex + 1}`}
            className={`gallery-image ${isLoading ? 'loading' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
            key={`gallery-img-${safeCurrentIndex}`} // Force le re-render pour chaque image
          />
        </div>

        {/* Boutons de navigation */}
        {images.length > 1 && (
          <>
            <button 
              className="nav-button nav-previous" 
              onClick={goToPrevious}
              disabled={isLoading}
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="15,18 9,12 15,6" stroke="white" strokeWidth="2"/>
              </svg>
            </button>
            
            <button 
              className="nav-button nav-next" 
              onClick={goToNext}
              disabled={isLoading}
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="9,18 15,12 9,6" stroke="white" strokeWidth="2"/>
              </svg>
            </button>
          </>
        )}

        {/* Miniatures */}
        {images.length > 1 && (
          <div className="gallery-thumbnails">
            {images.map((image, index) => (
              <div
                key={`thumb-${index}`}
                className={`thumbnail ${index === safeCurrentIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsLoading(true);
                }}
              >
                <img
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  draggable={false}
                  onError={(e) => {
                    console.warn(`Erreur de chargement de la miniature ${index}:`, image);
                    // Ne pas cacher la miniature, juste logger l'erreur
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Indicateurs de swipe pour mobile */}
        {images.length > 1 && (
          <div className="swipe-indicator">
            <span>Glisser pour naviguer</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;