import React from 'react';

const Post = ({ post }) => {
  // Fonction pour s'assurer que les chemins d'images sont corrects
  const getImagePath = (imagePath) => {
    if (!imagePath) return '';
    // Force l'URL complète pour les images
    if (imagePath.startsWith('http')) return imagePath;
    const imgPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${imgPath}`;
  };

  // Obtenir la classe CSS pour l'indicateur de département
  const getDepartmentBadgeClass = (dept) => {
    switch(dept) {
      case 'marketing':
        return '#28a745'; // vert
      case 'rh':
        return '#17a2b8'; // bleu ciel
      case 'technique':
        return '#007bff'; // bleu
      case 'finance':
        return '#ffc107'; // jaune
      case 'direction':
        return '#dc3545'; // rouge
      default:
        return '#6c757d'; // gris
    }
  };

  // Formater le nom du département pour l'affichage
  const formatDepartmentName = (dept) => {
    switch(dept) {
      case 'marketing':
        return 'Marketing';
      case 'rh':
        return 'RH';
      case 'technique':
        return 'Technique';
      case 'finance':
        return 'Finance';
      case 'direction':
        return 'Direction';
      case 'autre':
        return 'Autre';
      default:
        return dept ? dept.charAt(0).toUpperCase() + dept.slice(1) : 'Non défini';
    }
  };

  console.log("Rendering post with images:", post.images);

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '10px', 
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', marginBottom: '15px' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          backgroundColor: '#ddd', 
          borderRadius: '10px',
          marginRight: '15px'
        }}></div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{post.author}</div>
          <div style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>{post.role}</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {/* Badge de département */}
          {post.department && (
            <div style={{ 
              padding: '3px 8px', 
              borderRadius: '12px', 
              backgroundColor: getDepartmentBadgeClass(post.department),
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: '5px'
            }}>
              {formatDepartmentName(post.department)}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#999' }}>{post.time}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        {post.title && (
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            {post.title}
          </h3>
        )}
        <div style={{ whiteSpace: 'pre-line' }}>{post.content}</div>
      </div>
      
      {post.images && post.images.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {post.images.map((image, index) => (
            <div 
              key={index} 
              style={{ 
                width: post.images.length === 1 ? '100%' : 
                       post.images.length === 2 ? 'calc(50% - 5px)' : 
                       'calc(33.33% - 7px)', 
                height: post.images.length === 1 ? '300px' : '100px',
                borderRadius: '5px',
                overflow: 'hidden'
              }}
            >
              <img 
                src={getImagePath(image)} 
                alt={`Contenu du post ${index}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.error(`Erreur de chargement de l'image: ${image}`, e);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      {post.tags && post.tags.length > 0 && (
        <div style={{ marginBottom: '15px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {post.tags.map((tag, index) => (
            <span key={index} style={{
              backgroundColor: '#f0f0f0',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#555'
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      <div style={{ display: 'flex', fontSize: '12px', color: '#777' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <span role="img" aria-label="J'aime" style={{ marginRight: '5px' }}>👍</span> {post.likes || 0}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
          <span role="img" aria-label="Commentaires" style={{ marginRight: '5px' }}>💬</span> {post.comments || 0} Commentaire{post.comments !== 1 ? 's' : ''}
        </div>
        
        {post.status && (
          <div style={{ 
            padding: '2px 6px', 
            borderRadius: '10px', 
            backgroundColor: post.status === 'approved' ? '#e6f7e6' : 
                              post.status === 'pending' ? '#fff3cd' : 
                              '#f8d7da',
            color: post.status === 'approved' ? '#28a745' : 
                   post.status === 'pending' ? '#856404' : 
                   '#721c24',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            {post.status === 'approved' ? 'Approuvé' : 
             post.status === 'pending' ? 'En attente' : 
             'Rejeté'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;