import { useState, type FormEvent } from 'react';
import axios from 'axios';
import api from '../lib/api';
import ScannerModal from '../components/ScannerModal';
import { QrCode, Save, Search, PackagePlus, CheckCircle, AlertCircle } from 'lucide-react';

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
          expiryDate: med.expiryDate.split('T')[0],
        }));
        setIsSuccess(true);
        setMessage(
          res.data.foundInDb
            ? 'Medicine found in inventory. Quantity will be added to existing stock.'
            : 'Details fetched. Please review before saving.'
        );
      } else {
        setIsSuccess(false);
        setMessage('New batch. Please enter details manually.');
      }
    } catch {
      setIsSuccess(false);
      setMessage('Error looking up batch. Please enter details manually.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    const selectedDate = new Date(formData.expiryDate);
    if (isNaN(selectedDate.getTime())) {
      setIsSuccess(false);
      setMessage('Invalid expiry date format. Please correct it.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setIsSuccess(false);
      setMessage('Cannot add medicines that are already expired.');
      return;
    }

    setSaveLoading(true);
    try {
      await api.post('/stock/add', formData);
      setIsSuccess(true);
      setMessage('Stock added successfully!');
      setFormData({ batchNo: '', name: '', dosage: '', manufacturer: '', expiryDate: '', quantityAdded: '' });
    } catch (err: unknown) {
      setIsSuccess(false);
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      setMessage(msg || 'Failed to add stock. Please check your inputs.');
    } finally {
      setSaveLoading(false);
    }
  };

  const inputClass = `
    w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all
    focus:ring-2 focus:ring-blue-200 focus:border-primary
  `;
  const labelClass = 'block text-xs font-semibold mb-1.5 uppercase tracking-wide';

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Stock Entry</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Register new medical supplies into the inventory system.
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm font-medium border"
          style={{
            background: isSuccess ? 'var(--green-light)' : 'var(--red-light)',
            color: isSuccess ? '#166534' : '#991b1b',
            borderColor: isSuccess ? '#bbf7d0' : '#fecaca',
          }}
        >
          {isSuccess
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />}
          {message}
        </div>
      )}

      {showScanner && (
        <ScannerModal onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Scanner Section */}
        <div
          className="rounded-xl overflow-hidden flex flex-col"
          style={{ background: 'var(--white)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}
        >
          {/* Scanner visual */}
          <div
            className="flex flex-col items-center justify-center gap-5 p-12"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              minHeight: '260px',
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
            >
              <QrCode size={40} className="text-white" strokeWidth={1.5} />
            </div>
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: 'var(--white)', color: 'var(--primary)' }}
            >
              Scan QR / Barcode
            </button>
          </div>

          {/* Scanner info */}
          <div className="p-6">
            <h4 className="font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
              Visual Verification
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Align the QR code or barcode within the frame for instant inventory data retrieval.
            </p>
          </div>
        </div>

        {/* Right: Manual Entry Form */}
        <div
          className="rounded-xl p-8"
          style={{ background: 'var(--white)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-main)' }}>Manual Entry</h3>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            Fields marked with * are required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Batch lookup row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Batch Number *</label>
                <input
                  type="text"
                  placeholder="e.g., BTCH-2024-99X"
                  className={inputClass}
                  style={{ borderColor: 'var(--border)' }}
                  value={formData.batchNo}
                  onChange={e => setFormData({ ...formData, batchNo: e.target.value })}
                  required
                />
              </div>
              <div className="self-end">
                <button
                  type="button"
                  onClick={() => fetchMedicineDetails(formData.batchNo)}
                  disabled={lookupLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border"
                  style={{ background: 'var(--bg-color)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
                >
                  <Search size={15} />
                  {lookupLoading ? '...' : 'Lookup'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: 'var(--text-muted)' }}>
                  Tablet Name & Spec *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Amoxicillin"
                  className={inputClass}
                  style={{ borderColor: 'var(--border)' }}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Dosage *</label>
                <input
                  type="text"
                  placeholder="e.g., 500mg"
                  className={inputClass}
                  style={{ borderColor: 'var(--border)' }}
                  value={formData.dosage}
                  onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g., Pfizer"
                  className={inputClass}
                  style={{ borderColor: 'var(--border)' }}
                  value={formData.manufacturer}
                  onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Expiry Date *</label>
                <input
                  type="date"
                  className={inputClass}
                  style={{ borderColor: 'var(--border)' }}
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Quantity *</label>
              <input
                type="number"
                min="1"
                placeholder="e.g., 100"
                className={inputClass}
                style={{ borderColor: 'var(--border)' }}
                value={formData.quantityAdded}
                onChange={e => setFormData({ ...formData, quantityAdded: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setFormData({ batchNo: '', name: '', dosage: '', manufacturer: '', expiryDate: '', quantityAdded: '' })}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors"
                style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                style={{ background: 'var(--primary)' }}
              >
                <Save size={16} />
                {saveLoading ? 'Saving...' : 'Complete Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Inline PackagePlus decoration */}
      <div className="hidden">
        <PackagePlus />
      </div>
    </div>
  );
}
