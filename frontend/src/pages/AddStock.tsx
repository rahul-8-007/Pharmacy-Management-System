import { useState } from 'react';
import api from '../lib/api';
import ScannerModal from '../components/ScannerModal';
import { QrCode, Save, Search } from 'lucide-react';

export default function AddStock() {
  const [showScanner, setShowScanner] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    batchNo: '',
    name: '',
    dosage: '',
    manufacturer: '',
    expiryDate: '',
    quantityAdded: ''
  });

  const handleScanSuccess = (text: string) => {
    setShowScanner(false);
    setFormData(prev => ({ ...prev, batchNo: text }));
    fetchMedicineDetails(text);
  };

  const fetchMedicineDetails = async (batchNo: string) => {
    if (!batchNo) return;
    setLookupLoading(true);
    setMessage('');
    try {
      const res = await api.get(`/medicines/batch/${batchNo}`);
      if (res.data.medicine) {
        const med = res.data.medicine;
        setFormData(prev => ({
          ...prev,
          name: med.name,
          dosage: med.dosage,
          manufacturer: med.manufacturer || '',
          expiryDate: med.expiryDate.split('T')[0] // format YYYY-MM-DD
        }));
        if (res.data.foundInDb) {
          setMessage('Medicine found in inventory. Quantity will be added to existing stock.');
        } else {
          setMessage('Details fetched. Please review before saving.');
        }
      } else {
        setMessage('New batch. Please enter details manually.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error looking up batch. Please enter details manually.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    // Validate date format correctly on frontend first
    if (isNaN(new Date(formData.expiryDate).getTime())) {
      setMessage('Invalid expiry date format. Please correct it.');
      return;
    }

    setSaveLoading(true);
    try {
      await api.post('/stock/add', formData);
      setMessage('Stock added successfully!');
      setFormData({
        batchNo: '', name: '', dosage: '', manufacturer: '', expiryDate: '', quantityAdded: ''
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      setMessage(err.response?.data?.error || 'Failed to add stock. Please check your inputs.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add New Stock</h1>
        <p className="text-gray-500 text-sm mt-1">Scan QR or enter batch number to auto-fill details.</p>
      </header>

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {message}
        </div>
      )}

      {showScanner && <ScannerModal onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex space-x-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Batch Number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.batchNo}
              onChange={e => setFormData({...formData, batchNo: e.target.value})}
              required
            />
          </div>
          <button 
            type="button"
            onClick={() => fetchMedicineDetails(formData.batchNo)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center transition-colors"
            disabled={lookupLoading}
          >
            <Search size={18} className="mr-2" />
            Lookup
          </button>
          <button 
            type="button" 
            onClick={() => setShowScanner(true)}
            className="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg flex items-center transition-colors shadow-sm"
          >
            <QrCode size={18} className="mr-2" />
            Scan QR
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
              <input required type="text" placeholder="e.g. 500mg" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input type="text" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input required type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Added</label>
            <input required type="number" min="1" value={formData.quantityAdded} onChange={e => setFormData({...formData, quantityAdded: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none" />
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end">
          <button 
            type="submit" 
            disabled={saveLoading}
            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm disabled:opacity-70"
          >
            <Save size={18} className="mr-2" />
            {saveLoading ? 'Saving...' : 'Save Stock'}
          </button>
        </div>
      </form>
    </div>
  );
}
