import { useState, type FormEvent } from 'react';
import axios from 'axios';
import api from '../lib/api';
import ScannerModal from '../components/ScannerModal';
import { QrCode, Search, ShoppingCart, AlertCircle, CheckCircle, Package } from 'lucide-react';

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
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleScanSuccess = (text: string) => {
    setShowScanner(false);
    setBatchNo(text);
    lookupMedicine(text);
  };

  const lookupMedicine = async (bNo: string) => {
    if (!bNo) return;
    setMessage('');
    setLookupLoading(true);
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
    } catch {
      setMedicine(null);
      setIsError(true);
      setMessage('Error looking up batch.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSell = async (e: FormEvent) => {
    e.preventDefault();
    if (!medicine) return;

    try {
      const res = await api.post('/sales/sell', {
        batchNo: medicine.batchNo,
        quantitySold: Number(quantitySold),
      });

      setIsError(false);
      let successMsg = `Successfully sold ${quantitySold} units of ${medicine.name}.`;
      if (res.data.lowStockAlert) {
        successMsg += ` ⚠️ Stock is now low!`;
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
    <div className="fade-in max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
          TRANSACTION TERMINAL
        </p>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Sales Interface</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Scan or manually enter a batch number to log a sale.
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm font-medium border"
          style={{
            background: isError ? 'var(--red-light)' : 'var(--green-light)',
            color: isError ? '#991b1b' : '#166534',
            borderColor: isError ? '#fecaca' : '#bbf7d0',
          }}
        >
          {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {message}
        </div>
      )}

      {showScanner && (
        <ScannerModal onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />
      )}

      {/* Batch Lookup Card */}
      <div
        className="flex gap-3 p-5 rounded-xl mb-6 border"
        style={{ background: 'var(--white)', boxShadow: 'var(--shadow-sm)', borderColor: 'var(--border)' }}
      >
        <input
          type="text"
          placeholder="Enter Batch Number..."
          className="flex-1 px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-primary transition-all"
          style={{ borderColor: 'var(--border)' }}
          value={batchNo}
          onChange={e => setBatchNo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookupMedicine(batchNo)}
        />
        <button
          onClick={() => lookupMedicine(batchNo)}
          disabled={lookupLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors"
          style={{ background: 'var(--bg-color)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
        >
          <Search size={16} />
          {lookupLoading ? 'Searching...' : 'Lookup'}
        </button>
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--primary)' }}
        >
          <QrCode size={16} />
          Scan QR
        </button>
      </div>

      {/* Medicine Found Card */}
      {medicine && (
        <form
          onSubmit={handleSell}
          className="rounded-xl border overflow-hidden"
          style={{
            background: 'var(--white)',
            boxShadow: 'var(--shadow-sm)',
            borderColor: '#bfdbfe',
          }}
        >
          {/* Medicine header */}
          <div className="p-5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--blue-light)' }}>
            <div className="flex items-center gap-3">
              <div
                className="icon-circle"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--primary)' }}>
                  {medicine.name}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Batch: {medicine.batchNo} · Dosage: {medicine.dosage}
                </p>
              </div>
            </div>
          </div>

          {/* Medicine stats */}
          <div className="grid grid-cols-3 divide-x p-0" style={{ borderBottom: '1px solid var(--border)' }}>
            {[
              { label: 'IN STOCK', value: medicine.quantityAvailable, alert: medicine.quantityAvailable < 20 },
              { label: 'DOSAGE', value: medicine.dosage, alert: false },
              { label: 'EXPIRY', value: new Date(medicine.expiryDate).toLocaleDateString(), alert: false },
            ].map(stat => (
              <div key={stat.label} className="p-5 text-center" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
                <p
                  className="text-xl font-bold"
                  style={{ color: stat.alert ? 'var(--red)' : 'var(--text-main)' }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Sell form */}
          <div className="p-6">
            <label
              className="block text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Quantity to Sell
            </label>
            <input
              type="number"
              min="1"
              max={medicine.quantityAvailable}
              required
              value={quantitySold}
              onChange={e => setQuantitySold(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-primary transition-all mb-5"
              style={{ borderColor: 'var(--border)' }}
              placeholder={`Max: ${medicine.quantityAvailable}`}
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: '#16a34a' }}
            >
              <ShoppingCart size={20} />
              Checkout Sale
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
