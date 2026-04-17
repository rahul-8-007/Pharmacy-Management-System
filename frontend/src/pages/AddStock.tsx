import { useState, type FormEvent } from 'react';
import api from '../lib/api';
import ScannerModal from '../components/ScannerModal';
import { QrCode, Save, Search, CheckCircle, AlertCircle, Loader2, ArrowLeft, Beaker, Activity, Info, Briefcase, Calendar, Hash, PackagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AddStock() {
  const [showScanner, setShowScanner] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    batchNo: '',
    name: '',
    dosage: '',
    manufacturer: '',
    expiryDate: '',
    quantityAdded: '',
    serialNo: '',
  });

  const handleScanSuccess = (text: string) => {
    setShowScanner(false);
    if (text.startsWith('http://') || text.startsWith('https://')) {
      setFormData(prev => ({ ...prev, batchNo: '' }));
      fetchFromQrUrl(text);
    } else {
      setFormData(prev => ({ ...prev, batchNo: text }));
      fetchMedicineDetails(text);
    }
  };

  const fetchFromQrUrl = async (url: string) => {
    setLookupLoading(true);
    setMessage('🌐 Syncing with pharmaceutical database... approx 10s');
    setIsSuccess(false);
    try {
      const res = await api.post('/qr/fetch-url', { url });
      const d = res.data;

      setFormData(prev => ({
        ...prev,
        batchNo:      d.batchNo      || prev.batchNo,
        serialNo:     d.serialNo     || prev.serialNo,
        name:         d.name         || prev.name,
        dosage:       d.dosage       || prev.dosage,
        manufacturer: d.manufacturer || prev.manufacturer,
        expiryDate:   d.expiryDate   || prev.expiryDate,
      }));

      setIsSuccess(true);
      setMessage(`✅ Verified: ${d.name || 'Medicine'} details synchronized successfully.`);
    } catch (err: unknown) {
      setIsSuccess(false);
      setMessage(`⚠️ Extraction incomplete. Please finalize fields manually.`);
    } finally {
      setLookupLoading(false);
    }
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
          expiryDate: med.expiryDate.split('T')[0],
        }));
        setIsSuccess(true);
        setMessage('Medicine located in local registry. Adjusting quantity.');
      } else {
        setIsSuccess(false);
        setMessage('Unregistered batch detected. Initializing new entry.');
      }
    } catch {
      setIsSuccess(false);
      setMessage('Network error during lookup. Manual override active.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const selectedDate = new Date(formData.expiryDate);
    if (isNaN(selectedDate.getTime())) {
      setIsSuccess(false);
      setMessage('Invalid chronological format for expiry.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setIsSuccess(false);
      setMessage('Validation failed: Product has already reached lifecycle end.');
      return;
    }

    setSaveLoading(true);
    try {
      await api.post('/stock/add', formData);
      setIsSuccess(true);
      setMessage('Inventory successfully updated. Record committed.');
      setFormData({ batchNo: '', name: '', dosage: '', manufacturer: '', expiryDate: '', quantityAdded: '', serialNo: '' });
    } catch (err: unknown) {
      setIsSuccess(false);
      setMessage('Persistence error. Verify parameters and retry.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-6xl mx-auto space-y-8">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <Link to="/" className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors mb-2">
               <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Add Stock</h1>
            <p className="text-slate-500 font-medium">Record and verify incoming medical inventory batches.</p>
         </div>
         <div className="hidden md:flex items-center gap-4 px-6 py-3 glass-card rounded-2xl">
            <div className="text-right">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Load</p>
               <p className="text-sm font-bold text-emerald-600">Stable</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
               <Activity size={20} />
            </div>
         </div>
      </div>

      {/* Message Notifications */}
      {message && (
        <div className={`
          flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-top-4
          ${isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
            lookupLoading ? 'bg-blue-50 border-blue-100 text-blue-600' : 
            'bg-rose-50 border-rose-100 text-rose-600'}
        `}>
          {lookupLoading ? <Loader2 size={24} className="animate-spin" /> : 
           isSuccess ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <div className="flex-1">
             <p className="text-sm font-bold">{message}</p>
             {lookupLoading && <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }}></div>
             </div>}
          </div>
        </div>
      )}

      {showScanner && (
        <ScannerModal onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Scanner Portal */}
        <div className="lg:col-span-5 space-y-6">
           <div className="glass-card rounded-[32px] overflow-hidden group">
               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-12 flex flex-col items-center justify-center text-center relative min-h-[400px]">
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0,transparent_70%)]"></div>
                  
                  <div className="relative mb-8">
                     <div className="w-32 h-32 rounded-full bg-white shadow-xl shadow-blue-500/10 border border-blue-100 flex items-center justify-center animate-float">
                        <QrCode size={64} className="text-blue-600" />
                     </div>
                     <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border-4 border-white">
                        <Beaker size={14} className="text-white" />
                     </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Smart Scan</h3>
                  <p className="text-slate-500 text-sm font-medium mb-8 max-w-[280px] leading-relaxed relative z-10">
                     Use optical recognition to automatically fetch batch details from our pharmaceutical global nodes.
                  </p>

                 <button
                    onClick={() => setShowScanner(true)}
                    disabled={lookupLoading}
                    className="premium-button flex items-center gap-3 w-full max-w-[240px] justify-center relative z-10 group-hover:scale-105 transition-transform"
                 >
                    <Search size={20} />
                    <span> Scan QR / Barcode</span>
                 </button>
              </div>
              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex gap-4 items-start">
                     <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <span className="text-blue-600"><Info size={16} /></span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Protocol Support</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                           We support standard GS1 barcodes, ACG verification URLs, and DSCSA digital signatures.
                        </p>
                     </div>
                  </div>
               </div>
           </div>
        </div>

        {/* Right: Data Entry Terminal */}
        <div className="lg:col-span-7">
           <div className="glass-card p-10 rounded-[32px]">
              <div className="flex items-center gap-3 mb-10">
                 <div className="w-8 h-[2px] bg-blue-600"></div>
                 <h3 className="text-xl font-bold text-slate-900">Stock Entry</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                 {/* Batch ID Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Batch Number *</label>
                       <div className="relative group">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                          <input
                             type="text"
                             className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-12 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 focus:bg-white transition-all font-mono"
                             placeholder="BTCH-0000"
                             value={formData.batchNo}
                             onChange={e => setFormData({...formData, batchNo: e.target.value})}
                             required
                          />
                       </div>
                    </div>
                    <div className="flex items-end pb-1.5">
                       <button
                          type="button"
                          onClick={() => fetchMedicineDetails(formData.batchNo)}
                          disabled={lookupLoading}
                          className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all w-full flex items-center justify-center gap-2"
                       >
                          <Search size={14} /> Local Lookup
                       </button>
                    </div>
                 </div>

                 {/* Product Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Product Name *</label>
                        <div className="relative group">
                           <Beaker className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                           <input
                              type="text"
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 focus:bg-white transition-all"
                              placeholder="Amoxicillin..."
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              required
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Spec (Dosage) *</label>
                        <input
                           type="text"
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 focus:bg-white transition-all"
                           placeholder="500mg"
                           value={formData.dosage}
                           onChange={e => setFormData({...formData, dosage: e.target.value})}
                           required
                        />
                     </div>
                  </div>

                 {/* Lifecycle Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Manufacturer</label>
                        <div className="relative group">
                           <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                           <input
                              type="text"
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 focus:bg-white transition-all"
                              placeholder="Pfizer, GSK..."
                              value={formData.manufacturer}
                              onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Expiry Date *</label>
                        <div className="relative group">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                           <input
                              type="date"
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 focus:bg-white transition-all"
                              value={formData.expiryDate}
                              onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                              required
                           />
                        </div>
                     </div>
                  </div>

                 {/* Volume Section */}
                  <div className="space-y-2 pt-4">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Quantity *</label>
                     <div className="relative group">
                        <PackagePlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                           type="number"
                           min="1"
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-lg font-bold text-slate-900 outline-none focus:border-blue-500/50 focus:bg-white transition-all"
                           placeholder="000"
                           value={formData.quantityAdded}
                           onChange={e => setFormData({...formData, quantityAdded: e.target.value})}
                           required
                        />
                     </div>
                  </div>

                 {/* Action Panel */}
                  <div className="flex gap-4 pt-6 border-t border-slate-100">
                     <button
                        type="button"
                        onClick={() => setFormData({ batchNo: '', name: '', dosage: '', manufacturer: '', expiryDate: '', quantityAdded: '', serialNo: '' })}
                        className="flex-1 py-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                     >
                        Clear
                     </button>
                     <button
                        type="submit"
                        disabled={saveLoading}
                        className="flex-[2] premium-button flex items-center justify-center gap-3 relative overflow-hidden group"
                     >
                        <Save size={20} />
                        <span>{saveLoading ? 'Writing Data...' : 'Add'}</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                     </button>
                  </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
}

