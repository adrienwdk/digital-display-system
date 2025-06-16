import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPosts, setPendingPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données en fonction de l'onglet actif
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'pending') {
          const res = await api.get('/posts/pending');
          setPendingPosts(res.data);
        } else if (activeTab === 'users') {
          const res = await api.get('/admin/users');
          setUsers(res.data);
        } else if (activeTab === 'stats') {
          const res = await api.get('/admin/stats');
          setStats(res.data);
        }
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données. Vérifiez vos droits d'administrateur.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  // Fonction pour approuver un post
  const handleApprovePost = async (postId) => {
    try {
      // Suppression de l'assignation de la variable res non utilisée
      await api.put(`/posts/${postId}/approve`);
      // Retirer le post de la liste des posts en attente
      setPendingPosts(pendingPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error("Erreur lors de l'approbation du post:", err);
      setError("Erreur lors de l'approbation du post");
    }
  };

  // Fonction pour rejeter un post
  const handleRejectPost = async (postId) => {
    try {
      // Suppression de l'assignation de la variable res non utilisée
      await api.put(`/posts/${postId}/reject`);
      // Retirer le post de la liste des posts en attente
      setPendingPosts(pendingPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error("Erreur lors du rejet du post:", err);
      setError("Erreur lors du rejet du post");
    }
  };

  // Fonction pour promouvoir un utilisateur au rang d'administrateur
  const handlePromoteUser = async (userId) => {
    try {
      // Utilisation de la réponse pour confirmer la modification
      const response = await api.put(`/admin/users/${userId}/promote`);
      console.log("Promotion réussie:", response.data);
      // Mettre à jour l'utilisateur dans la liste
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isAdmin: true } : user
      ));
    } catch (err) {
      console.error("Erreur lors de la promotion de l'utilisateur:", err);
      setError("Erreur lors de la promotion de l'utilisateur");
    }
  };

  // Fonction pour rétrograder un administrateur
  const handleDemoteUser = async (userId) => {
    try {
      // Utilisation de la réponse pour confirmer la modification
      const response = await api.put(`/admin/users/${userId}/demote`);
      console.log("Rétrogradation réussie:", response.data);
      // Mettre à jour l'utilisateur dans la liste
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isAdmin: false } : user
      ));
    } catch (err) {
      console.error("Erreur lors de la rétrogradation de l'administrateur:", err);
      setError(err.response?.data?.message || "Erreur lors de la rétrogradation");
    }
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Rendu des posts en attente
  const renderPendingPosts = () => {
    if (pendingPosts.length === 0) {
      return <p className="no-items">Aucun post en attente de modération.</p>;
    }

    return pendingPosts.map(post => (
      <div className="admin-card" key={post._id}>
        <div className="card-header">
          <div className="author-info">
            <strong>{post.author}</strong>
            <span className="role">{post.role}</span>
          </div>
          <span className="date">{formatDate(post.createdAt)}</span>
        </div>
        
        <div className="card-content">
          <p>{post.content}</p>
          
          {post.images && post.images.length > 0 && (
            <div className="image-preview">
              {post.images.map((image, index) => (
                <img 
                  key={index} 
                  src={`http://localhost:5000${image}`} 
                  alt={`Contenu attaché ${index}`} 
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="card-actions">
          <button 
            className="approve-button"
            onClick={() => handleApprovePost(post._id)}
          >
            Approuver
          </button>
          <button 
            className="reject-button"
            onClick={() => handleRejectPost(post._id)}
          >
            Rejeter
          </button>
        </div>
      </div>
    ));
  };

  // Rendu de la liste des utilisateurs
  const renderUsers = () => {
    if (users.length === 0) {
      return <p className="no-items">Aucun utilisateur trouvé.</p>;
    }

    return (
      <table className="users-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Date d'inscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{user.email}</td>
              <td>
                {user.role}
                {user.isAdmin && <span className="admin-badge">Admin</span>}
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                {user.isAdmin ? (
                  <button 
                    className="demote-button"
                    onClick={() => handleDemoteUser(user._id)}
                  >
                    Rétrograder
                  </button>
                ) : (
                  <button 
                    className="promote-button"
                    onClick={() => handlePromoteUser(user._id)}
                  >
                    Promouvoir Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Rendu des statistiques
  const renderStats = () => {
    if (!stats) {
      return <p className="no-items">Chargement des statistiques...</p>;
    }

    return (
      <div className="stats-container">
        <div className="stat-card">
          <h3>Utilisateurs</h3>
          <div className="stat-value">{stats.users}</div>
        </div>
        
        <div className="stat-card">
          <h3>Posts</h3>
          <div className="stat-value">{stats.posts.total}</div>
          <div className="stat-breakdown">
            <div className="stat-item">
              <span className="label">En attente:</span>
              <span className="value">{stats.posts.pending}</span>
            </div>
            <div className="stat-item">
              <span className="label">Approuvés:</span>
              <span className="value">{stats.posts.approved}</span>
            </div>
            <div className="stat-item">
              <span className="label">Rejetés:</span>
              <span className="value">{stats.posts.rejected}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Panneau d'administration</h1>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Posts en attente
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistiques
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="admin-content">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <>
            {activeTab === 'pending' && renderPendingPosts()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'stats' && renderStats()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;