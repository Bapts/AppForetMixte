import React, { useRef, useState } from 'react';
import { Camera, X, Check, Loader2 } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
          
          <p className="text-sm text-slate-400">
            Prenez en photo votre arbre et ses cartes rattachées (en haut, en bas, à gauche, à droite) pour les ajouter automatiquement.
          </p>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="pt-4">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleCapture}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors shadow-lg active:scale-95"
            >
              {isScanning ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyse de l'image par l'IA...
                </>
              ) : (
                <>
                  <Camera size={20} />
                  Ouvrir l'appareil photo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
