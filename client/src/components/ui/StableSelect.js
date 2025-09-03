import React, { memo, forwardRef } from 'react'; // ← Ajouter forwardRef

const StableSelect = memo(forwardRef(({ 
  value, 
  onChange, 
  children, 
  className = '',
  id,
  name,
  required = false,
  disabled = false,
  ...props 
}, ref) => {
  return (
    <select
      ref={ref}
      value={value || ''} // ← Assurer que value n'est jamais undefined
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
}));

StableSelect.displayName = 'StableSelect';
export default StableSelect;