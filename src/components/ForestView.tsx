import React, { useState } from 'react';
import { useGameStore, cardsData } from '../store/useGameStore';
import { Card, SlotType } from '../types/game';
import { CardPickerModal } from './CardPickerModal';
import { ScannerModal, ScanResult } from './ScannerModal';
import { ScanValidationModal } from './ScanValidationModal';
import { Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Camera } from 'lucide-react';

export const ForestView: React.FC = () => {
  const { forest, addTree, removeTree, addCardToSlot, removeCardFromSlot } = useGameStore();

  // Modal control states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<SlotType | null>(null);
  const [activeTreeId, setActiveTreeId] = useState<string | null>(null);
  
  // Scanner states
  const [scannerOpen, setScannerOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

  const getCardByName = (name: string | null): Card | undefined => {
    if (!name) return undefined;
    return cardsData.find(c => c.name === name);
  };

  const handleOpenPicker = (slot: SlotType, treeId: string | null = null) => {
    setActiveSlot(slot);
    setActiveTreeId(treeId);
    setPickerOpen(true);
  };

  const handleCardSelected = (card: Card) => {
    if (activeSlot === 'Tree') {
      addTree(card);
    } else if (activeTreeId && activeSlot) {
      const slot = activeSlot.toLowerCase() as 'top' | 'bottom' | 'left' | 'right';
      addCardToSlot(activeTreeId, slot, card);
    }
  };

  const handleScanComplete = (result: ScanResult) => {
    setScannerOpen(false);
    setLastScanResult(result);
    setValidationOpen(true);
  };

  const handleConfirmScan = (result: ScanResult) => {
    const treeCard = getCardByName(result.tree);
    if (!treeCard) {
      setValidationOpen(false);
      return;
    }

    const newTreeId = addTree(treeCard);
    
    // Attach slots if they were recognized
    if (result.top) {
      const topCard = getCardByName(result.top);
      if (topCard) addCardToSlot(newTreeId, 'top', topCard);
    }
    if (result.bottom) {
      const bottomCard = getCardByName(result.bottom);
      if (bottomCard) addCardToSlot(newTreeId, 'bottom', bottomCard);
    }
    if (result.left) {
      const leftCard = getCardByName(result.left);
      if (leftCard) addCardToSlot(newTreeId, 'left', leftCard);
    }
    if (result.right) {
      const rightCard = getCardByName(result.right);
      if (rightCard) addCardToSlot(newTreeId, 'right', rightCard);
    }

    setValidationOpen(false);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Trees Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            🌳 Ma Forêt
            <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 font-normal">
              {forest.trees.length} arbre(s)
            </span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center justify-center w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all shadow-md active:scale-95"
              title="Scanner un arbre"
            >
              <Camera size={16} />
            </button>
            <button
              onClick={() => handleOpenPicker('Tree')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
        </div>

        {forest.trees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-2xl text-center">
            <span className="text-4xl mb-3">🌲</span>
            <p className="text-slate-400 font-bold mb-1">Votre forêt est vide !</p>
            <p className="text-slate-500 text-xs mb-4 max-w-xs">
              Commencez par ajouter un arbre (Chêne, Bouleau, Hêtre...) puis rattachez-y vos animaux, plantes et insectes.
            </p>
            <button
              onClick={() => handleOpenPicker('Tree')}
              className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <Plus size={16} /> Planter mon premier arbre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {forest.trees.map((tree) => {
              const isAubepine = tree.treeCard.id === 'FM_063';

              return (
                <div
                  key={tree.id}
                  className="relative p-5 bg-slate-950/80 border border-slate-850/80 rounded-2xl shadow-lg hover:border-slate-800/80 transition-all"
                >
                  {/* Delete Tree Button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer cet arbre (${tree.treeCard.name}) et TOUTES ses cartes rattachées ?`)) {
                        removeTree(tree.id);
                      }
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-all z-10"
                    title="Supprimer l'arbre"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* 3x3 Layout for Tree Card + Slots */}
                  <div className="grid grid-cols-3 gap-x-2 gap-y-3 max-w-sm mx-auto items-center mt-2">
                    {/* Top Left - Empty */}
                    <div></div>

                    {/* Top Slot */}
                    <div className="flex justify-center">
                      <SlotButton
                        slotName="top"
                        card={tree.slots.top}
                        onAdd={() => handleOpenPicker('Top', tree.id)}
                        onRemove={() => removeCardFromSlot(tree.id, 'top')}
                        icon={<ArrowUp size={14} />}
                      />
                    </div>

                    {/* Top Right - Empty */}
                    <div></div>

                    {/* Left Slot */}
                    <div className="flex justify-end">
                      {!isAubepine ? (
                        <SlotButton
                          slotName="left"
                          card={tree.slots.left}
                          onAdd={() => handleOpenPicker('Left', tree.id)}
                          onRemove={() => removeCardFromSlot(tree.id, 'left')}
                          icon={<ArrowLeft size={14} />}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-900/10 border border-dashed border-slate-800/30 flex items-center justify-center text-[10px] text-slate-700 select-none">
                          Verrouillé
                        </div>
                      )}
                    </div>

                    {/* Central Tree Card */}
                    <div className="flex flex-col items-center justify-center p-3 bg-emerald-950/60 border border-emerald-850/65 rounded-xl text-center shadow-inner h-24">
                      <span className="text-2xl mb-1">🌳</span>
                      <h4 className="text-xs font-black text-emerald-400 truncate w-full" title={tree.treeCard.name}>
                        {tree.treeCard.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                        Coût : {tree.treeCard.cost}
                      </p>
                      <span className="text-[8px] bg-emerald-900/40 text-emerald-300 px-1 py-0.5 rounded-xs mt-1.5 uppercase tracking-wider">
                        {tree.treeCard.expansion}
                      </span>
                    </div>

                    {/* Right Slot */}
                    <div className="flex justify-start">
                      {!isAubepine ? (
                        <SlotButton
                          slotName="right"
                          card={tree.slots.right}
                          onAdd={() => handleOpenPicker('Right', tree.id)}
                          onRemove={() => removeCardFromSlot(tree.id, 'right')}
                          icon={<ArrowRight size={14} />}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-900/10 border border-dashed border-slate-800/30 flex items-center justify-center text-[10px] text-slate-700 select-none">
                          Verrouillé
                        </div>
                      )}
                    </div>

                    {/* Bottom Left - Empty */}
                    <div></div>

                    {/* Bottom Slot */}
                    <div className="flex justify-center">
                      <SlotButton
                        slotName="bottom"
                        card={tree.slots.bottom}
                        onAdd={() => handleOpenPicker('Bottom', tree.id)}
                        onRemove={() => removeCardFromSlot(tree.id, 'bottom')}
                        icon={<ArrowDown size={14} />}
                      />
                    </div>

                    {/* Bottom Right - Empty */}
                    <div></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Picker Modal */}
      {pickerOpen && activeSlot && (
        <CardPickerModal
          isOpen={pickerOpen}
          onClose={() => {
            setPickerOpen(false);
            setActiveSlot(null);
            setActiveTreeId(null);
          }}
          onSelect={handleCardSelected}
          slotType={activeSlot}
        />
      )}

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Validation Modal */}
      <ScanValidationModal
        isOpen={validationOpen}
        onClose={() => setValidationOpen(false)}
        scanResult={lastScanResult}
        onConfirm={handleConfirmScan}
        getCardByName={getCardByName}
      />
    </div>
  );
};

// Slot Button Component for clean rendering
interface SlotButtonProps {
  slotName: 'top' | 'bottom' | 'left' | 'right';
  card: Card | null;
  onAdd: () => void;
  onRemove: () => void;
  icon: React.ReactNode;
}

const SlotButton: React.FC<SlotButtonProps> = ({ slotName, card, onAdd, onRemove, icon }) => {
  const label =
    slotName === 'top'
      ? 'Haut'
      : slotName === 'bottom'
      ? 'Bas'
      : slotName === 'left'
      ? 'Gauche'
      : 'Droite';

  if (!card) {
    return (
      <button
        onClick={onAdd}
        className="group flex flex-col items-center justify-center w-16 h-16 bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl transition-all active:scale-95"
        title={`Ajouter une carte en ${label}`}
      >
        <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">
          {icon}
        </span>
        <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
          {label}
        </span>
      </button>
    );
  }

  // Set colors based on category
  const isBird = card.category === 'Oiseau';
  const isBat = card.category === 'ChauveSouris';
  const isInsect = card.category === 'Insecte';
  const isMushroom = card.category === 'Champignon';
  const isPlant = card.category === 'Plante';
  const isCervid = card.category === 'Cervide';
  const isBoar = card.category === 'Sanglier';

  const colorClasses = isBird
    ? 'bg-sky-950/40 border-sky-900/50 hover:border-sky-700 text-sky-400'
    : isBat
    ? 'bg-violet-950/40 border-violet-900/50 hover:border-violet-700 text-violet-400'
    : isInsect
    ? 'bg-amber-950/40 border-amber-900/50 hover:border-amber-700 text-amber-400'
    : isMushroom
    ? 'bg-amber-900/10 border-amber-900/35 hover:border-amber-700 text-amber-500'
    : isPlant
    ? 'bg-teal-950/40 border-teal-900/50 hover:border-teal-700 text-teal-400'
    : isCervid
    ? 'bg-orange-950/40 border-orange-900/50 hover:border-orange-700 text-orange-400'
    : isBoar
    ? 'bg-red-950/40 border-red-900/50 hover:border-red-700 text-red-400'
    : 'bg-slate-900 border-slate-800 text-slate-300';

  return (
    <div className="relative group/btn w-20 h-20">
      <div
        className={`flex flex-col items-center justify-center w-full h-full border rounded-xl p-1 text-center overflow-hidden transition-all ${colorClasses}`}
      >
        <span className="text-[10px] font-black tracking-tight leading-tight line-clamp-2" title={card.name}>
          {card.name}
        </span>
        <span className="text-[8px] opacity-75 mt-1 font-mono uppercase tracking-wider">
          {card.category.substring(0, 3)}
        </span>
      </div>

      {/* Delete / Clear button overlay */}
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/btn:opacity-100 transition-opacity"
        title="Retirer la carte"
      >
        <XIcon size={8} />
      </button>
    </div>
  );
};

const XIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
