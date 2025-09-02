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
  
  const setValues = useCallback((newValues) => {
    setValues(newValues);
  }, []);
  
  return {
    values,
    handleChange,
    setValue,
    reset,
    setValues
  };
};