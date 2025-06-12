import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import Announcement from '../ui/Announcement';
import Post from '../posts/Post';
import CreatePost from '../posts/CreatePost';
import { AuthContext } from '../../context/AuthContext';

const Feed = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('general');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Charger les posts en fonction de la tab active
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Utiliser une URL différente selon la tab active
        const url = activeTab === 'general' 
          ? '/api/posts' // Tous les posts pour la tab générale
          : `/api/posts/service/${activeTab}`; // Posts du service spécifique
        
        const response = await axios.get(url);
        
        // Transformer les données du backend au format attendu par le component Post
        const formattedPosts = response.data.map(post => ({
          id: post._id,
          author: post.author,
          role: post.role,
          time: formatTime(post.createdAt),
          content: post.content,
          likes: post.likes || 0,
          comments: post.comments || 0,
          images: post.images || [],
          service: post.service // Ajouter le service pour faciliter le filtrage
        }));
        
        setPosts(formattedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des posts:', error);
        // En cas d'erreur, continuer avec des posts vides
        setPosts([]);
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [activeTab]); // Recharger quand la tab change
  
  // Fonction pour formater la date en texte relatif (il y a X jours, etc.)
  const formatTime = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  };
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  const handleNewPost = async (newPost) => {
    try {
      // Le post sera ajouté à la liste lors du prochain chargement des posts
      // en fonction de la tab active et après approbation par un admin
      
      // Recharger les posts de la tab active
      const url = activeTab === 'general' 
        ? '/api/posts' 
        : `/api/posts/service/${activeTab}`;
      
      const response = await axios.get(url);
      
      const formattedPosts = response.data.map(post => ({
        id: post._id,
        author: post.author,
        role: post.role,
        time: formatTime(post.createdAt),
        content: post.content,
        likes: post.likes || 0,
        comments: post.comments || 0,
        images: post.images || [],
        service: post.service
      }));
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Erreur lors du rechargement des posts:', error);
    }
  };
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Bonjour, {currentUser.name}</span>
              <button 
                onClick={logout}
                style={{ 
                  padding: '5px 10px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
        
        <Header onTabChange={handleTabChange} />
        <Announcement />
        
        {currentUser && <CreatePost onPostCreated={handleNewPost} />}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Chargement des publications...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Aucune publication à afficher dans cette catégorie
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {posts.map(post => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;