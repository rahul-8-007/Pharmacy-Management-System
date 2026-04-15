import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface ScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

/** Hard-stop every camera track the browser currently holds open. */
function forceStopAllCameraTracks() {
  document.querySelectorAll('video').forEach((video) => {
    const stream = video.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  });
}

export default function ScannerModal({ onScanSuccess, onClose }: ScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Keep latest callbacks in refs so the effect closure never goes stale
  const successCbRef = useRef(onScanSuccess);
  successCbRef.current = onScanSuccess;
  const closeCbRef = useRef(onClose);
  closeCbRef.current = onClose;

  /** Stop the html5-qrcode instance, then force-kill any leftover camera tracks. */
  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;          // clear the ref first to prevent re-entry
    if (scanner) {
      try {
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      } catch (_) { /* already stopped */ }
    }
    forceStopAllCameraTracks();         // belt-and-suspenders: kill any lingering tracks
  };

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!cameras || cameras.length === 0) return;
        // Prefer back/environment camera on mobile, else take the first
        const cam =
          cameras.find((c) =>
            /back|environment|rear/i.test(c.label)
          ) ?? cameras[0];

        return scanner.start(
          cam.id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decoded) => {
            stopScanner().then(() => successCbRef.current(decoded));
          },
          () => {} // per-frame errors are normal — ignore
        );
      })
      .catch((err) => console.error('Scanner start failed:', err));

    // Cleanup: runs once when the modal unmounts
    return () => { stopScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] = run once — works correctly now that StrictMode is removed

  const handleClose = () => {
    stopScanner().then(() => closeCbRef.current());
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-primary text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera size={18} />
            <h3 className="font-bold">Scan Medicine QR</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close scanner"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera feed */}
        <div className="p-4">
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
          <p className="text-sm text-center text-gray-500 mt-4">
            Align the QR code within the frame to scan the batch number automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
