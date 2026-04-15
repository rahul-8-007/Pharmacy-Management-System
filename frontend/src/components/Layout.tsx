import { useContext, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  PackagePlus, HandCoins, ClipboardList, LineChart, LogOut,
  LayoutDashboard, History, Trash2, Bell, Search, User
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard',     path: '/',             icon: <LayoutDashboard size={18} /> },
    { name: 'Add Stock',     path: '/add-stock',    icon: <PackagePlus size={18} /> },
    { name: 'Sell Tablets',  path: '/sell',         icon: <HandCoins size={18} /> },
    { name: 'Inventory',     path: '/inventory',    icon: <ClipboardList size={18} /> },
    { name: 'Sales History', path: '/sales-history',icon: <History size={18} /> },
    { name: 'Wastage',       path: '/wastage',      icon: <Trash2 size={18} /> },
    { name: 'Predictions',   path: '/predictions',  icon: <LineChart size={18} /> },
  ];

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-color)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="w-64 flex flex-col flex-shrink-0 border-r"
        style={{
          background: 'var(--sidebar-bg)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
            Clinical Curator
          </h1>
          <span className="text-xs mt-0.5 block" style={{ color: 'var(--text-muted)' }}>
            Pharmacy Management
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: isActive ? 'var(--blue-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--blue-light)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                  }
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--red-light)';
              (e.currentTarget as HTMLElement).style.color = '#dc2626';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="flex items-center justify-between px-10 py-4 border-b flex-shrink-0"
          style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
        >
          {/* Search */}
          <div className="relative" style={{ width: '340px' }}>
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search drugs, batches, or records..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl text-sm outline-none border transition-colors"
              style={{
                background: 'var(--white)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            <button
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Notifications"
            >
              <Bell size={20} />
            </button>

            <div
              className="flex items-center gap-3 pl-5 border-l"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="text-right">
                <p className="text-sm font-600" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  {user?.name ?? 'Pharmacist'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Chief Pharmacist
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'var(--primary)' }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-10 py-8 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
