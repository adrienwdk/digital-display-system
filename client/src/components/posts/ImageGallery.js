// client/src/components/posts/ImageGallery.js
import React, { useState, useEffect, useCallback } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Navigation avec les flèches du clavier
  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'Escape':
        onClose();
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

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Empêcher le scroll
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  // Navigation
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setIsLoading(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setIsLoading(true);
  };

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
      onClose();
    }
  };

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
            {currentIndex + 1} / {images.length}
          </div>
          <button className="close-button" onClick={onClose}>
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
            src={images[currentIndex]}
            alt={`Contenu ${currentIndex + 1}`}
            className={`gallery-image ${isLoading ? 'loading' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
          />
        </div>

        {/* Boutons de navigation */}
        {images.length > 1 && (
          <>
            <button 
              className="nav-button nav-previous" 
              onClick={goToPrevious}
              disabled={isLoading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="15,18 9,12 15,6" stroke="white" strokeWidth="2"/>
              </svg>
            </button>
            
            <button 
              className="nav-button nav-next" 
              onClick={goToNext}
              disabled={isLoading}
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
                key={index}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsLoading(true);
                }}
              >
                <img
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}

        {/* Indicateurs de swipe pour mobile */}
        <div className="swipe-indicator left">
          <span>Glisser pour naviguer</span>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;