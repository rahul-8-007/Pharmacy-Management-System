import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { TrendingUp } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading predictions...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Demand Predictions</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          AI-driven next month stock estimates based on sales trends.
        </p>
      </div>

      {/* Trend Chart */}
      <div
        className="rounded-xl p-6 mb-8 border"
        style={{ background: 'var(--white)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-circle" style={{ background: 'var(--blue-light)', color: 'var(--primary)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>Sales Trend (Last 30 Days)</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily sales volume across all medicines</p>
          </div>
        </div>

        {data.trends.length > 0 ? (
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f4a8e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f4a8e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0f4a8e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--text-muted)' }}>
            No recent sales data to plot.
          </div>
        )}
      </div>

      {/* Reorder Table */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ background: 'var(--white)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--border)' }}
      >
        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>Next Month Reorder Requirements</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Based on your last 30 days of sales velocity</p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border)' }}>
              {['Medicine Name', 'Sold Last 30d', 'Current Stock', 'Est. Requirement', 'Action'].map(h => (
                <th
                  key={h}
                  className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.predictions.map((p, i) => (
              <tr
                key={p.medicineId}
                className="transition-colors"
                style={{ borderBottom: i < data.predictions.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-color)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                  {p.name}
                  <span className="font-normal ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    ({p.dosage})
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center font-medium" style={{ color: 'var(--text-muted)' }}>
                  {p.soldLast30Days}
                </td>
                <td className="px-6 py-4 text-sm text-center font-bold" style={{ color: 'var(--text-main)' }}>
                  {p.currentStock}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                    {p.nextMonthEstimate}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`pill-status ${p.status.includes('Reorder') ? 'pill-expiry' : 'pill-optimal'}`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {data.predictions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Predictions will appear once you have sufficient sales data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
