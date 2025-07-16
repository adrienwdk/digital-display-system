// client/src/components/auth/OAuthCallback.js - Version avec redirection automatique corrigée
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import oauthService from '../../services/oauthService';

const OAuthCallback = ({ onAuthSuccess }) => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const history = useHistory();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('processing');
        console.log('🔍 OAuth Callback - Début du traitement');
        
        // Extraire le code d'autorisation de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const urlError = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        console.log('🔍 OAuth Callback - Paramètres URL:', { code: !!code, state, urlError });

        if (urlError) {
          throw new Error(errorDescription || 'Erreur d\'authentification');
        }

        if (!code) {
          // Vérifier si l'utilisateur est déjà connecté
          const existingToken = localStorage.getItem('token');
          if (existingToken) {
            console.log('✅ Utilisateur déjà connecté, redirection immédiate...');
            setStatus('success');
            
            try {
              const user = JSON.parse(localStorage.getItem('user'));
              if (onAuthSuccess && user) {
                onAuthSuccess(user);
              }
            } catch (e) {
              console.warn('Erreur lors de la récupération des données utilisateur:', e);
            }
            
            // Redirection immédiate
            setTimeout(() => {
              console.log('🔄 Redirection vers la page d\'accueil...');
              window.location.href = '/';
            }, 500);
            return;
          }
          
          throw new Error('Code d\'autorisation manquant');
        }

        setStatus('authenticating');
        console.log('🔍 OAuth Callback - Authentification en cours...');

        // Traiter le callback
        const result = await oauthService.handleCallback(code, state);
        console.log('🔍 OAuth Callback - Résultat:', { hasToken: !!result.token, hasUser: !!result.user });

        if (result.token && result.user) {
          setStatus('success');
          console.log('✅ Authentification réussie');
          
          // Notifier le composant parent du succès de l'authentification
          if (onAuthSuccess) {
            console.log('🔍 Notification du parent...');
            onAuthSuccess(result.user);
          }

          // Nettoyer l'URL en supprimant les paramètres OAuth
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);

          // Redirection automatique vers la page d'accueil
          console.log('🔄 Redirection automatique vers la page d\'accueil...');
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          throw new Error('Données d\'authentification invalides');
        }

      } catch (err) {
        console.error('❌ Erreur lors du callback OAuth:', err);
        
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
            
            // Redirection immédiate
            setTimeout(() => {
              console.log('🔄 Redirection de récupération...');
              window.location.href = '/';
            }, 500);
            return;
          }
        }
        
        setError(err.message);
        setStatus('error');
        
        // En cas d'erreur, rediriger vers la page de connexion après un délai
        setTimeout(() => {
          console.log('🔄 Redirection vers la page d\'accueil après erreur...');
          window.location.href = '/';
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
            <p>Redirection automatique en cours...</p>
            <div className="redirect-info">
              <small>Si la redirection ne fonctionne pas, <a href="/">cliquez ici</a></small>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="callback-content">
            <div className="error-icon">⚠️</div>
            <h2>Vérification en cours...</h2>
            <p>Nous vérifions votre statut de connexion...</p>
            <div className="error-details">
              <small>Redirection automatique dans quelques secondes...</small>
            </div>
            <div className="manual-redirect">
              <a href="/" className="redirect-link">Retourner à l'accueil</a>
            </div>
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
          animation: successPulse 1.5s ease-in-out;
        }

        .error-icon {
          width: 60px;
          height: 60px;
          background-color: #ff8c00;
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
          margin-bottom: 15px;
        }

        .redirect-info {
          margin-top: 20px;
          padding: 10px;
          background-color: #f0f9ff;
          border-radius: 5px;
          border: 1px solid #0078d4;
        }

        .redirect-info small {
          color: #0078d4;
        }

        .redirect-info a {
          color: #0078d4;
          text-decoration: underline;
          font-weight: 600;
        }

        .error-details {
          margin-top: 15px;
          color: #666;
          font-size: 14px;
        }

        .manual-redirect {
          margin-top: 20px;
        }

        .redirect-link {
          display: inline-block;
          padding: 10px 20px;
          background-color: #0078d4;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: background-color 0.2s;
        }

        .redirect-link:hover {
          background-color: #106ebe;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;