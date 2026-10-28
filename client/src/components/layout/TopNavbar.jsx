import React from 'react';
import { Menu, Search, Bell, Plus, Sparkles } from 'lucide-react';
import Button from '../common/Button';

export default function TopNavbar({
  title = 'Dashboard',
  subtitle,
  onOpenMobileMenu,
  onQuickAction,
  searchValue = '',
  onSearchChange,
  quickActionLabel = 'Quick Action',
  showQuickAction = false,
}) {
  return (
    <header className="h-16 bg-white border-b border-ove-border sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Header */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-ove-muted hover:text-ove-text hover:bg-ove-soft"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-ove-text tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-ove-muted hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Middle/Right: Global Search & Quick Actions */}
      <div className="flex items-center space-x-3">
        {onSearchChange && (
          <div className="relative hidden md:block w-64 lg:w-80">
            <Search className="w-4 h-4 text-ove-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads, deals, contacts..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-ove-soft border border-ove-border rounded-lg text-ove-text placeholder-ove-muted/70 focus:outline-none focus:ring-2 focus:ring-ove-primary/50 focus:border-ove-primary transition-all"
            />
          </div>
        )}

        {showQuickAction && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onQuickAction}
            className="shadow-xs"
          >
            {quickActionLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
