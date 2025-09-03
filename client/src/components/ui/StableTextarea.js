import React, { memo, forwardRef } from 'react'; // ← Ajouter forwardRef

const StableTextarea = memo(forwardRef(({ 
  placeholder, 
  value, 
  onChange, 
  className = '',
  id,
  name,
  rows = 4,
  required = false,
  disabled = false,
  autoFocus = false,
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      placeholder={placeholder}
      value={value || ''} // ← Assurer que value n'est jamais undefined
      onChange={onChange}
      className={className}
      id={id}
      name={name}
      rows={rows}
      required={required}
      disabled={disabled}
      autoFocus={autoFocus}
      {...props}
    />
  );
}));

StableTextarea.displayName = 'StableTextarea';
export default StableTextarea;