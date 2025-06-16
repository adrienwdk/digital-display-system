// client/src/components/ui/Tooltip.js
import React, { useState } from 'react';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 500,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px'
        };
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px'
        };
      case 'left':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '8px'
        };
      case 'right':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '8px'
        };
      default:
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px'
        };
    }
  };

  const getArrowStyles = () => {
    const arrowSize = '5px';
    const arrowColor = 'rgba(0, 0, 0, 0.9)';
    
    switch (position) {
      case 'top':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize} solid transparent`,
          borderRight: `${arrowSize} solid transparent`,
          borderTop: `${arrowSize} solid ${arrowColor}`
        };
      case 'bottom':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize} solid transparent`,
          borderRight: `${arrowSize} solid transparent`,
          borderBottom: `${arrowSize} solid ${arrowColor}`
        };
      case 'left':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize} solid transparent`,
          borderBottom: `${arrowSize} solid transparent`,
          borderLeft: `${arrowSize} solid ${arrowColor}`
        };
      case 'right':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize} solid transparent`,
          borderBottom: `${arrowSize} solid transparent`,
          borderRight: `${arrowSize} solid ${arrowColor}`
        };
      default:
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize} solid transparent`,
          borderRight: `${arrowSize} solid transparent`,
          borderTop: `${arrowSize} solid ${arrowColor}`
        };
    }
  };

  return (
    <div 
      className={`tooltip-container ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      
      {isVisible && content && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '6px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'tooltipFadeIn 0.2s ease-out',
            ...getPositionStyles()
          }}
        >
          {content}
          <div
            className="tooltip-arrow"
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              ...getArrowStyles()
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Tooltip;