// client/src/components/auth/OAuthLogin.js
import React, { useState } from 'react';
import oauthService from '../../services/oauthService';

const OAuthLogin = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthLogin = async () => {
    setIsLoading(true);
    try {
      // Obtenir l'URL d'autorisation
      const authUrl = await oauthService.initiateOAuth();
      
      // Rediriger vers Microsoft pour l'authentification
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erreur OAuth:', error);
      if (onError) {
        onError(error.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="oauth-login">
      <button
        onClick={handleOAuthLogin}
        disabled={isLoading}
        className="oauth-button"
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '15px'
        }}
      >
        {isLoading ? (
          <>
            <div className="spinner" style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Connexion en cours...
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
            </svg>
            Se connecter avec Microsoft
          </>
        )}
      </button>
      
      <div className="divider" style={{
        display: 'flex',
        alignItems: 'center',
        margin: '20px 0',
        fontSize: '14px',
        color: '#666'
      }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
        <span style={{ padding: '0 15px' }}>OU</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
      </div>
    </div>
  );
};

export default OAuthLogin;