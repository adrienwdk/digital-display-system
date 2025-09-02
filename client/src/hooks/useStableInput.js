import { useState, useCallback } from 'react';

export const useStableInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = useCallback((e) => {
    const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValue(newValue);
  }, []);
  
  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  return {
    value,
    onChange: handleChange,
    setValue,
    reset
  };
};