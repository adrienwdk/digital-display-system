import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Login = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validation basique
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    // Simulation de connexion (dans une app réelle, vous feriez un appel API)
    try {
      const userData = {
        id: 1,
        email,
        name: 'Utilisateur Test',
        role: 'Chargé de projet',
        isAdmin: email.includes('admin')
      };
      login(userData);
    } catch (err) {
      setError('Identifiants incorrects');
    }
  };
  
  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '30px', 
      backgroundColor: 'white', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Connexion</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd'
            }}
          />
        </div>
        
        <button
          type="submit"
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#ff5c39', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Se connecter
        </button>
      </form>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Pas encore de compte ? <span 
          onClick={onToggleForm} 
          style={{ 
            color: '#ff5c39', 
            cursor: 'pointer', 
            textDecoration: 'underline' 
          }}
        >
          S'inscrire
        </span></p>
      </div>
    </div>
  );
};

export default Login;
