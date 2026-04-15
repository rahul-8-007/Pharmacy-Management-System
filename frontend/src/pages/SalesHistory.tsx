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

  useEffect(() => {
    fetchSalesHistory();
  }, []);

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
    return medName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           batch.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sales History</h1>
        <p className="text-gray-500 text-sm mt-1">Review all completed transactions.</p>
      </header>

      <div className="bg-white p-4 rounded-t-xl border-b">
        <div className="relative">
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
          <div className="p-8 text-center text-gray-500">Loading sales history...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Medicine Name</th>
                <th className="p-4 font-medium">Dosage</th>
                <th className="p-4 font-medium">Batch No.</th>
                <th className="p-4 font-medium text-center">Qty Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                       <History size={16} className="text-gray-400"/>
                       <span>{new Date(sale.soldAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{sale.medicine?.name || 'Unknown'}</td>
                  <td className="p-4 text-gray-600">{sale.medicine?.dosage || '-'}</td>
                  <td className="p-4 text-gray-600">{sale.medicine?.batchNo || '-'}</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {sale.quantitySold}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No matching sales records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
