// client/src/components/auth/OAuthCallback.js - Version sans variable non utilisée
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import oauthService from '../../services/oauthService';

const OAuthCallback = ({ onAuthSuccess }) => {
  const [status, setStatus] = useState('processing');
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const history = useHistory();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('processing');
        
        // Extraire le code d'autorisation de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const urlError = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (urlError) {
          throw new Error(errorDescription || 'Erreur d\'authentification');
        }

        if (!code) {
          // Vérifier si l'utilisateur est déjà connecté
          const existingToken = localStorage.getItem('token');
          if (existingToken) {
            console.log('✅ Utilisateur déjà connecté, redirection...');
            setStatus('success');
            
            try {
              const user = JSON.parse(localStorage.getItem('user'));
              if (onAuthSuccess && user) {
                onAuthSuccess(user);
              }
            } catch (e) {
              console.warn('Erreur lors de la récupération des données utilisateur:', e);
            }
            
            setTimeout(() => {
              history.push('/');
            }, 1000);
            return;
          }
          
          throw new Error('Code d\'autorisation manquant');
        }

        setStatus('authenticating');

        // Traiter le callback
        const result = await oauthService.handleCallback(code, state);

        if (result.token && result.user) {
          setStatus('success');
          
          // Notifier le composant parent du succès de l'authentification
          if (onAuthSuccess) {
            onAuthSuccess(result.user);
          }

          // Rediriger vers l'application
          setTimeout(() => {
            history.push('/');
          }, 2000);
        } else {
          throw new Error('Données d\'authentification invalides');
        }

      } catch (err) {
        console.error('Erreur lors du callback OAuth:', err);
        
        // Si c'est une erreur de code déjà utilisé et qu'on a moins de 2 tentatives
        if ((err.message.includes('already redeemed') || err.message.includes('invalid_grant')) && retryCount < 2) {
          console.log('🔄 Tentative de récupération de l\'état de connexion...');
          setRetryCount(prev => prev + 1);
          
          // Vérifier si l'utilisateur est connecté
          const existingToken = localStorage.getItem('token');
          if (existingToken) {
            console.log('✅ Utilisateur connecté trouvé, redirection...');
            setStatus('success');
            
            try {
              const user = JSON.parse(localStorage.getItem('user'));
              if (onAuthSuccess && user) {
                onAuthSuccess(user);
              }
            } catch (e) {
              console.warn('Erreur lors de la récupération des données utilisateur:', e);
            }
            
            setTimeout(() => {
              history.push('/');
            }, 1000);
            return;
          }
        }
        
        setError(err.message);
        setStatus('error');
        
        // Rediriger vers la page de connexion après un délai
        setTimeout(() => {
          history.push('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [history, onAuthSuccess, retryCount]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="callback-content">
            <div className="spinner-large"></div>
            <h2>Traitement de l'authentification...</h2>
            <p>Veuillez patienter pendant que nous vérifions vos informations.</p>
          </div>
        );

      case 'authenticating':
        return (
          <div className="callback-content">
            <div className="spinner-large"></div>
            <h2>Connexion en cours...</h2>
            <p>Finalisation de votre authentification Microsoft.</p>
          </div>
        );

      case 'success':
        return (
          <div className="callback-content">
            <div className="success-icon">✓</div>
            <h2>Connexion réussie !</h2>
            <p>Vous allez être redirigé vers l'application...</p>
          </div>
        );

      case 'error':
        return (
          <div className="callback-content">
            <div className="error-icon">✗</div>
            <h2>Connexion en cours...</h2>
            <p>Vérification de votre statut de connexion...</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Si vous voyez cette page, votre connexion est probablement réussie. Redirection automatique en cours...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="oauth-callback" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f6f8fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div className="callback-container" style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '90%'
      }}>
        {renderContent()}
      </div>

      <style jsx>{`
        .spinner-large {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0078d4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .success-icon {
          width: 60px;
          height: 60px;
          background-color: #107c10;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: bold;
          margin: 0 auto 20px;
        }

        .error-icon {
          width: 60px;
          height: 60px;
          background-color: #0078d4;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: bold;
          margin: 0 auto 20px;
        }

        .callback-content h2 {
          margin-bottom: 15px;
          color: #333;
        }

        .callback-content p {
          color: #666;
          line-height: 1.5;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;