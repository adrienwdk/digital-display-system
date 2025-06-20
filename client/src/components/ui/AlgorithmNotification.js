// client/src/components/ui/AlgorithmNotification.js
import React, { useState, useEffect } from 'react';

const AlgorithmNotification = ({ isActive, stats }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (isActive) {
      setShowNotification(true);
      // Auto-masquer après 5 secondes si l'utilisateur n'interagit pas
      const timer = setTimeout(() => {
        if (isCollapsed) {
          setShowNotification(false);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
    }
  }, [isActive, isCollapsed]);

  if (!showNotification) return null;

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleClose = () => {
    setShowNotification(false);
  };

  return (
    <div className={`algorithm-notification ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="algorithm-notification-header" onClick={handleToggle}>
        <div className="notification-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="notification-title">Algorithme intelligent actif</span>
        <div className="notification-controls">
          <button className="toggle-btn" onClick={(e) => { e.stopPropagation(); handleToggle(); }}>
            {isCollapsed ? '▼' : '▲'}
          </button>
          <button className="close-btn" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
            ×
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="algorithm-notification-content">
          <p className="notification-description">
            Cette section utilise un algorithme qui sélectionne automatiquement le contenu le plus pertinent pour vous.
          </p>
          
          {stats && (
            <div className="notification-stats">
              <div className="stat-item">
                <span className="stat-label">Posts épinglés:</span>
                <span className="stat-value">{stats.pinnedCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Post du mois:</span>
                <span className="stat-value">{stats.topOfMonthCount > 0 ? '1' : '0'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Posts récents:</span>
                <span className="stat-value">{stats.recentCount}</span>
              </div>
            </div>
          )}
          
          <div className="notification-features">
            <div className="feature-item">
              <span className="feature-icon">📌</span>
              <span className="feature-text">Contenu prioritaire</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span className="feature-text">Posts populaires</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🆕</span>
              <span className="feature-text">Dernières actualités</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .algorithm-notification {
          position: fixed;
          top: 100px;
          right: 20px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          z-index: 1000;
          max-width: 320px;
          overflow: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .algorithm-notification.collapsed {
          max-height: 60px;
        }

        .algorithm-notification.expanded {
          max-height: 400px;
        }

        .algorithm-notification-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .algorithm-notification-header:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .notification-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-title {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .notification-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toggle-btn,
        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.75rem;
          transition: background-color 0.2s;
        }

        .toggle-btn:hover,
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .algorithm-notification-content {
          padding: 0 1rem 1rem;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-description {
          font-size: 0.8rem;
          line-height: 1.4;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .notification-stats {
          background: rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          margin-bottom: 1rem;
          backdrop-filter: blur(10px);
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .stat-item:last-child {
          margin-bottom: 0;
        }

        .stat-label {
          opacity: 0.8;
        }

        .stat-value {
          font-weight: 700;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-sm);
          min-width: 20px;
          text-align: center;
        }

        .notification-features {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .feature-icon {
          font-size: 0.875rem;
          width: 20px;
          text-align: center;
        }

        .feature-text {
          font-weight: 500;
        }

        /* Animation d'entrée */
        .algorithm-notification {
          animation: slideInRight 0.5s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .algorithm-notification {
            top: 80px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
          
          .notification-title {
            font-size: 0.8rem;
          }
          
          .notification-description {
            font-size: 0.75rem;
          }
        }

        /* Mode sombre automatique */
        @media (prefers-color-scheme: dark) {
          .algorithm-notification {
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            border-color: rgba(255, 255, 255, 0.1);
          }
        }
      `}</style>
    </div>
  );
};

export default AlgorithmNotification;