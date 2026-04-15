import { useState, type FormEvent } from 'react';
import axios from 'axios';
import api from '../lib/api';
import ScannerModal from '../components/ScannerModal';
import { QrCode, Search, ShoppingCart, AlertCircle } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  batchNo: string;
  dosage: string;
  quantityAvailable: number;
  expiryDate: string;
}

export default function SellTablets() {
  const [showScanner, setShowScanner] = useState(false);
  const [batchNo, setBatchNo] = useState('');
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [quantitySold, setQuantitySold] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const handleScanSuccess = (text: string) => {
    setShowScanner(false);
    setBatchNo(text);
    lookupMedicine(text);
  };

  const lookupMedicine = async (bNo: string) => {
    if (!bNo) return;
    setMessage('');
    try {
      const res = await api.get(`/medicines/batch/${bNo}`);
      if (res.data.foundInDb) {
        setMedicine(res.data.medicine);
        setIsError(false);
      } else {
        setMedicine(null);
        setIsError(true);
        setMessage('Medicine not found in your inventory.');
      }
    } catch (err) {
      setMedicine(null);
      setIsError(true);
      setMessage('Error looking up batch.');
    }
  };

  const handleSell = async (e: FormEvent) => {
    e.preventDefault();
    if (!medicine) return;
    
    try {
      const res = await api.post('/sales/sell', {
        batchNo: medicine.batchNo,
        quantitySold: Number(quantitySold)
      });
      
      setIsError(false);
      let successMsg = `Successfully sold ${quantitySold} units of ${medicine.name}.`;
      if (res.data.lowStockAlert) {
         successMsg += ` ⚠️ ALERT: Stock for this item is now low!`;
      }
      setMessage(successMsg);
      setMedicine(res.data.updatedMedicine);
      setQuantitySold('');
    } catch (err: unknown) {
      setIsError(true);
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      setMessage(msg || 'Failed to process sale.');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sell Tablets</h1>
        <p className="text-gray-500 text-sm mt-1">Scan or manually enter batch to log a sale.</p>
      </header>

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-medium flex items-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {isError && <AlertCircle className="mr-2" size={18} />}
          {message}
        </div>
      )}

      {showScanner && <ScannerModal onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex space-x-3">
        <input 
          type="text" 
          placeholder="Batch Number"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
          value={batchNo}
          onChange={e => setBatchNo(e.target.value)}
        />
        <button onClick={() => lookupMedicine(batchNo)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center">
          <Search size={18} />
        </button>
        <button onClick={() => setShowScanner(true)} className="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg flex items-center shadow-sm">
          <QrCode size={18} className="mr-2" />
          Scan
        </button>
      </div>

      {medicine && (
         <form onSubmit={handleSell} className="bg-white p-6 rounded-xl shadow-sm border border-primary/20">
           <h3 className="text-xl font-bold text-gray-800 mb-4">{medicine.name}</h3>
           
           <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500 text-xs block uppercase font-bold">In Stock</span>
                <span className={`text-lg font-bold ${medicine.quantityAvailable < 20 ? 'text-red-500' : 'text-gray-800'}`}>
                  {medicine.quantityAvailable}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500 text-xs block uppercase font-bold">Dosage</span>
                <span className="text-lg font-medium text-gray-800">{medicine.dosage}</span>
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Sell</label>
              <input 
                type="number" 
                min="1" 
                max={medicine.quantityAvailable}
                required 
                value={quantitySold} 
                onChange={e => setQuantitySold(e.target.value)} 
                className="w-full px-4 py-2 border rounded-lg outline-none mb-4 focus:ring-2 focus:ring-primary" 
              />
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center transition-colors">
                <ShoppingCart className="mr-2" size={20} /> Checkout Sale
              </button>
           </div>
         </form>
      )}
    </div>
  );
}
