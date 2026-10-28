import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function AppShell({
  children,
  title = 'Dashboard',
  subtitle,
  currentPath = '/dashboard',
  onNavigate,
  user,
  onLogout,
  showQuickAction,
  quickActionLabel,
  onQuickAction,
  searchValue,
  onSearchChange,
  onTenantChanged,
  onOpenOnboarding,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ove-soft flex flex-row">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onTenantChanged={onTenantChanged}
        onOpenOnboarding={onOpenOnboarding}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          showQuickAction={showQuickAction}
          quickActionLabel={quickActionLabel}
          onQuickAction={onQuickAction}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
