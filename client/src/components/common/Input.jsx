import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    required = false,
    id,
    ...props
  },
  ref
) {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-ove-text mb-1.5">
          {label}
          {required && <span className="text-ove-error ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ove-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-ove-text placeholder-ove-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ove-primary/50 focus:border-ove-primary ${
            Icon ? 'pl-9' : ''
          } ${
            error
              ? 'border-ove-error focus:border-ove-error focus:ring-ove-error/30'
              : 'border-ove-border hover:border-ove-secondary/60'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-ove-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-ove-muted">{helperText}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    className = '',
    required = false,
    id,
    children,
    ...props
  },
  ref
) {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-ove-text mb-1.5">
          {label}
          {required && <span className="text-ove-error ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-ove-text transition-colors focus:outline-none focus:ring-2 focus:ring-ove-primary/50 focus:border-ove-primary ${
          error
            ? 'border-ove-error focus:border-ove-error focus:ring-ove-error/30'
            : 'border-ove-border hover:border-ove-secondary/60'
        } ${className}`}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error && <p className="mt-1 text-xs text-ove-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-ove-muted">{helperText}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className = '',
    required = false,
    rows = 3,
    id,
    ...props
  },
  ref
) {
  const textareaId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-ove-text mb-1.5">
          {label}
          {required && <span className="text-ove-error ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-ove-text placeholder-ove-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ove-primary/50 focus:border-ove-primary ${
          error
            ? 'border-ove-error focus:border-ove-error focus:ring-ove-error/30'
            : 'border-ove-border hover:border-ove-secondary/60'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-ove-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-ove-muted">{helperText}</p>}
    </div>
  );
});
