import React from 'react';

export default function Card({ children, className = '', title, subtitle, action, footer }) {
  return (
    <div className={`bg-white border border-ove-border rounded-xl shadow-xs overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-ove-border flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-ove-text text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-ove-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center space-x-2">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-ove-soft/60 border-t border-ove-border flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}

