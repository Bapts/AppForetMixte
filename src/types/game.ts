export type SlotType = 'Tree' | 'Top' | 'Bottom' | 'Left' | 'Right' | 'Cave';

export type CategoryTag =
  | 'Arbre'
  | 'Oiseau'
  | 'ChauveSouris'
  | 'Insecte'
  | 'Champignon'
  | 'Plante'
  | 'Cervide'
  | 'Sanglier'
  | 'Amphibien'
  | 'PetitMammifere'
  | 'GrandCarnivore';

export interface Card {
  id: string;
  name: string;
  expansion: 'Base' | 'Alpes' | 'Lisière';
  slot: SlotType;
  cost: number;
  category: CategoryTag;
  scoringRuleDescription: string;
}

export interface TreeSlot {
  top: Card | null;
  bottom: Card | null;
  left: Card | null;
  right: Card | null;
}

export interface TreeInstance {
  id: string;
  treeCard: Card; // Ex: Chêne, Hêtre, Pousse d'arbre
  slots: TreeSlot;
}

export interface PlayerForest {
  trees: TreeInstance[];
  caveCards: Card[];
}

export interface ScoreDetail {
  id: string; // FM_XXX
  name: string;
  category: CategoryTag;
  points: number;
  description: string;
  treeInstanceId?: string; // If attached to a specific tree
  slotName?: 'top' | 'bottom' | 'left' | 'right' | 'Tree' | 'Cave';
}

export interface ScoreBreakdown {
  treesPoints: number;
  wildlifePoints: number;
  cavePoints: number;
  totalScore: number;
  details: ScoreDetail[];
}
