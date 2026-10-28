import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Contact, 
  Building2, 
  KanbanSquare, 
  CheckSquare, 
  Sparkles,
  LogOut,
  Shield,
  ChevronRight,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import TenantSwitcher from './TenantSwitcher';

export default function Sidebar({
  currentPath = '/dashboard',
  onNavigate,
  user = { name: 'Demo Sales Rep', email: 'rep@ove.com', role: 'admin' },
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  onTenantChanged,
  onOpenOnboarding,
}) {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', path: '/leads', icon: Users, badge: 'New' },
    { label: 'Contacts', path: '/contacts', icon: Contact },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'Deals Pipeline', path: '/deals', icon: KanbanSquare },
    { label: 'Tasks & Follow-ups', path: '/tasks', icon: CheckSquare },
  ];

  const handleNavClick = (path) => {
    if (onNavigate) onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const isSuperAdminActive = currentPath === '/super-admin';

  const sidebarContent = (
    <aside className="w-64 h-full bg-white border-r border-ove-border flex flex-col justify-between select-none">
      {/* Top Branding & Multi-Tenant Switcher */}
      <div className="p-4 border-b border-ove-border space-y-3">
        <BrandLogo size="md" showTagline={true} />
        <TenantSwitcher onTenantChanged={onTenantChanged} />

        {onOpenOnboarding && (
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-ove-soft hover:bg-ove-soft/80 border border-ove-border text-ove-forest transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-ove-primary" />
            <span>+ SaaS Signup / Register</span>
          </button>
        )}
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-ove-muted uppercase">
          CRM Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-ove-soft text-ove-forest border-l-4 border-ove-forest shadow-xs font-semibold pl-2.5'
                  : 'text-ove-muted hover:text-ove-text hover:bg-ove-soft/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-ove-forest' : 'text-ove-muted group-hover:text-ove-text'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-ove-primary" />}
            </button>
          );
        })}

        {/* Platform Governance Section */}
        <div className="pt-4 px-3 pb-2 text-[11px] font-semibold tracking-wider text-ove-muted uppercase">
          Platform Governance
        </div>
        <button
          type="button"
          onClick={() => handleNavClick('/super-admin')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
            isSuperAdminActive
              ? 'bg-ove-forest text-white shadow-xs font-semibold'
              : 'text-ove-muted hover:text-ove-text hover:bg-ove-soft/60'
          }`}
        >
          <div className="flex items-center space-x-3">
            <ShieldCheck
              className={`w-4 h-4 ${isSuperAdminActive ? 'text-white' : 'text-ove-forest'}`}
            />
            <span>Super Admin</span>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            isSuperAdminActive ? 'bg-white/20 text-white' : 'bg-ove-forest/10 text-ove-forest'
          }`}>
            Gov
          </span>
        </button>

        <div className="pt-4 px-3 pb-2 text-[11px] font-semibold tracking-wider text-ove-muted uppercase">
          AI & Multi-Tenant Engine
        </div>
        <div className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-ove-soft to-white border border-ove-border/80 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-ove-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-ove-forest block">Multi-Tenant Ready</span>
            <span className="text-[11px] text-ove-muted">Data strictly scoped by tenant organization.</span>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-ove-border bg-ove-soft/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-ove-forest text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-ove-text truncate">{user.name}</p>
              <div className="flex items-center space-x-1">
                <Shield className="w-2.5 h-2.5 text-ove-primary" />
                <span className="text-[10px] text-ove-muted capitalize">{user.role || 'Sales Rep'}</span>
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Log Out"
              className="p-1.5 rounded-lg text-ove-muted hover:text-ove-error hover:bg-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-ove-forest/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
