import React, { memo } from 'react';

const StableTextarea = memo(({ 
  placeholder, 
  value, 
  onChange, 
  className = '',
  id,
  name,
  rows = 4,
  required = false,
  disabled = false,
  ...props 
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      id={id}
      name={name}
      rows={rows}
      required={required}
      disabled={disabled}
      {...props}
    />
  );
});

StableTextarea.displayName = 'StableTextarea';
export default StableTextarea;