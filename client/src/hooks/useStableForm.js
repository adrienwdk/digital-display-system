import { useState, useCallback } from 'react';

export const useStableForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  
  const handleChange = useCallback((name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);
  
  // CORRECTION: Renommer la fonction pour éviter le conflit avec setValues de React
  const updateValues = useCallback((newValues) => {
    if (typeof newValues === 'function') {
      setValues(newValues);
    } else {
      setValues(newValues);
    }
  }, []);
  
  return {
    values,
    handleChange,
    setValue,
    reset,
    setValues: updateValues // Exposer sous le nom setValues pour la compatibilité
  };
};