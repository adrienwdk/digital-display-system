// client/src/components/ui/Avatar.js
import React from 'react';

const Avatar = ({ user, size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
  };

  return (
    <div className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>
      {user?.avatar ? (
        <img 
          src={user.avatar}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Si l'image ne charge pas, afficher les initiales
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`w-full h-full flex items-center justify-center text-gray-600 font-semibold ${user?.avatar ? 'hidden' : 'flex'}`}
        style={{ fontSize: size === 'small' ? '12px' : size === 'medium' ? '14px' : '18px' }}
      >
        {getInitials(user?.firstName, user?.lastName)}
      </div>
    </div>
  );
};

export default Avatar;