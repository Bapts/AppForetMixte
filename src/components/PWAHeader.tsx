import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { calculateScore } from '../engine/scoringEngine';
import { ScoreSummaryModal } from './ScoreSummaryModal';
import { RotateCw, Trophy, Wifi, WifiOff, Download } from 'lucide-react';

export const PWAHeader: React.FC = () => {
  const { forest, tilleulBonus, resetGame } = useGameStore();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // PWA installation state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Monitor network status
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Monitor PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // Live Score Calculation
  const liveScore = useMemo(() => {
    return calculateScore(forest, { tilleulBonus }).totalScore;
  }, [forest, tilleulBonus]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 border-b border-slate-900 backdrop-blur-md px-4 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-black shadow-inner">
              🌲
            </div>
            <div>
              <h1 className="text-sm font-black text-white m-0 p-0 tracking-tight leading-tight uppercase">
                Forêt Mixte
              </h1>
              <span className="text-[10px] text-emerald-400 font-bold tracking-wider leading-none">
                Score Calculator
              </span>
            </div>
          </div>

          {/* Real-time Score Badge & Installation Status */}
          <div className="flex items-center gap-3">
            {/* Online/Offline Status Indicator */}
            <div className="hidden sm:flex items-center">
              {isOnline ? (
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 bg-emerald-950/20 px-2 py-1 rounded-full border border-emerald-900/30">
                  <Wifi size={10} /> Hors-ligne Prêt
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-950/20 px-2 py-1 rounded-full border border-amber-900/30">
                  <WifiOff size={10} /> Mode Offline
                </span>
              )}
            </div>

            {/* Install App Button */}
            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 px-2 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg transition-all animate-bounce"
              >
                <Download size={12} /> Installer
              </button>
            )}

            {/* Live Score Counter */}
            <button
              onClick={() => setSummaryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <Trophy className="text-amber-400" size={14} />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">Score</span>
                <span className="text-sm font-black font-mono mt-0.5 text-emerald-400">{liveScore}</span>
              </div>
            </button>

            {/* Reset Button */}
            <button
              onClick={resetGame}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 transition-all active:scale-90"
              title="Réinitialiser la partie"
            >
              <RotateCw size={16} />
            </button>
          </div>

        </div>
      </header>

      {/* Summary report Modal */}
      {summaryOpen && (
        <ScoreSummaryModal isOpen={summaryOpen} onClose={() => setSummaryOpen(false)} />
      )}
    </>
  );
};
