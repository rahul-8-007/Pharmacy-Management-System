import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, Trash2, AlertTriangle } from 'lucide-react';

interface WastageRecord {
  id: string;
  name: string;
  batchNo: string;
  dosage: string;
  expiryDate: string;
  wastedQuantity: number;
}

export default function Wastage() {
  const [wastageList, setWastageList] = useState<WastageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchWastage(); }, []);

  const fetchWastage = async () => {
    try {
      const res = await api.get('/medicines/wastage');
      setWastageList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWastage = wastageList.filter(item => {
    const safeName = item.name || '';
    const safeBatch = item.batchNo || '';
    return (
      safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeBatch.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalWasted = filteredWastage.reduce((acc, item) => acc + item.wastedQuantity, 0);

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Wastage Records</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Review tablets automatically discarded due to expiration.
        </p>
      </div>

      {/* Summary Banner */}
      {!loading && wastageList.length > 0 && (
        <div
          className="flex items-center gap-4 p-5 rounded-xl mb-6 border-l-4"
          style={{
            background: 'linear-gradient(to right, #fff, var(--red-light))',
            borderLeftColor: 'var(--red)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="icon-circle"
            style={{ background: 'var(--red-light)', color: 'var(--red)' }}
          >
            <Trash2 size={20} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#991b1b' }}>Total Wastage This Period</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--red)' }}>
              {totalWasted.toLocaleString()} <span className="text-base font-medium">units destroyed</span>
            </p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ background: 'var(--white)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--border)' }}
      >
        {/* Toolbar */}
        <div className="flex gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by medicine name or batch..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-primary transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-color)' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading wastage records...
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border)' }}>
                {['Medicine Name', 'Dosage', 'Batch No.', 'Wasted Qty', 'Expired Date'].map(h => (
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
              {filteredWastage.map((item, i) => (
                <tr
                  key={item.id}
                  className="transition-colors"
                  style={{ borderBottom: i < filteredWastage.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                    <div className="flex items-center gap-2">
                      <Trash2 size={14} style={{ color: 'var(--red)' }} />
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {item.dosage}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {item.batchNo}
                  </td>
                  <td className="px-6 py-4">
                    <span className="pill-status pill-low">
                      {item.wastedQuantity} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold" style={{ color: 'var(--red)' }}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                      <AlertTriangle size={14} style={{ color: 'var(--red)' }} />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWastage.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    {wastageList.length === 0
                      ? '🎉 No wastage records! All batches are within expiry.'
                      : 'No matching wastage records found.'}
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
