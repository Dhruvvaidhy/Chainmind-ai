import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse as WarehouseIcon,
  Boxes,
  ShoppingCart,
  Truck,
  BarChart3,
  Sparkles,
  Bot,
  UserCog,
  Bell,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BrainCircuit,
  Moon,
  Sun,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || localStorage.getItem('theme') === null;
  });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const navSections: NavSection[] = [
    {
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Suppliers', path: '/suppliers', icon: Users },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Warehouses', path: '/warehouses', icon: WarehouseIcon },
        { name: 'Inventory', path: '/inventory', icon: Boxes },
        { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
        { name: 'Shipments', path: '/shipments', icon: Truck },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'AI Insights', path: '/ai-insights', icon: Sparkles },
        { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Users', path: '/users', icon: UserCog, roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN'] },
        { name: 'Notifications', path: '/notifications', icon: Bell },
        { name: 'Audit Logs', path: '/audit-logs', icon: FileSpreadsheet, roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN'] },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const isRoleAllowed = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return user ? allowedRoles.includes(user.role) : false;
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-600/30 flex-shrink-0">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  ChainMind <span className="text-brand-500">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">
                  {user?.organizationCode || 'PLATFORM'}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => {
            const filteredItems = section.items.filter((item) => isRoleAllowed(item.roles));
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {section.title && !collapsed && (
                  <h4 className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </h4>
                )}
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className={`flex items-center justify-between ${collapsed ? 'flex-col gap-3' : ''}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-brand-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.firstName?.[0] || 'U'}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.role?.replace('_', ' ')}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        
        {/* Top Header */}
        <header className="h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Quick Search */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl w-64 text-sm text-slate-400">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, SKU, PO..."
                className="bg-transparent border-none focus:outline-none w-full text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Organization Tag */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/40 text-brand-700 dark:text-brand-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>{user?.organizationName}</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Button */}
            <Link
              to="/notifications"
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500"></span>
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                  {user?.firstName?.[0]}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-sm">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
