import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Card } from '../types/game';
import { CardPickerModal } from './CardPickerModal';
import { Plus, Trash2 } from 'lucide-react';

export const CaveView: React.FC = () => {
  const { forest, addCardToCave, removeCardFromCave } = useGameStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleAddGenericCard = () => {
    // Standard generic card structure
    const genericCard: Card = {
      id: 'FM_CAVE_GENERIC',
      name: 'Carte face cachée',
      expansion: 'Base',
      slot: 'Cave',
      cost: 0,
      category: 'Arbre', // Category doesn't affect default scoring in Cave
      scoringRuleDescription: 'Rapporte 1 point fixe par défaut.'
    };
    addCardToCave(genericCard);
  };

  const handleCardSelected = (card: Card) => {
    addCardToCave(card);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            🕳️ Ma Grotte
            <span className="text-xs bg-violet-950 text-violet-400 px-2 py-0.5 rounded-full border border-violet-800 font-normal">
              {forest.caveCards.length} carte(s)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
            Les cartes stockées dans la grotte rapportent généralement 1 point chacune. Certaines cartes comme l'<b>Ours Brun</b> ou le <b>Raton Laveur</b> créent des synergies puissantes avec la grotte.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Quick add */}
          <button
            onClick={handleAddGenericCard}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
            title="Ajouter une carte générique face cachée"
          >
            <Plus size={14} /> +1 Carte Rapide
          </button>
          
          {/* Detailed pick */}
          <button
            onClick={() => setPickerOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus size={14} /> Choisir une carte
          </button>
        </div>
      </div>

      {forest.caveCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/20 border border-slate-850 rounded-2xl text-center">
          <span className="text-3xl mb-2">🕳️</span>
          <p className="text-slate-500 text-xs font-medium">Aucune carte dans la grotte pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {forest.caveCards.map((card, idx) => {
            const isGeneric = card.id === 'FM_CAVE_GENERIC';
            return (
              <div
                key={`${card.id}_${idx}`}
                className="group relative flex flex-col justify-between p-3.5 bg-slate-950 border border-slate-850 rounded-xl hover:border-slate-800 transition-all text-left"
              >
                <div>
                  <h4 className={`text-xs font-black truncate pr-4 ${isGeneric ? 'text-slate-400 italic' : 'text-slate-200'}`}>
                    {card.name}
                  </h4>
                  {!isGeneric && (
                    <span className="text-[9px] bg-slate-900 text-slate-400 px-1 py-0.2 rounded-xs mt-1 inline-block uppercase tracking-wider font-mono">
                      {card.category}
                    </span>
                  )}
                  {isGeneric && (
                    <span className="text-[9px] bg-slate-900 text-slate-500 px-1 py-0.2 rounded-xs mt-1 inline-block uppercase tracking-wider font-mono">
                      Générique
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900/50">
                  <span className="text-[10px] text-slate-400 font-bold font-mono">
                    Score: +1 pt
                  </span>
                  <button
                    onClick={() => removeCardFromCave(idx)}
                    className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                    title="Retirer de la grotte"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Picker Modal */}
      {pickerOpen && (
        <CardPickerModal
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleCardSelected}
          slotType="Cave"
        />
      )}
    </div>
  );
};
