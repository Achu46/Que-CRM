import React from 'react';

export default function BrandLogo({ size = 'md', showTagline = true, className = '' }) {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Brand Icon Emblem */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-ove-forest via-[#3a5234] to-ove-primary flex items-center justify-center text-white font-bold tracking-wider shadow-sm flex-shrink-0 border border-ove-forest/20`}
      >
        <span className="font-serif italic font-semibold">O</span>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center space-x-1.5">
          <span className={`font-bold tracking-tight text-ove-forest ${titleSizes[size]}`}>
            OVE
          </span>
          <span className={`font-light tracking-wide text-ove-primary ${titleSizes[size]}`}>
            Solutions
          </span>
        </div>
        {showTagline && (
          <span className={`text-ove-muted font-medium tracking-wide -mt-0.5 ${taglineSizes[size]}`}>
            People • Process • Progress
          </span>
        )}
      </div>
    </div>
  );
}

