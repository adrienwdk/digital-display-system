// client/src/components/admin/AlgorithmStats.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AlgorithmStats = ({ currentUser }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser?.isAdmin) return;
      
      try {
        setLoading(true);
        const response = await api.get('/posts/general-stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [currentUser]);

  if (!currentUser?.isAdmin) return null;
  if (loading) return <div className="algorithm-loading">Chargement des statistiques...</div>;
  if (error) return <div className="algorithm-error">Erreur: {error}</div>;
  if (!stats) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="algorithm-stats-container">
      <div className="algorithm-stats-header">
        <h3>Statistiques de l'algorithme</h3>
        <button 
          className="toggle-details-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Masquer' : 'Détails'}
        </button>
      </div>

      <div className="algorithm-stats-summary">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.monthlyStats.totalPosts}</div>
            <div className="stat-label">Posts ce mois</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.monthlyStats.totalReactions}</div>
            <div className="stat-label">Réactions totales</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats.monthlyStats.avgReactions?.toFixed(1) || 0}</div>
            <div className="stat-label">Moyenne/post</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{stats.monthlyStats.maxReactions}</div>
            <div className="stat-label">Record du mois</div>
          </div>
        </div>
      </div>

      <div className="algorithm-period">
        <span className="period-label">Période analysée :</span>
        <span className="period-dates">
          {formatDate(stats.period.start)} - {formatDate(stats.period.end)}
        </span>
      </div>

      {showDetails && (
        <div className="algorithm-details">
          <div className="algorithm-description">
            <h4>Fonctionnement de l'algorithme</h4>
            <ul className="algorithm-criteria">
              {stats.algorithm.criteria.map((criterion, index) => (
                <li key={index} className="criterion-item">
                  <span className="criterion-number">{index + 1}</span>
                  <span className="criterion-text">{criterion}</span>
                </li>
              ))}
            </ul>
          </div>

          {stats.topPostsOfMonth.length > 0 && (
            <div className="top-posts-section">
              <h4>Top 5 des posts du mois</h4>
              <div className="top-posts-list">
                {stats.topPostsOfMonth.map((post, index) => (
                  <div key={post._id} className="top-post-item">
                    <div className="top-post-rank">#{index + 1}</div>
                    <div className="top-post-content">
                      <div className="top-post-text">{post.content}...</div>
                      <div className="top-post-meta">
                        <span className="post-author">par {post.author}</span>
                        <span className="post-service">• {post.service}</span>
                        <span className="post-reactions">• {post.totalReactions} réactions</span>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="winner-badge">
                        <span role="img" aria-label="Gagnant">👑</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .algorithm-stats-container {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          margin: 1rem 0;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }

        .algorithm-stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .algorithm-stats-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 700;
        }

        .toggle-details-btn {
          padding: 0.5rem 1rem;
          background: var(--primary-light);
          color: var(--primary-color);
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .toggle-details-btn:hover {
          background: var(--primary-color);
          color: white;
        }

        .algorithm-stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
        }

        .stat-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-light);
          border-radius: 50%;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .algorithm-period {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .period-label {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .period-dates {
          color: var(--text-primary);
          font-weight: 500;
        }

        .algorithm-details {
          border-top: 1px solid var(--border-light);
          padding-top: 1.5rem;
          margin-top: 1.5rem;
        }

        .algorithm-description h4,
        .top-posts-section h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
        }

        .algorithm-criteria {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .criterion-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-light);
        }

        .criterion-item:last-child {
          border-bottom: none;
        }

        .criterion-number {
          width: 24px;
          height: 24px;
          background: var(--primary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .criterion-text {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .top-posts-section {
          margin-top: 1.5rem;
        }

        .top-posts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .top-post-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          position: relative;
        }

        .top-post-rank {
          width: 32px;
          height: 32px;
          background: var(--accent-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .top-post-content {
          flex: 1;
          min-width: 0;
        }

        .top-post-text {
          font-size: 0.875rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .top-post-meta {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .post-author {
          font-weight: 600;
        }

        .winner-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 32px;
          height: 32px;
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
          60% {
            transform: translateY(-2px);
          }
        }

        @media (max-width: 768px) {
          .algorithm-stats-summary {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stat-card {
            padding: 0.75rem;
          }
          
          .stat-icon {
            width: 32px;
            height: 32px;
            font-size: 1.25rem;
          }
          
          .top-post-item {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AlgorithmStats;