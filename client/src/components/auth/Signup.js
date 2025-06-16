import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Signup = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    service: '', // Champ pour le service
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  
  const { signup } = useContext(AuthContext);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validation basique
    if (Object.values(formData).some(field => !field)) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    // Simulation d'inscription (dans une app réelle, vous feriez un appel API)
    try {
      const userData = {
        id: Date.now(),
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        role: formData.jobTitle,
        service: formData.service, // Envoi du service dans les données utilisateur
        isAdmin: formData.email.includes('admin')
      };
      signup(userData);
    } catch (err) {
      setError('Erreur lors de l\'inscription');
    }
  };
  
  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '0 auto', 
      padding: '30px', 
      backgroundColor: 'white', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Créer un compte</h2>
      
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
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="firstName" style={{ display: 'block', marginBottom: '5px' }}>Prénom</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '5px', 
                border: '1px solid #ddd'
              }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label htmlFor="lastName" style={{ display: 'block', marginBottom: '5px' }}>Nom</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '5px', 
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Adresse e-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="jobTitle" style={{ display: 'block', marginBottom: '5px' }}>Poste dans l'entreprise</label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd'
            }}
          />
        </div>
        
        {/* Champ pour le service/département - corrigé */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="service" style={{ display: 'block', marginBottom: '5px' }}>Service</label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd'
            }}
            required
          >
            <option value="">Sélectionnez votre service</option>
            <option value="general">Général</option>
            <option value="rh">RH</option>
            <option value="commerce">Commerce</option>
            <option value="marketing">Marketing</option>
            <option value="informatique">Informatique</option>
            <option value="achat">Achat</option>
            <option value="comptabilité">Compta</option>
            <option value="logistique">Logistique</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
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
          S'inscrire
        </button>
      </form>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Déjà un compte ? <span 
          onClick={onToggleForm} 
          style={{ 
            color: '#ff5c39', 
            cursor: 'pointer', 
            textDecoration: 'underline' 
          }}
        >
          Se connecter
        </span></p>
      </div>
    </div>
  );
};

export default Signup;