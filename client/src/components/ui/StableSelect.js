import React, { memo } from 'react';

const StableSelect = memo(({ 
  value, 
  onChange, 
  children, 
  className = '',
  id,
  name,
  required = false,
  disabled = false,
  ...props 
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={className}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      {...props}
    >
      {children}
    </select>
  );
});

StableSelect.displayName = 'StableSelect';
export default StableSelect;