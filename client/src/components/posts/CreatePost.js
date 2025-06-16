import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useContext(AuthContext);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulation de création de post
    // Dans une app réelle, vous enverriez une requête à votre API
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        author: currentUser.name,
        role: currentUser.role,
        time: 'À l\'instant',
        content,
        likes: 0,
        comments: 0,
        images: files.length > 0 ? Array(files.length).fill(1) : [],
        pending: true // Status en attente de validation
      };
      
      if (onPostCreated) onPostCreated(newPost);
      
      setContent('');
      setFiles([]);
      setIsSubmitting(false);
    }, 1000);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFiles(filesArray);
    }
  };
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '10px', 
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
      padding: '20px',
      marginBottom: '20px'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <textarea
            placeholder="Partagez quelque chose avec vos collègues..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              resize: 'vertical'
            }}
          />
        </div>
        
        {files.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <p>{files.length} fichier(s) sélectionné(s)</p>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center', 
            gap: '5px',
            cursor: 'pointer',
            color: '#555'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Ajouter une image
            <input 
              type="file" 
              accept="image/*" 
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#ff5c39',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              opacity: !content.trim() || isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Envoi...' : 'Publier'}
          </button>
        </div>
        
        <div style={{ 
          fontSize: '12px', 
          color: '#777', 
          marginTop: '10px',
          textAlign: 'center' 
        }}>
          Votre post sera publié après validation par un administrateur
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
