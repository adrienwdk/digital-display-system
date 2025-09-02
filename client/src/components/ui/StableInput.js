import React, { memo } from 'react';

const StableInput = memo(({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  id,
  name,
  required = false,
  disabled = false,
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      {...props}
    />
  );
});

StableInput.displayName = 'StableInput';
export default StableInput;