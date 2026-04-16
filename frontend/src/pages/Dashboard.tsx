import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  PackagePlus, HandCoins, ClipboardList, LineChart,
  History, Trash2
} from 'lucide-react';
import api from '../lib/api';

interface Medicine {
  id: string;
  name: string;
  batchNo: string;
  quantityAvailable: number;
  expiryDate: string;
}

interface AlertItem {
  text: string;
  type: 'low' | 'expiry' | 'expired';
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/medicines');
        const inventory: Medicine[] = res.data;
        const newAlerts: AlertItem[] = [];

        inventory.forEach(med => {
          if (med.quantityAvailable < 20) {
            newAlerts.push({
              text: `Low Stock: ${med.name} (Batch: ${med.batchNo}) — ${med.quantityAvailable} units left.`,
              type: 'low',
            });
          }
          const daysToExpiry = (new Date(med.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
          if (daysToExpiry <= 0) {
            newAlerts.push({
              text: `Expired: ${med.name} (Batch: ${med.batchNo}) has been removed from active inventory.`,
              type: 'expired',
            });
          } else if (daysToExpiry < 30) {
            newAlerts.push({
              text: `Expiry Alert: ${med.name} (Batch: ${med.batchNo}) expires in ${Math.ceil(daysToExpiry)} days.`,
              type: 'expiry',
            });
          }
        });

        setAlerts(newAlerts);
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      }
    };
    fetchAlerts();
  }, []);

  const modules = [
    {
      name: 'Add New Stock',
      path: '/add-stock',
      icon: <PackagePlus size={22} />,
      desc: 'Update inventory with fresh batches.',
      linkLabel: 'GO TO INTAKE',
      iconBg: 'var(--primary)',
      iconColor: '#fff',
      linkColor: 'var(--primary)',
    },
    {
      name: 'Sell Tablets',
      path: '/sell',
      icon: <HandCoins size={22} />,
      desc: 'Process client dispensing and billing.',
      linkLabel: 'OPEN TERMINAL',
      iconBg: 'var(--green-light)',
      iconColor: '#16a34a',
      linkColor: '#16a34a',
    },
    {
      name: 'Sales History',
      path: '/sales-history',
      icon: <History size={22} />,
      desc: 'Review historical operations and transaction logs.',
      linkLabel: 'VIEW RECORDS',
      iconBg: 'var(--blue-light)',
      iconColor: 'var(--primary)',
      linkColor: 'var(--primary)',
    },
    {
      name: 'View Wastage',
      path: '/wastage',
      icon: <Trash2 size={22} />,
      desc: 'Inspect completely discarded inventory batches.',
      linkLabel: 'VIEW WASTAGE',
      iconBg: 'var(--red-light)',
      iconColor: '#dc2626',
      linkColor: '#dc2626',
    },
    {
      name: 'View Inventory',
      path: '/inventory',
      icon: <ClipboardList size={22} />,
      desc: 'Search and filter active medicine stock.',
      linkLabel: 'FULL CATALOG',
      iconBg: 'var(--blue-light)',
      iconColor: 'var(--primary)',
      linkColor: 'var(--primary)',
    },
    {
      name: 'View Predictions',
      path: '/predictions',
      icon: <LineChart size={22} />,
      desc: 'AI-driven demand forecasting.',
      linkLabel: 'ANALYZE DATA',
      iconBg: 'var(--yellow-light)',
      iconColor: '#d97706',
      linkColor: '#d97706',
    },
  ];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
  <div className="fade-in">

    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Morning Overview</h1>
        <p className="mt-1 text-sm">
          Welcome back, <strong>{user?.name ?? 'Pharmacist'}</strong> — {today}
        </p>
      </div>
      <span className="badge-live">● SYSTEM LIVE</span>
    </div>

    {/* Alerts */}
    {alerts.length > 0 && (
      <div className="mb-8 p-5 rounded-xl border-l-4 border-red-500">
        <h3 className="font-bold text-sm mb-2">
          Alerts — {alerts.length}
        </h3>
        <ul>
          {alerts.slice(0, 5).map((alert, idx) => (
            <li key={idx}>• {alert.text}</li>
          ))}
        </ul>
      </div>
    )}

    {/* NEW LAYOUT */}
    <div className="grid lg:grid-cols-3 gap-6">

      {/* LEFT */}
      <div className="lg:col-span-2 space-y-6">

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {modules.slice(0,4).map(mod => (
            <Link key={mod.name} to={mod.path} className="action-card">
              <div className="icon-circle">
                {mod.icon}
              </div>
              <div>
                <h3 className="font-bold">{mod.name}</h3>
                <p className="text-sm">{mod.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent */}
        <div className="card">
          <h2 className="font-bold text-lg mb-3">Recent Prescriptions</h2>
          <p className="text-sm text-gray-500">Demo content</p>
        </div>

        {/* Chart */}
        <div className="card">
          <h2 className="font-bold text-lg mb-3">Sales Trend</h2>
          <div className="h-40 bg-gray-200 rounded-lg flex items-center justify-center">
            Chart
          </div>
        </div>

      </div>

      {/* RIGHT */}
      <div className="space-y-6">

        <div className="card border-l-4 border-red-500">
          <h2 className="font-bold">Critical Alerts</h2>
          <p className="text-sm">Low stock detected</p>
        </div>

        <div className="card bg-blue-600 text-white">
          <h2 className="font-bold">Prediction</h2>
          <p>Stock risk detected</p>
        </div>

      </div>

    </div>

  </div>
);
}
