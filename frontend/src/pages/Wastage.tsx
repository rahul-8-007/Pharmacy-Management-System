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

  useEffect(() => {
    fetchWastage();
  }, []);

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
    return safeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           safeBatch.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Wastage Records</h1>
          <p className="text-gray-500 text-sm mt-1">Review tablets that were automatically completely discarded due to expiration.</p>
        </div>
      </header>

      <div className="bg-white p-4 rounded-t-xl border-b flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by medicine name or batch..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading wastage records...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Medicine Name</th>
                <th className="p-4 font-medium">Dosage</th>
                <th className="p-4 font-medium">Batch No.</th>
                <th className="p-4 font-medium text-center">Wasted Qty</th>
                <th className="p-4 font-medium">Expired Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWastage.map(item => (
                <tr key={item.id} className="hover:bg-red-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800 flex items-center">
                    <Trash2 size={16} className="text-red-400 mr-2" />
                    {item.name}
                  </td>
                  <td className="p-4 text-gray-600">{item.dosage}</td>
                  <td className="p-4 text-gray-600">{item.batchNo}</td>
                  <td className="p-4">
                    <div className="flex justify-center items-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        {item.wastedQuantity}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-sm">
                      <span className="text-red-600 font-bold">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                      <span title="Expired"><AlertTriangle className="text-red-500 ml-2" size={16} /></span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWastage.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No wastage records found!</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
