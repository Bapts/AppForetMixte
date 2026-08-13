import React, { useState, useMemo } from 'react';
import { Card, SlotType } from '../types/game';
import { cardsData } from '../store/useGameStore';
import { X, Search, Filter } from 'lucide-react';

interface CardPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (card: Card) => void;
  slotType: SlotType; // Ex: 'Tree', 'Top', 'Bottom', 'Left', 'Right', 'Cave'
}

export const CardPickerModal: React.FC<CardPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  slotType
}) => {
  const [search, setSearch] = useState('');
  const [selectedExpansion, setSelectedExpansion] = useState<'All' | 'Base' | 'Alpes' | 'Lisière'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter cards based on slot first
  const eligibleCards = useMemo(() => {
    return cardsData.filter((card) => {
      if (slotType === 'Cave') {
        // Cave can accept any card
        return true;
      }
      return card.slot.toLowerCase() === slotType.toLowerCase();
    });
  }, [slotType]);

  // Categories available in the current subset
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    eligibleCards.forEach((c) => cats.add(c.category));
    return Array.from(cats);
  }, [eligibleCards]);

  // Final filtered list
  const filteredCards = useMemo(() => {
    return eligibleCards.filter((card) => {
      const matchesSearch =
        card.name.toLowerCase().includes(search.toLowerCase()) ||
        card.category.toLowerCase().includes(search.toLowerCase()) ||
        card.scoringRuleDescription.toLowerCase().includes(search.toLowerCase());

      const matchesExpansion =
        selectedExpansion === 'All' || card.expansion === selectedExpansion;

      const matchesCategory =
        selectedCategory === 'All' || card.category === selectedCategory;

      return matchesSearch && matchesExpansion && matchesCategory;
    });
  }, [eligibleCards, search, selectedExpansion, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="flex flex-col w-full max-w-lg h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">
              Sélectionner :{' '}
              {slotType === 'Tree'
                ? 'un Arbre'
                : slotType === 'Cave'
                ? 'une Carte (Grotte)'
                : `Slot ${
                    slotType === 'Top'
                      ? 'Haut'
                      : slotType === 'Bottom'
                      ? 'Bas'
                      : slotType === 'Left'
                      ? 'Gauche'
                      : 'Droite'
                  }`}
            </h3>
            <p className="text-xs text-slate-400">
              {filteredCards.length} carte(s) disponible(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-950/50 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une carte..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Tag Selectors */}
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
            <button
              onClick={() => setSelectedExpansion('All')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                selectedExpansion === 'All'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Toutes Extensions
            </button>
            <button
              onClick={() => setSelectedExpansion('Base')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                selectedExpansion === 'Base'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Base
            </button>
            <button
              onClick={() => setSelectedExpansion('Alpes')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                selectedExpansion === 'Alpes'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Alpes
            </button>
            <button
              onClick={() => setSelectedExpansion('Lisière')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                selectedExpansion === 'Lisière'
                  ? 'bg-purple-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Lisière
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Toutes Catégories
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-700 text-white font-medium'
                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Card List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900 scrollbar-thin">
          {filteredCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
              <Filter size={32} className="mb-2" />
              <p className="text-sm">Aucune carte correspondante.</p>
            </div>
          ) : (
            filteredCards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  onSelect(card);
                  onClose();
                }}
                className="flex items-start w-full text-left p-3.5 bg-slate-950 hover:bg-slate-800/60 border border-slate-850 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {/* Visual Category Badge/Indicator */}
                <div className="mr-3 flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs ${
                      card.category === 'Arbre'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/65'
                        : card.category === 'Oiseau'
                        ? 'bg-sky-950 text-sky-400 border border-sky-850'
                        : card.category === 'ChauveSouris'
                        ? 'bg-violet-950 text-violet-400 border border-violet-850'
                        : card.category === 'Insecte'
                        ? 'bg-amber-950 text-amber-400 border border-amber-850'
                        : card.category === 'Champignon'
                        ? 'bg-amber-900/30 text-amber-500 border border-amber-800/30'
                        : card.category === 'Plante'
                        ? 'bg-teal-950 text-teal-400 border border-teal-850'
                        : card.category === 'Cervide'
                        ? 'bg-orange-950 text-orange-400 border border-orange-850'
                        : card.category === 'Sanglier'
                        ? 'bg-red-950 text-red-400 border border-red-850'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {card.category.substring(0, 3).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 font-mono">
                    Cost: {card.cost}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h4 className="font-bold text-sm text-slate-100 truncate">
                      {card.name}
                    </h4>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium ${
                        card.expansion === 'Alpes'
                          ? 'bg-indigo-900/40 text-indigo-400'
                          : card.expansion === 'Lisière'
                          ? 'bg-purple-900/40 text-purple-400'
                          : 'bg-slate-800/50 text-slate-400'
                      }`}
                    >
                      {card.expansion}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-2">
                    {card.scoringRuleDescription}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
