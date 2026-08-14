import React, { useRef, useState, useEffect, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, X, Loader2, ScanLine } from 'lucide-react';
import { ScanResult } from './ScannerModal';
import { findClosestCardName } from '../utils/ocrMatching';

interface OCRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: ScanResult) => void;
}

interface ProcessProgress {
  status: string;
  progress: number;
  zone?: string;
}

export const OCRScannerModal: React.FC<OCRScannerModalProps> = ({ isOpen, onClose, onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progressInfo, setProgressInfo] = useState<ProcessProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setIsScanning(false);
      setProgressInfo(null);
      setError(null);
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const cropAndRotate = (
    video: HTMLVideoElement,
    rx: number, ry: number, rw: number, rh: number,
    angle: number
  ): string => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    
    // Absolute crop coordinates from video source
    const x = vw * rx;
    const y = vh * ry;
    const w = vw * rw;
    const h = vh * rh;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (angle === 90 || angle === -90) {
      canvas.width = h;
      canvas.height = w;
    } else {
      canvas.width = w;
      canvas.height = h;
    }

    if (angle === 90) {
      ctx.translate(h, 0);
      ctx.rotate(Math.PI / 2);
    } else if (angle === -90) {
      ctx.translate(0, w);
      ctx.rotate(-Math.PI / 2);
    } else if (angle === 180) {
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
    }

    // Draw the specific slice from video
    ctx.drawImage(video, x, y, w, h, 0, 0, w, h);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const processOCR = async (base64Image: string, zoneName: string, worker: Tesseract.Worker) => {
    setProgressInfo({ status: 'Reconnaissance de texte...', progress: 0, zone: zoneName });
    const { data: { text } } = await worker.recognize(base64Image);
    return findClosestCardName(text);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !streamRef.current) return;
    
    setIsScanning(true);
    setError(null);

    const video = videoRef.current;
    
    // Zones definition (relative to video dimensions)
    // Tree (Center): 30% x 30%, 40% width, 40% height, 0 deg
    // Top: 30% x 0%, 40% width, 30% height, 0 deg
    // Bottom: 30% x 70%, 40% width, 30% height, 180 deg
    // Left: 0% x 30%, 30% width, 40% height, 90 deg
    // Right: 70% x 30%, 30% width, 40% height, -90 deg
    const images = {
      tree: cropAndRotate(video, 0.3, 0.3, 0.4, 0.4, 0),
      top: cropAndRotate(video, 0.3, 0.0, 0.4, 0.3, 0),
      bottom: cropAndRotate(video, 0.3, 0.7, 0.4, 0.3, 180),
      left: cropAndRotate(video, 0.0, 0.3, 0.3, 0.4, 90),
      right: cropAndRotate(video, 0.7, 0.3, 0.3, 0.4, -90)
    };

    try {
      setProgressInfo({ status: 'Initialisation du moteur OCR (Hors-ligne)...', progress: 0 });
      
      const worker = await Tesseract.createWorker('fra', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgressInfo(prev => prev ? { ...prev, progress: m.progress } : null);
          }
        }
      });

      const result: ScanResult = {
        tree: await processOCR(images.tree, "Arbre central", worker),
        top: await processOCR(images.top, "Haut", worker),
        bottom: await processOCR(images.bottom, "Bas", worker),
        left: await processOCR(images.left, "Gauche", worker),
        right: await processOCR(images.right, "Droite", worker),
      };

      await worker.terminate();
      
      setIsScanning(false);
      onScanComplete(result);
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'analyse OCR.");
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
        <h3 className="text-white font-bold flex items-center gap-2">
          <ScanLine size={18} className="text-emerald-400"/> Scan OCR (Local)
        </h3>
        <button onClick={onClose} disabled={isScanning} className="text-white p-2 bg-slate-900/50 rounded-full backdrop-blur-md">
          <X size={20} />
        </button>
      </div>

      {/* Video Feed & Grid Overlay */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute min-w-full min-h-full object-cover opacity-80"
        />
        
        {/* Guiding Grid Overlay - Matches crop percentages approx for visual feedback */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
          {/* Top row */}
          <div className="flex-[3] flex">
             <div className="flex-[3] bg-black/60 backdrop-blur-[2px]"></div>
             <div className="flex-[4] border-b-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400/50 text-xs font-bold uppercase tracking-widest">Haut</span>
             </div>
             <div className="flex-[3] bg-black/60 backdrop-blur-[2px]"></div>
          </div>
          {/* Middle row */}
          <div className="flex-[4] flex">
             <div className="flex-[3] border-r-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400/50 text-xs font-bold uppercase tracking-widest -rotate-90">Gauche</span>
             </div>
             <div className="flex-[4] border-2 border-emerald-400 flex items-center justify-center">
                <span className="text-emerald-400 text-sm font-black uppercase tracking-widest">Arbre</span>
             </div>
             <div className="flex-[3] border-l-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400/50 text-xs font-bold uppercase tracking-widest rotate-90">Droite</span>
             </div>
          </div>
          {/* Bottom row */}
          <div className="flex-[3] flex">
             <div className="flex-[3] bg-black/60 backdrop-blur-[2px]"></div>
             <div className="flex-[4] border-t-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400/50 text-xs font-bold uppercase tracking-widest rotate-180">Bas</span>
             </div>
             <div className="flex-[3] bg-black/60 backdrop-blur-[2px]"></div>
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="bg-slate-950 p-6 z-20 pb-safe">
        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}
        
        {isScanning ? (
          <div className="w-full space-y-3 bg-slate-900 rounded-2xl p-4">
             <div className="flex items-center gap-3">
               <Loader2 className="animate-spin text-emerald-500" size={24} />
               <div className="flex-1">
                 <p className="text-xs text-emerald-400 font-bold mb-1">{progressInfo?.status}</p>
                 {progressInfo?.zone && <p className="text-[10px] text-slate-400 uppercase tracking-wider">Zone : {progressInfo.zone}</p>}
               </div>
             </div>
             {progressInfo?.progress !== undefined && progressInfo.progress > 0 && (
               <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progressInfo.progress * 100}%` }}></div>
               </div>
             )}
             <p className="text-[10px] text-center text-slate-500 mt-2">Le scan OCR hors-ligne peut prendre quelques secondes. Maintenez l'application ouverte.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-center text-slate-400">Alignez vos cartes dans les zones ci-dessus. Précision maximale requise.</p>
            <button
              onClick={handleCapture}
              className="w-full flex justify-center items-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
            >
              <Camera size={24} /> Capturer et Analyser
            </button>
          </div>
        )}
      </div>
    </div>
  );
};