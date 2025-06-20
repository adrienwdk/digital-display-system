// client/src/components/ui/AlgorithmBadge.js
import React from 'react';
import Tooltip from './Tooltip';

const AlgorithmBadge = ({ label, color, reason }) => {
  if (!label) return null;

  const getTooltipContent = () => {
    switch (reason) {
      case 'pinned':
        return 'Ce post a été épinglé par un administrateur';
      case 'top_of_month':
        return 'Post le plus populaire du mois (basé sur les réactions)';
      case 'recent':
        return 'Un des 3 posts les plus récents';
      case 'filler':
        return 'Post suggéré pour compléter le feed';
      default:
        return 'Sélectionné par l\'algorithme';
    }
  };

  const getIcon = () => {
    switch (reason) {
      case 'pinned':
        return '📌';
      case 'top_of_month':
        return '🏆';
      case 'recent':
        return '🆕';
      case 'filler':
        return '💡';
      default:
        return '🎯';
    }
  };

  return (
    <Tooltip content={getTooltipContent()} position="bottom" delay={300}>
      <div 
        className="algorithm-badge"
        style={{
          backgroundColor: color,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          margin: '0 4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          animation: reason === 'top_of_month' ? 'sparkle 2s ease-in-out infinite' : 'none'
        }}
      >
        <span role="img" aria-label={label} style={{ fontSize: '8px' }}>
          {getIcon()}
        </span>
        {label}
      </div>
      
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
      `}</style>
    </Tooltip>
  );
};

export default AlgorithmBadge;