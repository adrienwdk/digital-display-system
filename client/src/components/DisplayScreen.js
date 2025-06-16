import React, { useState, useEffect } from 'react';

const DisplayScreen = () => {
  const [content, setContent] = useState([
    { id: 1, type: 'text', title: 'Bienvenue', body: '<h1>Bienvenue sur notre système d\'affichage digital</h1><p>Ce système permet d\'afficher des informations importantes sur différents écrans.</p>' },
    { id: 2, type: 'image', title: 'Image exemple', url: 'https://via.placeholder.com/800x400?text=Image+Exemple' },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mise à jour de l'horloge
  useEffect(() => {
    const timerID = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timerID);
  }, []);

  // Rotation du contenu
  useEffect(() => {
    if (content.length <= 1) return;
    
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === content.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // 10 secondes par contenu
    
    return () => clearTimeout(timer);
  }, [content, currentIndex]);

  const currentContent = content[currentIndex];
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

  return (
    <div className="display-screen">
      {/* En-tête */}
      <header className="display-header">
        <div className="logo-container">
          <div className="logo">
            <span>DC</span>
          </div>
          <h1>Digital Content System</h1>
        </div>
        <div>
          <div>{currentTime.toLocaleDateString('fr-FR', dateOptions)}</div>
          <div>{currentTime.toLocaleTimeString('fr-FR', timeOptions)}</div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="content-area">
        {currentContent.type === 'image' && (
          <img 
            src={currentContent.url} 
            alt={currentContent.title}
            className="content-image" 
          />
        )}
        
        {currentContent.type === 'text' && (
          <div className="content-text">
            <h2>{currentContent.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: currentContent.body }} />
          </div>
        )}
        
        {/* Indicateur de progression */}
        <div className="progress-indicators">
          {content.map((_, index) => (
            <div 
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </main>
      
      {/* Bandeau d'informations */}
      <footer className="news-ticker">
        <div className="ticker-content">
          <span>
            Bienvenue sur notre système d'affichage digital • Information importante à faire défiler • Contactez l'administrateur pour plus d'informations
          </span>
        </div>
      </footer>
    </div>
  );
};

export default DisplayScreen;
