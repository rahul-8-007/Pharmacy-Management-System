import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, AlertTriangle, AlertCircle } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  batchNo: string;
  quantityAvailable: number;
  expiryDate: string;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/medicines');
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (qty: number) => qty < 20;
  const isNearExpiry = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const days = (d.getTime() - Date.now()) / (1000 * 3600 * 24);
    return days > 0 && days < 30;
  };

  const filteredInventory = inventory.filter(med => {
    const expiry = new Date(med.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry < today) return false;

    const matchesSearch =
      (med.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.batchNo || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'low') return matchesSearch && isLowStock(med.quantityAvailable);
    if (filter === 'expiry') return matchesSearch && isNearExpiry(med.expiryDate);
    return matchesSearch;
  });

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Inventory Control</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage and track your active medicine supplies.
        </p>
      </div>

      {/* Table Container */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ background: 'var(--white)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--border)' }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by name or batch number..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-primary transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-color)' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-primary transition-all font-medium"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="low">Low Stock Alerts</option>
            <option value="expiry">Near Expiry Alerts</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading inventory...
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border)' }}>
                {['Tablet Name', 'Dosage', 'Batch ID', 'Expiry Date', 'Available', 'Status'].map(h => (
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
              {filteredInventory.map((med, i) => (
                <tr
                  key={med.id}
                  className="transition-colors"
                  style={{ borderBottom: i < filteredInventory.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-color)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-6 py-4 font-semibold text-sm" style={{ color: 'var(--primary)' }}>
                    {med.name}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {med.dosage}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {med.batchNo}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={isNearExpiry(med.expiryDate) ? 'font-bold' : ''} style={{ color: isNearExpiry(med.expiryDate) ? '#d97706' : 'var(--text-muted)' }}>
                      {new Date(med.expiryDate).toLocaleDateString()}
                    </span>
                    {isNearExpiry(med.expiryDate) && (
                      <span title="Expires Soon">
                        <AlertCircle size={14} className="inline ml-1.5" style={{ color: '#d97706' }} />
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                    <div className="flex items-center gap-2">
                      {med.quantityAvailable}
                      {isLowStock(med.quantityAvailable) && (
                        <span title="Low Stock">
                          <AlertTriangle size={14} style={{ color: 'var(--red)' }} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`pill-status ${isLowStock(med.quantityAvailable) ? 'pill-low' : 'pill-optimal'}`}>
                      {isLowStock(med.quantityAvailable) ? 'Low Stock' : 'Optimal'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No matching medicines found in inventory.
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
