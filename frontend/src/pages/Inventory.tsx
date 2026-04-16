import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, AlertTriangle, CalendarRange, Filter, FileDown, Pill, Truck, Users } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  batchNo: string;
  quantityAvailable: number;
  expiryDate: string;
}

interface StockHistory {
  id: string;
  quantityAdded: number;
  addedAt: string;
  medicine: {
    name: string;
    dosage: string;
    manufacturer: string;
  };
}

export default function Inventory() {
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [replenishments, setReplenishments] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, histRes] = await Promise.all([
        api.get('/medicines'),
        api.get('/stock/history')
      ]);
      setInventory(invRes.data);
      setReplenishments(histRes.data.slice(0, 2)); // Image shows 2
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (qty: number) => qty < 20 && qty > 0;
  const isOutOfStock = (qty: number) => qty === 0;
  const getDaysToExpiry = (dateStr: string) => {
    if (!dateStr) return 999;
    const d = new Date(dateStr);
    return (d.getTime() - Date.now()) / (1000 * 3600 * 24);
  };
  const isNearExpiry = (days: number) => days > 0 && days < 30;

  const filteredInventory = inventory.filter(med => {
    const matchesSearch =
      (med.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.batchNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalStockCount = inventory.reduce((acc, med) => acc + med.quantityAvailable, 0);
  const criticalCount = inventory.filter(med => isLowStock(med.quantityAvailable) || isOutOfStock(med.quantityAvailable)).length;
  const expiringCount = inventory.filter(med => isNearExpiry(getDaysToExpiry(med.expiryDate))).length;

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fade-in max-w-7xl mx-auto text-slate-800 font-sans pb-10">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Inventory Control</h1>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {/* Total Stock */}
         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
               <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Pill size={20} />
               </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Stock</span>
            </div>
            <div>
               <h2 className="text-4xl font-bold text-slate-900">{totalStockCount.toLocaleString()}</h2>
               <p className="text-sm font-semibold text-green-600 mt-2 flex items-center gap-1">
                  <span className="text-green-500">↗ +12%</span> <span className="text-slate-500 font-normal">vs last month</span>
               </p>
            </div>
         </div>

         {/* Critical Low */}
         <div className="bg-white rounded-2xl border-l-4 border-l-red-600 border-y border-r border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
               <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={20} fill="currentColor" className="text-red-600" />
               </div>
               <span className="text-[10px] font-bold text-red-800 uppercase tracking-widest">Critical Low</span>
            </div>
            <div className="relative z-10">
               <h2 className="text-4xl font-bold text-slate-900">{criticalCount}</h2>
               <p className="text-sm text-slate-600 mt-2">Requires immediate restock</p>
            </div>
         </div>

         {/* Expiring Soon */}
         <div className="bg-white rounded-2xl border-l-4 border-l-amber-500 border-y border-r border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
               <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CalendarRange size={20} />
               </div>
               <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Expiring Soon</span>
            </div>
            <div>
               <h2 className="text-4xl font-bold text-slate-900">{expiringCount}</h2>
               <p className="text-sm text-slate-600 mt-2">Within 30-day window</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Main Inventory Table Column */}
         <div className="col-span-1 lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
               
               <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                     <h3 className="text-xl font-bold text-slate-900">Stock Inventory</h3>
                     <p className="text-xs text-slate-500 mt-1">Real-time tracking of pharmaceutical assets</p>
                  </div>
                  <div className="flex gap-3">
                     <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-100 transition-colors">
                        <Filter size={16} /> Filters
                     </button>
                     <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-bold text-sm rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
                        <FileDown size={16} /> Export PDF
                     </button>
                  </div>
               </div>

               <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                           {['Tablet Name', 'Dosage', 'Batch ID', 'Expiry Date', 'Available Count', 'Status'].map(h => (
                           <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {h}
                           </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {loading ? (
                           <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                 Loading inventory data...
                              </td>
                           </tr>
                        ) : filteredInventory.map(med => {
                           const days = Math.ceil(getDaysToExpiry(med.expiryDate));
                           const isNear = isNearExpiry(days);
                           const isLow = isLowStock(med.quantityAvailable);
                           const isOut = isOutOfStock(med.quantityAvailable);
                           const isExpired = days <= 0;

                           let statusPill = <span className="pill-status pill-optimal bg-green-100 text-green-700"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> OPTIMAL</span>;
                           if (isOut) statusPill = <span className="pill-status pill-critical bg-slate-100 text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> OUT OF STOCK</span>;
                           else if (isExpired) statusPill = <span className="pill-status pill-critical"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> EXPIRED</span>;
                           else if (isLow) statusPill = <span className="pill-status pill-critical"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LOW STOCK</span>;
                           else if (isNear) statusPill = <span className="pill-status pill-warning"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> EXPIRING</span>;

                           return (
                              <tr key={med.id} className="hover:bg-slate-50/50 transition-colors group">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                          <Pill size={14} />
                                       </div>
                                       <div>
                                          <p className="font-bold text-slate-900 text-sm">{med.name}</p>
                                          <p className="text-[10px] text-slate-500 mt-0.5">Antibiotic / General</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-sm font-semibold text-slate-700">{med.dosage}</td>
                                 <td className="px-6 py-4 text-xs text-slate-500 font-mono tracking-wide">{med.batchNo}</td>
                                 <td className="px-6 py-4">
                                    <p className={`text-sm font-semibold ${isExpired || isNear ? 'text-amber-600' : 'text-slate-700'}`}>
                                       {new Date(med.expiryDate).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric'})}
                                    </p>
                                    {(isNear || isExpired) && (
                                       <p className="text-[10px] font-bold text-amber-500 mt-0.5">{isExpired ? 'Expired' : `${days} Days Left`}</p>
                                    )}
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <p className={`text-lg font-bold ${(isLow || isOut) ? 'text-red-600' : 'text-slate-900'}`}>{med.quantityAvailable}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Min: 100</p>
                                 </td>
                                 <td className="px-6 py-4">
                                    {statusPill}
                                 </td>
                              </tr>
                           )
                        })}
                     </tbody>
                  </table>
               </div>

               <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <p>Showing 1 to {filteredInventory.length} of {inventory.length} medicinal products</p>
                  <div className="flex gap-1">
                     <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50">‹</button>
                     <button className="w-8 h-8 rounded bg-blue-700 text-white font-bold flex items-center justify-center">1</button>
                     <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50">2</button>
                     <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50">3</button>
                     <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50">›</button>
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar */}
         <div className="col-span-1 flex flex-col gap-6">
            
            {/* Recent Replenishments */}
            <div>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Replenishments</h3>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-800">View Ledger</button>
               </div>
               
               <div className="flex flex-col gap-3">
                  {replenishments.map((r, i) => (
                     <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3 shadow-sm hover:border-slate-300 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                           <Truck size={18} className="text-slate-500" />
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start mb-1.5">
                              <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{r.medicine.manufacturer || 'Direct Manufacturer'}</h4>
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded ml-2 shrink-0">Received</span>
                           </div>
                           <p className="text-[10px] text-slate-500 mb-2 leading-tight">
                              {r.medicine.name} ({r.quantityAdded} units)
                           </p>
                           <p className="text-[10px] font-bold text-slate-400">{formatTime(r.addedAt)}</p>
                        </div>
                     </div>
                  ))}
                  {replenishments.length === 0 && (
                     <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-500 italic border border-slate-100">No recent activity.</div>
                  )}
               </div>
            </div>



         </div>
      </div>
    </div>
  );
}
