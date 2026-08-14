import React, { useRef, useState } from 'react';
import { Camera, X, Loader2, ScanLine, Cloud, WifiOff } from 'lucide-react';
import { OCRScannerModal } from './OCRScannerModal';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: ScanResult) => void;
}

export interface ScanResult {
  tree: string | null;
  top: string | null;
  bottom: string | null;
  left: string | null;
  right: string | null;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle returning from the full-screen OCR modal
  if (ocrModalOpen) {
    return (
      <OCRScannerModal
        isOpen={true}
        onClose={() => setOcrModalOpen(false)}
        onScanComplete={(result) => {
          setOcrModalOpen(false);
          onScanComplete(result);
        }}
      />
    );
  }

  const handleCaptureIA = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result?.toString().split(',')[1];
        
        if (!base64String) {
          throw new Error("Erreur lors de la lecture de l'image.");
        }

        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: base64String }),
        });

        if (!response.ok) {
          throw new Error("L'analyse a échoué. Veuillez réessayer.");
        }

        const result: ScanResult = await response.json();
        setIsScanning(false);
        onScanComplete(result);
      };
      
      reader.onerror = () => {
        throw new Error("Erreur de lecture du fichier.");
      };

      reader.readAsDataURL(file);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue.");
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={isScanning}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X size={24} />
        </button>

        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-400 mb-4">
            <Camera size={32} />
          </div>
          
          <h3 className="text-lg font-bold text-white">Scanner un arbre</h3>
          
          <p className="text-sm text-slate-400 mb-6">
            Choisissez votre méthode de scan :
          </p>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-xs text-left mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* IA Cloud Scanner */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleCaptureIA}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 disabled:opacity-50 rounded-xl transition-all group active:scale-95 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-900/30 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Cloud size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none mb-1">IA Vision (Cloud)</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">Ultra rapide et précis. Nécessite internet.</p>
                </div>
              </div>
            </button>

            {/* Local OCR Scanner */}
            <button
              onClick={() => setOcrModalOpen(true)}
              disabled={isScanning}
              className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 disabled:opacity-50 rounded-xl transition-all group active:scale-95 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900/50 text-slate-400 rounded-lg group-hover:bg-slate-600 group-hover:text-white transition-colors">
                  <WifiOff size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none mb-1">OCR Local (Hors-ligne)</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">Expérimental. Lent, 100% privé et sans connexion.</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
