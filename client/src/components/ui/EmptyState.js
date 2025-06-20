// client/src/components/ui/EmptyState.js - Version corrigée complète
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ),
        title: 'Section Général avec Algorithme',
        subtitle: 'Feed intelligent personnalisé',
        description: 'Cette section utilise un algorithme intelligent qui sélectionne le contenu le plus pertinent pour vous.',
        action: isLoggedIn ? {
          text: 'Créer une publication',
          onClick: () => {
            if (onCreatePost) {
              onCreatePost();
            }
          }
        } : {
          text: 'Connectez-vous pour plus de contenu',
          onClick: null
        },
        gradient: 'from-blue-500 to-purple-600',
        algorithmInfo: {
          title: 'Comment ça marche ?',
          features: [
            {
              icon: '📌',
              title: 'Posts épinglés',
              description: 'Contenu important mis en avant par l\'équipe'
            },
            {
              icon: '🏆',
              title: 'Post du mois',
              description: 'Le post avec le plus de réactions ce mois-ci'
            },
            {
              icon: '🆕',
              title: 'Dernières actualités',
              description: 'Les 3 publications les plus récentes'
            },
            {
              icon: '💡',
              title: 'Suggestions',
              description: 'Contenu additionnel pour enrichir votre feed'
            }
          ]
        }
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
        
        {/* Informations sur l'algorithme (uniquement pour la section général) */}
        {content.algorithmInfo && (
          <div className="algorithm-info">
            <h4 className="algorithm-info-title">{content.algorithmInfo.title}</h4>
            <div className="algorithm-features">
              {content.algorithmInfo.features.map((feature, index) => (
                <div key={index} className="algorithm-feature">
                  <span className="algorithm-feature-icon" role="img" aria-label={feature.title}>
                    {feature.icon}
                  </span>
                  <div className="algorithm-feature-content">
                    <h5 className="algorithm-feature-title">{feature.title}</h5>
                    <p className="algorithm-feature-description">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Indicateurs visuels supplémentaires */}
        <div className="empty-state-indicators">
          {type === 'general' && (
            <div className="coming-soon-badge">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Algorithme intelligent</span>
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