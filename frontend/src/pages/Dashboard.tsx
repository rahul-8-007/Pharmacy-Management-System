import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PackagePlus, HandCoins, ClipboardList, LineChart,
  ArrowRight, AlertTriangle
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
  medicine: Medicine;
  type: 'low' | 'expiry' | 'expired';
  daysToExpiry?: number;
}

interface SaleHistory {
  id: string;
  quantitySold: number;
  soldAt: string;
  medicine: {
    name: string;
    dosage: string;
  };
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [recentSales, setRecentSales] = useState<SaleHistory[]>([]);
  const [trends, setTrends] = useState<{ date: string; sales: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medicinesRes, salesRes, predictionsRes] = await Promise.all([
          api.get('/medicines'),
          api.get('/sales/history'),
          api.get('/predictions')
        ]);

        const inventory: Medicine[] = medicinesRes.data;
        const newAlerts: AlertItem[] = [];

        inventory.forEach(med => {
          if (med.quantityAvailable < 20 && med.quantityAvailable > 0) {
            newAlerts.push({ medicine: med, type: 'low' });
          }
          const daysToExpiry = (new Date(med.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
          if (daysToExpiry <= 0 && med.quantityAvailable > 0) {
            newAlerts.push({ medicine: med, type: 'expired', daysToExpiry });
          } else if (daysToExpiry < 30 && med.quantityAvailable > 0) {
            newAlerts.push({ medicine: med, type: 'expiry', daysToExpiry });
          }
        });
        setAlerts(newAlerts);

        // Recent sales limited to 3
        setRecentSales(salesRes.data.slice(0, 3));
        
        // Grab last 7 days of trends
        const allTrends = predictionsRes.data.trends || [];
        const last7 = allTrends.slice(-7);
        setTrends(last7);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchData();
  }, []);

  const modules = [
    {
      name: 'Add New Stock',
      path: '/add-stock',
      icon: <PackagePlus size={24} />,
      desc: 'Update inventory with fresh batches.',
      linkLabel: 'GO TO INTAKE',
      iconBg: 'bg-blue-50 text-blue-600',
      textColor: 'text-blue-600'
    },
    {
      name: 'Sell Tablets',
      path: '/sell',
      icon: <HandCoins size={24} />,
      desc: 'Process client dispensing and billing.',
      linkLabel: 'OPEN TERMINAL',
      iconBg: 'bg-green-50 text-green-600',
      textColor: 'text-green-600'
    },
    {
      name: 'View Inventory',
      path: '/inventory',
      icon: <ClipboardList size={24} />,
      desc: 'Check availability and expiry dates.',
      linkLabel: 'FULL CATALOG',
      iconBg: 'bg-indigo-50 text-indigo-600',
      textColor: 'text-indigo-600'
    },
    {
      name: 'View Predictions',
      path: '/predictions',
      icon: <LineChart size={24} />,
      desc: 'AI-driven demand forecasting.',
      linkLabel: 'ANALYZE DATA',
      iconBg: 'bg-rose-50 text-rose-600',
      textColor: 'text-rose-600'
    },
  ];

