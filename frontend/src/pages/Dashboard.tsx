import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  PackagePlus, HandCoins, ClipboardList, LineChart,
  AlertTriangle, History, Trash2, ArrowRight
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
      {/* Page Header */}
      <div
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
            Morning Overview
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Welcome back, <strong>{user?.name ?? 'Pharmacist'}</strong> — {today}
          </p>
        </div>
        <span className="badge-live">● SYSTEM LIVE</span>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div
          className="mb-8 p-5 rounded-xl border-l-4"
          style={{
            background: 'linear-gradient(to right, #fff, #fef2f2)',
            borderLeftColor: 'var(--red)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} style={{ color: 'var(--red)' }} />
            <h3 className="font-bold text-sm" style={{ color: '#991b1b' }}>
              Action Required — {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
            </h3>
          </div>
          <ul className="space-y-1.5">
            {alerts.slice(0, 5).map((alert, idx) => (
              <li key={idx} className="text-sm" style={{ color: '#b91c1c' }}>
                • {alert.text}
              </li>
            ))}
            {alerts.length > 5 && (
              <li className="text-sm font-medium" style={{ color: '#b91c1c' }}>
                • ...and {alerts.length - 5} more alerts. Check Inventory for full details.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

  {/* LEFT SIDE */}
  <div className="lg:col-span-2 space-y-6">

    {/* Cards */}
    <div className="grid sm:grid-cols-2 gap-6">
      {modules.slice(0,4).map(mod => (
        <Link key={mod.name} to={mod.path} className="action-card">
          <div className="icon-circle" style={{ background: mod.iconBg, color: mod.iconColor }}>
            {mod.icon}
          </div>
          <div>
            <h3 className="text-base font-bold">{mod.name}</h3>
            <p className="text-xs">{mod.desc}</p>
          </div>
          <span className="text-xs font-bold flex items-center gap-1 mt-1">
            {mod.linkLabel} <ArrowRight size={13} />
          </span>
        </Link>
      ))}
    </div>

        {/* Recent Prescriptions */}
        <div className="card">
          <h2 className="font-bold text-lg mb-3">Recent Prescriptions</h2>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-100 rounded-lg">
              <div>
                <p className="font-medium">Jameson Deckard</p>
                <p className="text-sm text-gray-500">Lisinopril 10mg • 30 Tablets</p>
              </div>
              <span className="text-green-600 text-sm">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card">
          <h2 className="font-bold text-lg mb-3">Sales & Demand Trend</h2>
          <div className="h-40 bg-gray-200 rounded-lg flex items-center justify-center">
            Chart goes here
          </div>
        </div>
    
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6">
    
        <div className="card border-l-4 border-red-500">
          <h2 className="font-bold text-lg mb-2">Critical Stock Alerts</h2>
          <p className="text-red-600">Amlodipine 5mg</p>
          <p className="text-sm text-gray-500">Stock Level: 12 Units</p>
          <button className="mt-3 bg-red-600 text-white px-3 py-1 rounded">
            RESTOCK NOW
          </button>
        </div>
    
        <div className="card bg-blue-600 text-white">
          <h2 className="font-bold">Stock Risk</h2>
          <p>Ibuprofen may run out in 48h</p>
          <button className="mt-3 bg-white text-blue-600 px-3 py-1 rounded">
            AUTO-REPLENISH
          </button>
        </div>
    
      </div>
    
    </div>
  );
}
