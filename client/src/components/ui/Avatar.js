// client/src/components/ui/Avatar.js - Version corrigée
import React from 'react';

const Avatar = ({ user, size = 'medium', className = '' }) => {
  const sizeStyles = {
    small: { width: '32px', height: '32px', fontSize: '12px' },
    medium: { width: '40px', height: '40px', fontSize: '14px' },
    large: { width: '50px', height: '50px', fontSize: '18px' }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  };

  const currentSize = sizeStyles[size];

  const containerStyle = {
    width: currentSize.width,
    height: currentSize.height,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative'
  };

  const textStyle = {
    fontSize: currentSize.fontSize,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: '1'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  return (
    <div 
      className={`avatar ${className}`}
      style={containerStyle}
    >
      {user?.avatar ? (
        <>
          <img 
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            style={imageStyle}
            onError={(e) => {
              // Si l'image ne charge pas, la cacher et afficher les initiales
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              const initialsDiv = parent.querySelector('.avatar-initials');
              if (initialsDiv) {
                initialsDiv.style.display = 'flex';
              }
            }}
          />
          <div 
            className="avatar-initials"
            style={{
              ...textStyle,
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getInitials(user?.firstName, user?.lastName)}
          </div>
        </>
      ) : (
        <div 
          className="avatar-initials"
          style={textStyle}
        >
          {getInitials(user?.firstName, user?.lastName)}
        </div>
      )}
    </div>
  );
};

export default Avatar;