// client/src/components/ui/EmptyState.js - Composant d'état vide moderne
import React from 'react';

const EmptyState = ({ 
  type = 'general', 
  searchQuery = '', 
  isLoggedIn = false, 
  currentUserService = null,
  onCreatePost = null 
}) => {
  
  const getEmptyStateContent = () => {
    if (type === 'general') {
      return {
        icon: (
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-4.5B6.75 8.25 3.375 11.625v2.625m15.75 0a3.375 3.375 0 11-6.75 0m6.75 0H9a3.75 3.75 0 000 7.5H9m12-7.5h.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H19.5m-4.5-6.75v6.75a3.75 3.75 0 11-7.5 0v-6.75m7.5 0V9a2.25 2.25 0 00-2.25-2.25H9A2.25 2.25 0 006.75 9v.75m7.5 0h3.75M9 11.25h3.75" />
          </svg>
        ),
        title: 'Section Général',
        subtitle: 'Posts épinglés',
        description: 'Cette section affiche uniquement les posts importants épinglés par les administrateurs. Les posts épinglés peuvent provenir de n\'importe quel service.',
        action: isLoggedIn && currentUserService === 'general' ? {
          text: 'Voir tous les posts',
          onClick: () => window.location.href = '#all'
        } : null,
        gradient: 'from-blue-500 to-purple-600'
      };
    }

    if (searchQuery) {
      return {
        icon: (
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        ),
        title: 'Aucun résultat',
        subtitle: `Aucune publication trouvée pour "${searchQuery}"`,
        description: 'Essayez avec des mots-clés différents ou vérifiez l\'orthographe.',
        action: null,
        gradient: 'from-gray-500 to-gray-600'
      };
    }

    // État vide pour un service spécifique
    const serviceNames = {
      rh: 'Ressources Humaines',
      commerce: 'Commerce',
      marketing: 'Marketing',
      informatique: 'Informatique',
      achat: 'Achats',
      comptabilité: 'Comptabilité',
      logistique: 'Logistique'
    };

    const serviceIcons = {
      rh: (
        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      commerce: (
        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      marketing: (
        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A6.957 6.957 0 017 16" />
        </svg>
      )
    };

    const serviceGradients = {
      rh: 'from-blue-500 to-cyan-500',
      commerce: 'from-orange-500 to-red-500',
      marketing: 'from-pink-500 to-rose-500',
      informatique: 'from-purple-500 to-indigo-500',
      achat: 'from-green-500 to-emerald-500',
      comptabilité: 'from-yellow-500 to-orange-500',
      logistique: 'from-teal-500 to-cyan-500'
    };

    return {
      icon: serviceIcons[type] || serviceIcons.commerce,
      title: `Section ${serviceNames[type] || type}`,
      subtitle: 'Aucune publication pour le moment',
      description: isLoggedIn 
        ? 'Soyez le premier à partager quelque chose dans cette section !' 
        : 'Connectez-vous pour voir les publications de ce service.',
      action: isLoggedIn && currentUserService === type ? {
        text: 'Créer une publication',
        onClick: onCreatePost
      } : null,
      gradient: serviceGradients[type] || 'from-gray-500 to-gray-600'
    };
  };

  const content = getEmptyStateContent();

  return (
    <div className="empty-state">
      <div className="empty-state-content">
        {/* Icône avec gradient */}
        <div className={`empty-state-icon bg-gradient-to-r ${content.gradient}`}>
          {content.icon}
        </div>
        
        {/* Contenu textuel */}
        <div className="empty-state-text">
          <h3 className="empty-state-title">{content.title}</h3>
          <p className="empty-state-subtitle">{content.subtitle}</p>
          <p className="empty-state-description">{content.description}</p>
        </div>
        
        {/* Action (bouton si applicable) */}
        {content.action && (
          <div className="empty-state-action">
            <button 
              className={`empty-state-button bg-gradient-to-r ${content.gradient}`}
              onClick={content.action.onClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {content.action.text}
            </button>
          </div>
        )}
        
        {/* Indicateurs visuels supplémentaires */}
        <div className="empty-state-indicators">
          {type === 'general' && (
            <div className="coming-soon-badge">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Bientôt disponible</span>
            </div>
          )}
          
          {searchQuery && (
            <div className="search-tips">
              <h4>Conseils de recherche :</h4>
              <ul>
                <li>Vérifiez l'orthographe</li>
                <li>Utilisez des mots-clés plus généraux</li>
                <li>Essayez différentes sections</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Éléments décoratifs */}
      <div className="empty-state-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default EmptyState;