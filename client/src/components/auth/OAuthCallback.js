// client/src/components/auth/OAuthCallback.js
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import oauthService from '../../services/oauthService';

const OAuthCallback = ({ onAuthSuccess }) => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extraire le code d'autorisation de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || 'Erreur d\'authentification');
        }

        if (!code) {
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
        setError(err.message);
        setStatus('error');
        
        // Rediriger vers la page de connexion après un délai
        setTimeout(() => {
          history.push('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [history, onAuthSuccess]);

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
            <h2>Erreur d'authentification</h2>
            <p>{error}</p>
            <p>Vous allez être redirigé vers la page principale...</p>
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
          background-color: #d13438;
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