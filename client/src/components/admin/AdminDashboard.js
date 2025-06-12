import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';

const AdminDashboard = () => {
  const [pendingPosts, setPendingPosts] = useState([
    {
      id: 10,
      author: 'Sophie Martin',
      role: 'Assistante Marketing',
      time: 'Il y a 1 heure',
      content: 'Nouveau projet en cours de préparation pour la campagne de fin d\'année. Restez à l\'écoute pour plus de détails !',
      likes: 0,
      comments: 0,
      images: [1]
    },
    {
      id: 11,
      author: 'Thomas Dupont',
      role: 'Développeur Frontend',
      time: 'Il y a 3 heures',
      content: 'Je viens de terminer la refonte de notre page d\'accueil. N\'hésitez pas à me faire part de vos retours !',
      likes: 0,
      comments: 0,
      images: []
    }
  ]);
  
  const handleApprove = (postId) => {
    setPendingPosts(pendingPosts.filter(post => post.id !== postId));
    // Dans une app réelle, vous enverriez une requête API pour approuver le post
  };
  
  const handleReject = (postId) => {
    setPendingPosts(pendingPosts.filter(post => post.id !== postId));
    // Dans une app réelle, vous enverriez une requête API pour rejeter le post
  };
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      
      <div style={{ flex: 1, padding: '20px' }}>
        <h1 style={{ marginBottom: '20px' }}>Administration</h1>
        
        <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ marginBottom: '20px' }}>Posts en attente de validation</h2>
          
          {pendingPosts.length === 0 ? (
            <p>Aucun post en attente de validation.</p>
          ) : (
            <div>
              {pendingPosts.map(post => (
                <div key={post.id} style={{ 
                  padding: '15px', 
                  borderBottom: '1px solid #eee', 
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', marginBottom: '10px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#ddd', 
                      borderRadius: '5px',
                      marginRight: '10px'
                    }}></div>
                    
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{post.author}</div>
                      <div style={{ fontSize: '12px', color: '#777' }}>{post.role} • {post.time}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    {post.content}
                  </div>
                  
                  {post.images.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      marginBottom: '15px' 
                    }}>
                      {post.images.map((image, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            width: '100px', 
                            height: '80px', 
                            backgroundColor: '#ddd',
                            borderRadius: '5px'
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApprove(post.id)}
                      style={{ 
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Approuver
                    </button>
                    
                    <button
                      onClick={() => handleReject(post.id)}
                      style={{ 
                        padding: '8px 16px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
