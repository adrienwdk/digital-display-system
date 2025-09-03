import React, { memo, forwardRef } from 'react'; // ← Ajouter forwardRef

const StableInput = memo(forwardRef(({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  id,
  name,
  required = false,
  disabled = false,
  autoFocus = false,
  ...props 
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value || ''} // ← Assurer que value n'est jamais undefined
      onChange={onChange}
      className={className}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      autoFocus={autoFocus}
      {...props}
    />
  );
}));

StableInput.displayName = 'StableInput';
export default StableInput;