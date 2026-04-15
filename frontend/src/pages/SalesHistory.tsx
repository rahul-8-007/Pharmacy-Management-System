import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, History } from 'lucide-react';

interface MedicineShort {
  name: string;
  batchNo: string;
  dosage: string;
}

interface Sale {
  id: string;
  medicineId: string;
  quantitySold: number;
  soldAt: string;
  medicine: MedicineShort;
}

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchSalesHistory(); }, []);

  const fetchSalesHistory = async () => {
    try {
      const res = await api.get('/sales/history');
      setSales(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const medName = sale.medicine?.name || '';
    const batch = sale.medicine?.batchNo || '';
    return (
      medName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Sales History</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Review all completed transactions and dispensing records.
        </p>
      </div>

      {/* Table Container */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ background: 'var(--white)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--border)' }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by medicine name or batch number..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-primary transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-color)' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--blue-light)', color: 'var(--primary)' }}
          >
            {filteredSales.length} record{filteredSales.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading sales history...
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border)' }}>
                {['Date & Time', 'Medicine Name', 'Dosage', 'Batch No.', 'Qty Sold'].map(h => (
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
              {filteredSales.map((sale, i) => (
                <tr
                  key={sale.id}
                  className="transition-colors"
                  style={{ borderBottom: i < filteredSales.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-color)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-2">
                      <History size={14} style={{ color: 'var(--text-muted)' }} />
                      {new Date(sale.soldAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
                    {sale.medicine?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {sale.medicine?.dosage || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {sale.medicine?.batchNo || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="pill-status pill-blue">
                      {sale.quantitySold} units
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No matching sales records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
