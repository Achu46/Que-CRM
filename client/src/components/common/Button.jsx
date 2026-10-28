import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-ove-forest text-white hover:bg-[#253521] active:bg-[#1d2a1a] focus:ring-ove-primary shadow-sm',
    secondary: 'bg-white border border-ove-border text-ove-text hover:bg-ove-soft hover:border-ove-secondary/40 focus:ring-ove-primary shadow-xs',
    olive: 'bg-ove-primary text-white hover:bg-[#686c3b] active:bg-[#5c6034] focus:ring-ove-forest shadow-sm',
    ghost: 'text-ove-muted hover:text-ove-text hover:bg-ove-soft focus:ring-ove-primary',
    danger: 'bg-ove-error text-white hover:bg-[#a33f3d] focus:ring-ove-error shadow-sm',
    success: 'bg-ove-success text-white hover:bg-[#3d6946] focus:ring-ove-success shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 space-x-1.5',
    md: 'text-sm px-4 py-2 space-x-2',
    lg: 'text-base px-5 py-2.5 space-x-2.5',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
}
