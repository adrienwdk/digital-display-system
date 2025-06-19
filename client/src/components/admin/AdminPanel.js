import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPosts, setPendingPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({ content: '', service: '' });
  const [imageModal, setImageModal] = useState(null);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  
  // États pour la gestion de tous les posts
  const [postsFilter, setPostsFilter] = useState({
    status: 'all',
    service: 'all',
    search: '',
    page: 1
  });
  const [postsPagination, setPostsPagination] = useState(null);

  // Charger les données en fonction de l'onglet actif
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'pending') {
          const res = await api.get('/posts/pending');
          setPendingPosts(res.data);
        } else if (activeTab === 'allPosts') {
          const params = new URLSearchParams({
            page: postsFilter.page,
            limit: 20,
            status: postsFilter.status,
            service: postsFilter.service,
            search: postsFilter.search
          });
          const res = await api.get(`/admin/posts?${params}`);
          setAllPosts(res.data.posts);
          setPostsPagination(res.data.pagination);
        } else if (activeTab === 'pinned') {
          const res = await api.get('/admin/posts/pinned');
          setPinnedPosts(res.data);
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
  }, [activeTab, postsFilter]);

  // Fonction pour approuver un post
  const handleApprovePost = async (postId) => {
    try {
      await api.put(`/posts/${postId}/approve`);
      setPendingPosts(pendingPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error("Erreur lors de l'approbation du post:", err);
      setError("Erreur lors de l'approbation du post");
    }
  };

  // Fonction pour rejeter un post
  const handleRejectPost = async (postId) => {
    const reason = prompt("Raison du rejet (optionnel) :");
    try {
      await api.put(`/posts/${postId}/reject`, { rejectionReason: reason || "Non conforme aux règles" });
      setPendingPosts(pendingPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error("Erreur lors du rejet du post:", err);
      setError("Erreur lors du rejet du post");
    }
  };

  // Fonction pour commencer l'édition d'un post
  const handleEditPost = (post) => {
    setEditingPost(post._id);
    setEditForm({
      content: post.content,
      service: post.service
    });
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveEdit = async (postId) => {
    try {
      await api.put(`/posts/${postId}/edit`, editForm);
      
      // Mettre à jour le post dans la liste locale
      setPendingPosts(pendingPosts.map(post => 
        post._id === postId 
          ? { ...post, content: editForm.content, service: editForm.service }
          : post
      ));
      
      setEditingPost(null);
      setEditForm({ content: '', service: '' });
    } catch (err) {
      console.error("Erreur lors de la modification du post:", err);
      setError("Erreur lors de la modification du post");
    }
  };

  // Fonction pour annuler l'édition
  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditForm({ content: '', service: '' });
  };

  // Fonction pour ouvrir le modal d'image
  const handleImageClick = (images) => {
    setImageModal(images);
  };

  // Fonction pour supprimer définitivement un post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce post ?')) {
      return;
    }
    
    try {
      await api.delete(`/admin/posts/${postId}`);
      
      // Retirer le post de la liste
      if (activeTab === 'pending') {
        setPendingPosts(pendingPosts.filter(post => post._id !== postId));
      } else if (activeTab === 'allPosts') {
        setAllPosts(allPosts.filter(post => post._id !== postId));
      }
      
    } catch (err) {
      console.error("Erreur lors de la suppression du post:", err);
      setError("Erreur lors de la suppression du post");
    }
  };

  // Fonction pour changer le statut d'un post
  const handleChangeStatus = async (postId, newStatus) => {
    try {
      if (newStatus === 'approved') {
        await api.put(`/posts/${postId}/approve`);
      } else if (newStatus === 'rejected') {
        const reason = prompt("Raison du rejet :");
        await api.put(`/posts/${postId}/reject`, { rejectionReason: reason });
      }
      
      // Recharger les données
      if (activeTab === 'allPosts') {
        setPostsFilter({ ...postsFilter, page: 1 });
      }
      
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      setError("Erreur lors du changement de statut");
    }
  };
  const handlePromoteUser = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/promote`);
      console.log("Promotion réussie:", response.data);
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
      const response = await api.put(`/admin/users/${userId}/demote`);
      console.log("Rétrogradation réussie:", response.data);
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

  // Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${path}`;
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
            <span className="service-badge">{post.service}</span>
          </div>
          <span className="date">{formatDate(post.createdAt)}</span>
        </div>
        
        <div className="card-content">
          {editingPost === post._id ? (
            <div className="edit-form">
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="edit-textarea"
                rows="4"
              />
              <select
                value={editForm.service}
                onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                className="edit-select"
              >
                <option value="general">Général</option>
                <option value="rh">RH</option>
                <option value="commerce">Commerce</option>
                <option value="marketing">Marketing</option>
                <option value="informatique">Informatique</option>
                <option value="achat">Achat</option>
                <option value="comptabilité">Comptabilité</option>
                <option value="logistique">Logistique</option>
              </select>
              <div className="edit-actions">
                <button 
                  className="save-button"
                  onClick={() => handleSaveEdit(post._id)}
                >
                  Sauvegarder
                </button>
                <button 
                  className="cancel-button"
                  onClick={handleCancelEdit}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>{post.content}</p>
              
              {post.images && post.images.length > 0 && (
                <div className="image-preview">
                  {post.images.map((image, index) => (
                    <img 
                      key={index} 
                      src={getImageUrl(image)} 
                      alt={`Contenu attaché ${index + 1}`}
                      onClick={() => handleImageClick(post.images)}
                      className="thumbnail-image"
                    />
                  ))}
                </div>
              )}
              
              {post.files && post.files.length > 0 && (
                <div className="file-list">
                  <h4>Fichiers attachés :</h4>
                  {post.files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-icon">📎</span>
                      <span className="file-name">{file.originalName}</span>
                      <span className="file-type">({file.fileType})</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="card-actions">
          <button 
            className="edit-button"
            onClick={() => handleEditPost(post)}
            disabled={editingPost === post._id}
          >
            Modifier
          </button>
          <button 
            className="approve-button"
            onClick={() => handleApprovePost(post._id)}
            disabled={editingPost === post._id}
          >
            Approuver
          </button>
          <button 
            className="reject-button"
            onClick={() => handleRejectPost(post._id)}
            disabled={editingPost === post._id}
          >
            Rejeter
          </button>
        </div>
      </div>
    ));
  };

  // Rendu de tous les posts avec filtres
  const renderAllPosts = () => {
    return (
      <div className="all-posts-section">
        {/* Filtres */}
        <div className="posts-filters">
          <select
            value={postsFilter.status}
            onChange={(e) => setPostsFilter({ ...postsFilter, status: e.target.value, page: 1 })}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
          </select>
          
          <select
            value={postsFilter.service}
            onChange={(e) => setPostsFilter({ ...postsFilter, service: e.target.value, page: 1 })}
            className="filter-select"
          >
            <option value="all">Tous les services</option>
            <option value="general">Général</option>
            <option value="rh">RH</option>
            <option value="commerce">Commerce</option>
            <option value="marketing">Marketing</option>
            <option value="informatique">Informatique</option>
            <option value="achat">Achat</option>
            <option value="comptabilité">Comptabilité</option>
            <option value="logistique">Logistique</option>
          </select>
          
          <input
            type="text"
            placeholder="Rechercher..."
            value={postsFilter.search}
            onChange={(e) => setPostsFilter({ ...postsFilter, search: e.target.value, page: 1 })}
            className="filter-search"
          />
        </div>
        
        {/* Liste des posts */}
        {allPosts.length === 0 ? (
          <p className="no-items">Aucun post trouvé avec ces critères.</p>
        ) : (
          allPosts.map(post => (
            <div className="admin-card" key={post._id}>
              <div className="card-header">
                <div className="author-info">
                  <strong>{post.author}</strong>
                  <span className="role">{post.role}</span>
                  <span className="service-badge">{post.service}</span>
                  <span className={`status-badge status-${post.status}`}>
                    {post.status === 'pending' ? 'En attente' : 
                     post.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                  </span>
                </div>
                <div className="post-meta">
                  <span className="date">{formatDate(post.createdAt)}</span>
                  {post.lastModified && (
                    <span className="modified-info">
                      Modifié le {formatDate(post.lastModified.at)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="card-content">
                {editingPost === post._id ? (
                  <div className="edit-form">
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      className="edit-textarea"
                      rows="4"
                    />
                    <select
                      value={editForm.service}
                      onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                      className="edit-select"
                    >
                      <option value="general">Général</option>
                      <option value="rh">RH</option>
                      <option value="commerce">Commerce</option>
                      <option value="marketing">Marketing</option>
                      <option value="informatique">Informatique</option>
                      <option value="achat">Achat</option>
                      <option value="comptabilité">Comptabilité</option>
                      <option value="logistique">Logistique</option>
                    </select>
                    <div className="edit-actions">
                      <button 
                        className="save-button"
                        onClick={() => handleSaveEdit(post._id)}
                      >
                        Sauvegarder
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={handleCancelEdit}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{post.content}</p>
                    
                    {post.images && post.images.length > 0 && (
                      <div className="image-preview">
                        {post.images.map((image, index) => (
                          <img 
                            key={index} 
                            src={getImageUrl(image)} 
                            alt={`Contenu attaché ${index + 1}`}
                            onClick={() => handleImageClick(post.images)}
                            className="thumbnail-image"
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="card-actions">
                <button 
                  className="edit-button"
                  onClick={() => handleEditPost(post)}
                  disabled={editingPost === post._id}
                >
                  Modifier
                </button>
                
                {post.status === 'pending' && (
                  <>
                    <button 
                      className="approve-button"
                      onClick={() => handleChangeStatus(post._id, 'approved')}
                    >
                      Approuver
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleChangeStatus(post._id, 'rejected')}
                    >
                      Rejeter
                    </button>
                  </>
                )}
                
                {post.status === 'rejected' && (
                  <button 
                    className="approve-button"
                    onClick={() => handleChangeStatus(post._id, 'approved')}
                  >
                    Approuver
                  </button>
                )}
                
                <button 
                  className="delete-button"
                  onClick={() => handleDeletePost(post._id)}
                >
                  Supprimer
                </button>
                <button 
  className={`pin-button ${post.isPinned ? 'pinned' : ''}`}
  onClick={() => handleTogglePin(post._id, post.isPinned, post.pinnedLocations)}
  title={post.isPinned ? 'Désépingler' : 'Épingler'}
>
  {post.isPinned ? '📌 Épinglé' : '📍 Épingler'}
</button>

              </div>
            </div>
          ))
        )}
        
        {/* Pagination */}
        {postsPagination && postsPagination.pages > 1 && (
          <div className="pagination">
            <button
              disabled={postsPagination.page === 1}
              onClick={() => setPostsFilter({ ...postsFilter, page: postsPagination.page - 1 })}
            >
              Précédent
            </button>
            <span>Page {postsPagination.page} sur {postsPagination.pages}</span>
            <button
              disabled={postsPagination.page === postsPagination.pages}
              onClick={() => setPostsFilter({ ...postsFilter, page: postsPagination.page + 1 })}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    );
  };
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
            <th>Service</th>
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
                {user.isOAuthUser && <span className="oauth-badge">OAuth</span>}
              </td>
              <td>{user.service || 'N/A'}</td>
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

  // Modal pour afficher les images en grand
  const renderImageModal = () => {
    if (!imageModal) return null;

    return (
      <div className="image-modal-overlay" onClick={() => setImageModal(null)}>
        <div className="image-modal-content">
          <button className="modal-close" onClick={() => setImageModal(null)}>×</button>
          <div className="image-gallery">
            {imageModal.map((image, index) => (
              <img 
                key={index}
                src={getImageUrl(image)} 
                alt={`Image ${index + 1}`}
                className="modal-image"
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleTogglePin = async (postId, currentPinStatus, currentLocations = []) => {
    try {
      if (currentPinStatus) {
        // Désépingler
        await api.delete(`/admin/posts/${postId}/pin`);
        
        // Mettre à jour localement
        if (activeTab === 'allPosts') {
          setAllPosts(allPosts.map(post => 
            post._id === postId 
              ? { ...post, isPinned: false, pinnedLocations: [] }
              : post
          ));
        } else if (activeTab === 'pending') {
          setPendingPosts(pendingPosts.map(post => 
            post._id === postId 
              ? { ...post, isPinned: false, pinnedLocations: [] }
              : post
          ));
        }
      } else {
        // Demander où épingler
        const locations = await showPinLocationDialog();
        if (!locations) return; // Annulé
        
        await api.put(`/admin/posts/${postId}/pin`, { locations });
        
        // Mettre à jour localement
        if (activeTab === 'allPosts') {
          setAllPosts(allPosts.map(post => 
            post._id === postId 
              ? { ...post, isPinned: true, pinnedLocations: locations }
              : post
          ));
        } else if (activeTab === 'pending') {
          setPendingPosts(pendingPosts.map(post => 
            post._id === postId 
              ? { ...post, isPinned: true, pinnedLocations: locations }
              : post
          ));
        }
      }
    } catch (err) {
      console.error("Erreur lors de la gestion de l'épinglage:", err);
      setError("Erreur lors de la gestion de l'épinglage");
    }
  };
  
  // Fonction pour afficher le dialogue de sélection des locations
  const showPinLocationDialog = () => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'pin-location-modal';
      modal.innerHTML = `
        <div class="pin-location-content">
          <h3>Où souhaitez-vous épingler ce post ?</h3>
          <div class="pin-location-options">
            <label>
              <input type="checkbox" id="pin-general" value="general" checked>
              Section Général
            </label>
            <label>
              <input type="checkbox" id="pin-service" value="service" checked>
              Section du service
            </label>
          </div>
          <div class="pin-location-actions">
            <button id="pin-confirm">Épingler</button>
            <button id="pin-cancel">Annuler</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      document.getElementById('pin-confirm').onclick = () => {
        const locations = [];
        if (document.getElementById('pin-general').checked) locations.push('general');
        if (document.getElementById('pin-service').checked) locations.push('service');
        document.body.removeChild(modal);
        resolve(locations.length > 0 ? locations : null);
      };
      
      document.getElementById('pin-cancel').onclick = () => {
        document.body.removeChild(modal);
        resolve(null);
      };
    });
  };
  
  const renderPinnedPosts = () => {
    if (pinnedPosts.length === 0) {
      return <p className="no-items">Aucun post épinglé pour le moment.</p>;
    }
  
    return pinnedPosts.map(post => (
      <div className="admin-card" key={post._id}>
        <div className="card-header">
          <div className="author-info">
            <strong>{post.author}</strong>
            <span className="role">{post.role}</span>
            <span className="service-badge">{post.service}</span>
            <span className="pinned-badge">
              📌 Épinglé
              <span className="pinned-locations">
                {post.pinnedLocations.map(loc => (
                  <span key={loc} className="location-tag">{loc}</span>
                ))}
              </span>
            </span>
          </div>
          <div className="post-meta">
            <span className="date">Épinglé le {formatDate(post.pinnedAt)}</span>
            {post.pinnedBy && (
              <span className="modified-info">
                par {post.pinnedBy.firstName} {post.pinnedBy.lastName}
              </span>
            )}
          </div>
        </div>
        
        <div className="card-content">
          <p>{post.content}</p>
          
          {post.images && post.images.length > 0 && (
            <div className="image-preview">
              {post.images.map((image, index) => (
                <img 
                  key={index} 
                  src={getImageUrl(image)} 
                  alt={`Contenu attaché ${index + 1}`}
                  onClick={() => handleImageClick(post.images)}
                  className="thumbnail-image"
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="card-actions">
          <button 
            className="edit-button"
            onClick={() => handleEditPost(post)}
          >
            Modifier
          </button>
          <button 
            className="pin-button pinned"
            onClick={() => handleTogglePin(post._id, true, post.pinnedLocations)}
          >
            📌 Désépingler
          </button>
          <button 
            className="delete-button"
            onClick={() => handleDeletePost(post._id)}
          >
            Supprimer
          </button>
          <button 
    className={`tab ${activeTab === 'pinned' ? 'active' : ''}`}
    onClick={() => setActiveTab('pinned')}
  >
    Posts épinglés
  </button>
        </div>
      </div>
    ));
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
          className={`tab ${activeTab === 'allPosts' ? 'active' : ''}`}
          onClick={() => setActiveTab('allPosts')}
        >
          Tous les posts
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
            {activeTab === 'allPosts' && renderAllPosts()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'pinned' && renderPinnedPosts()}
          </>
        )}
      </div>
      
      {renderImageModal()}
    </div>
  );
};


export default AdminPanel;