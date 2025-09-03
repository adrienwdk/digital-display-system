import { useState, useCallback, useRef } from 'react';

export const useStableForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const initialValuesRef = useRef(initialValues);
  
  // Mettre à jour la référence si initialValues change
  if (JSON.stringify(initialValues) !== JSON.stringify(initialValuesRef.current)) {
    initialValuesRef.current = initialValues;
  }
  
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
    setValues(initialValuesRef.current);
  }, []);
  
  // Mémoiser setValues pour éviter les re-renders
  const stableSetValues = useCallback((newValues) => {
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
    setValues: stableSetValues
  };
};