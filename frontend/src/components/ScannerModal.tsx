import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface ScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function ScannerModal({ onScanSuccess, onClose }: ScannerModalProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: {width: 250, height: 250} },
      false
    );
    
    scannerRef.current.render(
      (decodedText) => {
        // Stop scan on success
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        onScanSuccess(decodedText);
      },
      () => {} // Handle errors silently
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-4 bg-primary text-white flex justify-between items-center">
          <h3 className="font-bold">Scan Medicine QR</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div id="qr-reader" className="w-full"></div>
          <p className="text-sm text-center text-gray-500 mt-4">
            Align the QR code within the frame to scan the batch number automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
