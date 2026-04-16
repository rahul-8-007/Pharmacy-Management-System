import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';

interface PredictionItem {
  medicineId: string;
  name: string;
  dosage: string;
  soldLast30Days: number;
  currentStock: number;
  nextMonthEstimate: number;
  status: string;
}

export default function Predictions() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [_trends, setTrends] = useState<{ date: string; sales: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res: any = await api.get('/predictions');
        setPredictions(res.data.predictions);
        setTrends(res.data.trends);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center h-64 opacity-50">
         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
         Loading analytics...
      </div>
     )
  }

  return (
    <div className="fade-in max-w-7xl mx-auto text-slate-800 font-sans pb-10">
      <p className="text-sm text-slate-500 mb-6">
        AI-driven next month stock estimates based on sales trends.
      </p>

      {/* Sales Trend Chart Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Sales Trend (Last 30 Days)</h3>
            <p className="text-xs text-slate-500">Daily sales volume across all medicines</p>
          </div>
        </div>

        <div className="h-64 mt-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
              />
              <Area type="monotone" dataKey="sales" stroke="#1d4ed8" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Next Month Reorder Requirements Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 leading-tight">Next Month Reorder Requirements</h3>
          <p className="text-xs text-slate-500 mt-0.5">Based on your last 30 days of sales velocity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100/80">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Medicine Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Sold Last 30D</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Current Stock</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Est. Requirement</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {predictions.map((item) => (
                <tr key={item.medicineId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-slate-400 ml-1 text-xs">({item.dosage})</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">
                    {item.soldLast30Days}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">
                    {item.currentStock}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xl font-bold text-blue-800">{item.nextMonthEstimate}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                        item.status === 'Reorder Needed' 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-green-50 text-green-600 border border-green-100'
                     }`}>
                        {item.status}
                     </span>
                  </td>
                </tr>
              ))}
              {predictions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No predictive data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
</div>
  );
}
