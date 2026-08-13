import React, { useMemo, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { calculateScore } from '../engine/scoringEngine';
import { X, Trophy, Search, CheckCircle } from 'lucide-react';

interface ScoreSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreSummaryModal: React.FC<ScoreSummaryModalProps> = ({ isOpen, onClose }) => {
  const { forest, tilleulBonus, setTilleulBonus } = useGameStore();
  const [searchTerm, setSearchSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Run the engine
  const breakdown = useMemo(() => {
    return calculateScore(forest, { tilleulBonus });
  }, [forest, tilleulBonus]);

  // Categories present in results
  const categoriesInReport = useMemo(() => {
    const cats = new Set<string>();
    breakdown.details.forEach((item) => cats.add(item.category));
    return Array.from(cats);
  }, [breakdown]);

  // Filtered details
  const filteredDetails = useMemo(() => {
    return breakdown.details.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCat = filterCategory === 'All' || item.category === filterCategory;

      return matchesSearch && matchesCat;
    });
  }, [breakdown, searchTerm, filterCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="flex flex-col w-full max-w-2xl h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={24} />
            <h3 className="text-lg font-black text-white">Bilan de la Partie</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          
          {/* Main Giant Score Display */}
          <div className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-900/40 rounded-2xl text-center shadow-inner overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl translate-x-10 translate-y-10"></div>
            
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest font-mono">
              Score Final
            </span>
            <span className="text-6xl font-black text-white bg-clip-text mt-1 select-all drop-shadow-[0_2px_8px_rgba(34,197,94,0.2)]">
              {breakdown.totalScore}
            </span>
            <span className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
              <CheckCircle size={12} /> Calculé avec succès
            </span>
          </div>

          {/* Breakdown Categories Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Arbres</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">{breakdown.treesPoints} pts</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Faune & Flore</span>
              <span className="text-xl font-black text-sky-400 mt-1 block">{breakdown.wildlifePoints} pts</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Grotte</span>
              <span className="text-xl font-black text-violet-400 mt-1 block">{breakdown.cavePoints} pts</span>
            </div>
          </div>

          {/* Tilleul Bonus settings inside details */}
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                  🏆 Règle Majorité Tilleuls
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                  Le Tilleul attribue 10 points si vous détenez le plus grand nombre de Tilleuls, ou 3 points en cas d'égalité.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <button
                onClick={() => setTilleulBonus('majority')}
                className={`py-2 rounded-lg border font-medium transition-all ${
                  tilleulBonus === 'majority'
                    ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                Majorité (+10)
              </button>
              <button
                onClick={() => setTilleulBonus('tied')}
                className={`py-2 rounded-lg border font-medium transition-all ${
                  tilleulBonus === 'tied'
                    ? 'bg-amber-600/10 border-amber-500/50 text-amber-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                Égalité (+3)
              </button>
              <button
                onClick={() => setTilleulBonus('none')}
                className={`py-2 rounded-lg border font-medium transition-all ${
                  tilleulBonus === 'none'
                    ? 'bg-slate-800 border-slate-700 text-slate-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                Aucun (0)
              </button>
            </div>
          </div>

          {/* Detailed Cards List Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              🔍 Détails des Cartes en Jeu ({breakdown.details.length})
            </h4>

            {/* Filter Subheader */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher une carte calculée..."
                  value={searchTerm}
                  onChange={(e) => setSearchSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto text-[10px] scrollbar-none pb-1">
                <button
                  onClick={() => setFilterCategory('All')}
                  className={`px-2 py-1 rounded-md whitespace-nowrap border ${
                    filterCategory === 'All'
                      ? 'bg-slate-800 border-slate-700 text-white font-bold'
                      : 'bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  Tous
                </button>
                {categoriesInReport.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2 py-1 rounded-md whitespace-nowrap border ${
                      filterCategory === cat
                        ? 'bg-slate-800 border-slate-700 text-white font-bold'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {filteredDetails.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Aucune ligne correspondante.</p>
              ) : (
                filteredDetails.map((item, idx) => {
                  const isTree = item.category === 'Arbre';
                  const isCave = item.slotName === 'Cave';

                  return (
                    <div
                      key={`${item.id}_${idx}`}
                      className="flex items-center justify-between p-3 bg-slate-950 border border-slate-850 rounded-xl hover:border-slate-800 transition-all text-left gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h5 className="font-bold text-xs text-slate-200 truncate">
                            {item.name}
                          </h5>
                          <span
                            className={`text-[8px] px-1 py-0.2 rounded-xs uppercase tracking-wider font-semibold font-mono ${
                              isTree
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                                : isCave
                                ? 'bg-violet-950 text-violet-400 border border-violet-900/50'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {isCave ? 'Grotte' : item.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        <span
                          className={`font-black font-mono text-sm ${
                            item.points > 0
                              ? 'text-emerald-400'
                              : item.points < 0
                              ? 'text-red-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.points > 0 ? `+${item.points}` : item.points} pt{item.points > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition-all shadow-md"
          >
            Fermer le bilan
          </button>
        </div>

      </div>
    </div>
  );
};
