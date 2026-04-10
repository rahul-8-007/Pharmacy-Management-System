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

  useEffect(() => {
    fetchInventory();
  }, []);

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
    const days = (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return days > 0 && days < 30;
  };

  const filteredInventory = inventory.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          med.batchNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'low') return matchesSearch && isLowStock(med.quantityAvailable);
    if (filter === 'expiry') return matchesSearch && isNearExpiry(med.expiryDate);
    return matchesSearch;
  });

  return (
    <div>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Medicines Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track your supplies.</p>
        </div>
      </header>

      <div className="bg-white p-4 rounded-t-xl border-b flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or batch..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="border rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-primary"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Items</option>
          <option value="low">Low Stock Alerts</option>
          <option value="expiry">Near Expiry Alerts</option>
        </select>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading inventory...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Medicine Name</th>
                <th className="p-4 font-medium">Dosage</th>
                <th className="p-4 font-medium">Batch No.</th>
                <th className="p-4 font-medium text-center">In Stock</th>
                <th className="p-4 font-medium">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.map(med => (
                <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{med.name}</td>
                  <td className="p-4 text-gray-600">{med.dosage}</td>
                  <td className="p-4 text-gray-600">{med.batchNo}</td>
                  <td className="p-4">
                    <div className="flex justify-center items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isLowStock(med.quantityAvailable) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {med.quantityAvailable}
                      </span>
                      {isLowStock(med.quantityAvailable) && <AlertTriangle className="text-red-500 ml-2" size={16} title="Low Stock" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-sm">
                      <span className={`${isNearExpiry(med.expiryDate) ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>
                        {new Date(med.expiryDate).toLocaleDateString()}
                      </span>
                      {isNearExpiry(med.expiryDate) && <AlertCircle className="text-orange-500 ml-2" size={16} title="Expires Soon" />}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No matching medicines found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
