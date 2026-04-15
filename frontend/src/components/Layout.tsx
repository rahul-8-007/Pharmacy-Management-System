import { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PackagePlus, HandCoins, ClipboardList, LineChart, LogOut, LayoutDashboard, History, Trash2 } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Add Stock', path: '/add-stock', icon: <PackagePlus size={20} /> },
    { name: 'Sell Tablets', path: '/sell', icon: <HandCoins size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <ClipboardList size={20} /> },
    { name: 'Sales History', path: '/sales-history', icon: <History size={20} /> },
    { name: 'Wastage', path: '/wastage', icon: <Trash2 size={20} /> },
    { name: 'Predictions', path: '/predictions', icon: <LineChart size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white shadow-lg flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider">PharmaSync</h1>
          <p className="text-sm text-teal-100 mt-2">Welcome, {user?.name}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-secondary font-medium' 
                  : 'hover:bg-secondary/50'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-white"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