  const lowStockAlerts = alerts.filter(a => a.type === 'low').slice(0, 2);
  const expiryAlerts = alerts.filter(a => Math.ceil(a.daysToExpiry ?? 99) <= 30 && a.type !== 'low').slice(0, 2);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
  const formatTimeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  };

  // Safe max for building trend bars visually
  const maxSales = trends.length ? Math.max(...trends.map(t => t.sales), 10) : 100;
  
  // Fill 7 empty elements if we don't have enough data
  const chartBars = [...trends];
  while (chartBars.length < 7) {
    chartBars.unshift({ date: '', sales: 0 });
  }

  const daysLabel = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="fade-in max-w-7xl mx-auto text-slate-800 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Morning Overview</h1>
          <p className="text-sm text-slate-500">
            Operational health and rapid actions for today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-wider shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-600"></span> SYSTEM LIVE
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {modules.map(mod => (
          <Link
            key={mod.name}
            to={mod.path}
            className="flex flex-col bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${mod.iconBg}`}>
              {mod.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{mod.name}</h3>
            <p className="text-sm text-slate-500 flex-1 mb-6">{mod.desc}</p>
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mt-auto ${mod.textColor}`}>
              {mod.linkLabel} <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        
        {/* Left Column */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
          
          {/* Recent Prescriptions / Sales */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Recent Prescriptions (Sales)</h2>
              <Link to="/sales-history" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </div>
            
            <div className="flex flex-col gap-3">
              {recentSales.map((sale, idx) => (
                <div key={sale.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-slate-300 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {getInitials(sale.medicine.name)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{sale.medicine.name}</h4>
                    <p className="text-xs text-slate-500">{sale.medicine.dosage} • {sale.quantitySold} Dispensed</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                       idx === 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {idx === 0 ? 'ACTIVE' : 'COMPLETED'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatTimeAgo(sale.soldAt)}
                    </span>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-6 border rounded-xl bg-slate-50 border-dashed">
                  No recent sales records found.
                </div>
              )}
            </div>
          </div>

          {/* Sales & Demand Trend */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Sales & Demand Trend</h3>
                <p className="text-xs text-slate-500">Real-time prescription flow analytics</p>
              </div>
              <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-600 outline-none">
                <option>Last 7 Days</option>
              </select>
            </div>
            
            <div className="h-48 flex flex-col justify-end">
              <div className="flex items-end justify-around h-40 pb-2 border-b border-slate-100">
                {chartBars.map((item, i) => {
                  const isToday = i === 6;
                  const heightPercent = Math.max((item.sales / maxSales) * 100, 5); // min 5% to show bar
                  return (
                    <div key={i} className={`w-[10%] rounded-t-sm transition-all relative group ${isToday ? 'bg-blue-600 cursor-pointer' : 'bg-slate-100 hover:bg-slate-200'}`} style={{ height: `${item.sales === 0 ? 5 : heightPercent}%` }}>
                      {isToday && (
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 text-[10px] rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            TODAY
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-around pt-3 text-[10px] font-bold text-slate-400 tracking-wider">
                 {daysLabel.map(day => <span key={day}>{day}</span>)}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="col-span-1 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Critical Stock Alerts</h2>

          {lowStockAlerts.length === 0 && expiryAlerts.length === 0 && (
            <p className="text-sm text-slate-500 italic mb-4">No critical alerts right now.</p>
          )}
          
          {/* Dynamic Critical Alert Cards (Mapped from low stock data) */}
          {lowStockAlerts.map((alert, idx) => (
            <div key={`low-${idx}`} className="bg-red-50 border border-red-100 rounded-xl p-6 relative overflow-hidden group mb-2">
              <h3 className="text-base font-bold text-red-800 mb-1 relative z-10">{alert.medicine.name}</h3>
              <p className="text-xs text-red-600 opacity-80 mb-5 relative z-10">Stock Level: {alert.medicine.quantityAvailable} Units</p>
              
              <div className="h-1.5 bg-red-200 rounded-full w-full relative z-10 overflow-hidden">
                <div className="bg-red-700 h-full rounded-full" style={{ width: `${Math.min((alert.medicine.quantityAvailable / 20) * 100, 100)}%` }}></div>
              </div>
              
              <button className="w-full mt-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-sm rounded-lg transition-colors relative z-10 shadow-sm">
                RESTOCK NOW
              </button>
              <AlertTriangle className="absolute -bottom-6 -right-6 text-red-600 opacity-5 group-hover:scale-110 transition-transform duration-500" size={120} />
            </div>
          ))}

          {/* Dynamic Warning Alert Cards (Mapped from expiry data) */}
          {expiryAlerts.map((alert, idx) => (
            <div key={`exp-${idx}`} className="bg-white border border-slate-200 rounded-xl p-6 mb-2 flex flex-col">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {alert.type === 'expired' ? 'Expired' : 'Upcoming Expiry'}
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                {alert.medicine.name} Batch #{alert.medicine.batchNo} - {alert.type === 'expired' ? 'Expired' : `${Math.ceil(alert.daysToExpiry!)} days left`}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{alert.medicine.quantityAvailable} UNITS</span>
                <button className="text-xs font-bold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors">
                  {alert.type === 'expired' ? 'DISCARD' : 'DISCOUNT SALE'}
                </button>
              </div>
            </div>
          ))}

          {/* AI Banner */}
          <div className="mt-2 glass-banner text-white rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
            
            <span className="inline-block bg-white/20 text-blue-50 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider mb-5">
              AI PREDICTION
            </span>
            
            <h2 className="text-xl font-bold leading-tight mb-6 relative z-10">
              Stock out risk for<br/>{lowStockAlerts[0]?.medicine.name || 'Ibuprofen'} in 48h.
            </h2>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  <div className="w-6 h-6 rounded-full bg-white text-blue-700 flex items-center justify-center text-[10px] font-bold border border-blue-100 shadow-sm z-20">A</div>
                  <div className="w-6 h-6 rounded-full bg-white text-blue-700 flex items-center justify-center text-[10px] font-bold border border-blue-100 shadow-sm -ml-2 z-10">B</div>
                </div>
                <span className="text-xs font-medium text-blue-50">3 suppliers available now</span>
              </div>
              <button className="w-full py-2.5 bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm rounded-lg transition-colors shadow">
                AUTO-REPLENISH
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
