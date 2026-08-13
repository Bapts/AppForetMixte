import React from 'react';
import { ScanResult } from './ScannerModal';
import { Card } from '../types/game';
import { Check, X } from 'lucide-react';

interface ScanValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: ScanResult | null;
  onConfirm: (result: ScanResult) => void;
  getCardByName: (name: string | null) => Card | undefined;
}

export const ScanValidationModal: React.FC<ScanValidationModalProps> = ({
  isOpen,
  onClose,
  scanResult,
  onConfirm,
  getCardByName,
}) => {
  if (!isOpen || !scanResult) return null;

  const renderCardInfo = (label: string, cardName: string | null) => {
    if (!cardName) return null;
    const card = getCardByName(cardName);
    
    return (
      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <span className="text-xs text-slate-400 font-bold uppercase w-16">{label}</span>
        <div className="flex-1 px-3">
          {card ? (
            <span className="text-sm font-bold text-emerald-400">{card.name}</span>
          ) : (
            <span className="text-sm text-red-400">"{cardName}" (Inconnu)</span>
          )}
        </div>
        {card ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-red-500" />}
      </div>
    );
  };

  const hasTree = !!getCardByName(scanResult.tree);
  const totalFound = [scanResult.tree, scanResult.top, scanResult.bottom, scanResult.left, scanResult.right]
    .filter(name => !!getCardByName(name)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h3 className="text-lg font-bold text-white mb-2">Résultat du Scan</h3>
        
        {totalFound === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-400 mb-4">L'IA n'a reconnu aucune carte sur cette image.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold w-full"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <p className="text-xs text-slate-400">
              Vérifiez les cartes détectées avant de les ajouter à votre forêt :
            </p>

            <div className="space-y-2">
              {renderCardInfo('Arbre', scanResult.tree)}
              {renderCardInfo('Haut', scanResult.top)}
              {renderCardInfo('Bas', scanResult.bottom)}
              {renderCardInfo('Gauche', scanResult.left)}
              {renderCardInfo('Droite', scanResult.right)}
            </div>

            {!hasTree && (
               <div className="p-3 bg-amber-950/50 border border-amber-900/50 rounded-xl text-amber-400 text-xs">
                 Attention : Aucun arbre central n'a été reconnu. Les cartes seront ignorées si vous ne les rattachez pas à un arbre.
               </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => onConfirm(scanResult)}
                disabled={!hasTree}
                className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg"
              >
                <Check size={16} /> Ajouter tout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
