import React, { useState } from 'react';
import { GameProvider } from './store/useGameStore';
import { PWAHeader } from './components/PWAHeader';
import { ForestView } from './components/ForestView';
import { CaveView } from './components/CaveView';
import { ClipboardList, TreeDeciduous } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forest' | 'cave'>('forest');

  return (
    <GameProvider>
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        
        {/* PWA App Header */}
        <PWAHeader />

        {/* Tab Selection Bar */}
        <nav className="sticky top-[53px] z-30 w-full bg-slate-950/85 border-b border-slate-900/50 backdrop-blur-xs flex items-center justify-center">
          <div className="flex w-full max-w-sm p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('forest')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'forest'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <TreeDeciduous size={15} /> Ma Forêt
            </button>
            <button
              onClick={() => setActiveTab('cave')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cave'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <ClipboardList size={15} /> Ma Grotte
            </button>
          </div>
        </nav>

        {/* Main View Area */}
        <main className="flex-1 pb-20 animate-in fade-in duration-300">
          {activeTab === 'forest' ? <ForestView /> : <CaveView />}
        </main>

        {/* Dynamic Footer Info */}
        <footer className="w-full py-4 text-center text-[10px] text-slate-500 border-t border-slate-900 bg-slate-950/40">
          <p>© 2026 Forêt Mixte Score — 100% Fonctionnel Hors-ligne (PWA)</p>
          <p className="mt-1 font-semibold text-slate-600">
            Conçu pour smartphones — Forest Shuffle Score Companion
          </p>
        </footer>

      </div>
    </GameProvider>
  );
};

export default App;
