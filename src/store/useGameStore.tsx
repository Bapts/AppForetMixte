import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerForest, Card, TreeInstance } from '../types/game';
import cardsDataRaw from '../data/foret_mixte_cards.json';

// Cast JSON data safely
export const cardsData = cardsDataRaw as Card[];

interface GameContextType {
  forest: PlayerForest;
  tilleulBonus: 'majority' | 'tied' | 'none';
  addTree: (treeCard: Card) => string;
  removeTree: (id: string) => void;
  addCardToSlot: (treeInstanceId: string, slot: 'top' | 'bottom' | 'left' | 'right', card: Card | null) => void;
  removeCardFromSlot: (treeInstanceId: string, slot: 'top' | 'bottom' | 'left' | 'right') => void;
  addCardToCave: (card: Card) => void;
  removeCardFromCave: (index: number) => void;
  setTilleulBonus: (bonus: 'majority' | 'tied' | 'none') => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'foret_mixte_score_forest_state_v1';
const LOCAL_STORAGE_TILLEUL_KEY = 'foret_mixte_score_tilleul_bonus_v1';

const initialForest: PlayerForest = {
  trees: [],
  caveCards: []
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [forest, setForest] = useState<PlayerForest>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved forest state', e);
      }
    }
    return initialForest;
  });

  const [tilleulBonus, setTilleulBonus] = useState<'majority' | 'tied' | 'none'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_TILLEUL_KEY);
    return (saved as 'majority' | 'tied' | 'none') || 'majority';
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(forest));
  }, [forest]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TILLEUL_KEY, tilleulBonus);
  }, [tilleulBonus]);

  const addTree = (treeCard: Card): string => {
    const newId = `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTree: TreeInstance = {
      id: newId,
      treeCard,
      slots: {
        top: null,
        bottom: null,
        left: null,
        right: null
      }
    };
    setForest(prev => ({
      ...prev,
      trees: [...prev.trees, newTree]
    }));
    return newId;
  };

  const removeTree = (id: string) => {
    setForest(prev => ({
      ...prev,
      trees: prev.trees.filter(t => t.id !== id)
    }));
  };

  const addCardToSlot = (
    treeInstanceId: string,
    slot: 'top' | 'bottom' | 'left' | 'right',
    card: Card | null
  ) => {
    setForest(prev => ({
      ...prev,
      trees: prev.trees.map(tree => {
        if (tree.id === treeInstanceId) {
          return {
            ...tree,
            slots: {
              ...tree.slots,
              [slot]: card
            }
          };
        }
        return tree;
      })
    }));
  };

  const removeCardFromSlot = (treeInstanceId: string, slot: 'top' | 'bottom' | 'left' | 'right') => {
    addCardToSlot(treeInstanceId, slot, null);
  };

  const addCardToCave = (card: Card) => {
    setForest(prev => ({
      ...prev,
      caveCards: [...prev.caveCards, card]
    }));
  };

  const removeCardFromCave = (index: number) => {
    setForest(prev => ({
      ...prev,
      caveCards: prev.caveCards.filter((_, idx) => idx !== index)
    }));
  };

  const resetGame = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser toute la forêt ?')) {
      setForest(initialForest);
      setTilleulBonus('majority');
    }
  };

  return (
    <GameContext.Provider
      value={{
        forest,
        tilleulBonus,
        addTree,
        removeTree,
        addCardToSlot,
        removeCardFromSlot,
        addCardToCave,
        removeCardFromCave,
        setTilleulBonus,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameStore = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameStore must be used within a GameProvider');
  }
  return context;
};
