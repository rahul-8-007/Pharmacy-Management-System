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

interface TrendItem {
  date: string;
  sales: number;
}

interface PredictionsData {
  predictions: PredictionItem[];
  trends: TrendItem[];
}

export default function Predictions() {
  const [data, setData] = useState<PredictionsData>({ predictions: [], trends: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await api.get('/predictions');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading predictions...</div>;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Demand Predictions</h1>
        <p className="text-gray-500 text-sm mt-1">AI-driven next month stock estimates based on sales trends.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Sales Trend (Last 30 Days)</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="#0d9488" fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {data.trends.length === 0 && <p className="text-center text-gray-500 py-4">No recent sales data to plot.</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Next Month Reorder Requirements</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
              <th className="p-4 font-medium">Medicine Name</th>
              <th className="p-4 font-medium text-center">Sold Last 30d</th>
              <th className="p-4 font-medium text-center">Current Stock</th>
              <th className="p-4 font-medium text-center">Est. Requirement</th>
              <th className="p-4 font-medium">Action Recommended</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.predictions.map((p) => (
              <tr key={p.medicineId} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{p.name} <span className="text-xs text-gray-500 font-normal ml-1">({p.dosage})</span></td>
                <td className="p-4 text-center text-gray-600 font-medium">{p.soldLast30Days}</td>
                <td className="p-4 text-center text-gray-600 font-bold">{p.currentStock}</td>
                <td className="p-4 text-center text-primary font-bold text-lg">{p.nextMonthEstimate}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    p.status.includes('Reorder') ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {data.predictions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Wait for sales to generate predictions.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
