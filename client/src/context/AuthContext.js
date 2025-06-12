import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté (localStorage)
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = (userData) => {
    // Dans une application réelle, vous enverriez une requête à votre API
    // et stockeriez le token JWT retourné
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  // Fonction de déconnexion
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  // Fonction d'inscription
  const signup = (userData) => {
    // Dans une application réelle, vous enverriez une requête à votre API
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
