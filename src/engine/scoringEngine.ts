import { PlayerForest, ScoreBreakdown, ScoreDetail, Card } from '../types/game';

/**
 * Moteur de calcul de score pour Forêt Mixte
 */
export function calculateScore(
  forest: PlayerForest,
  options: { tilleulBonus?: 'majority' | 'tied' | 'none' } = { tilleulBonus: 'majority' }
): ScoreBreakdown {
  const details: ScoreDetail[] = [];
  let treesPoints = 0;
  let wildlifePoints = 0;
  let cavePoints = 0;

  // --- 1. COLLECTER LES STATISTIQUES GLOBALES ---
  const allCards: Card[] = [];
  const allTrees: Card[] = [];
  const cardsByTreeInstanceId = new Map<string, Card[]>();

  // Dictionnaires de comptage globaux
  const countsByCategory = new Map<string, number>();
  const countsByName = new Map<string, number>();
  const countsByExpansion = new Map<string, number>();

  const incrementCount = (map: Map<string, number>, key: string) => {
    map.set(key, (map.get(key) || 0) + 1);
  };

  // Traiter tous les arbres et leurs cartes rattachées
  forest.trees.forEach((tree) => {
    allTrees.push(tree.treeCard);
    allCards.push(tree.treeCard);
    incrementCount(countsByCategory, tree.treeCard.category);
    incrementCount(countsByName, tree.treeCard.name);
    incrementCount(countsByExpansion, tree.treeCard.expansion);

    const attached: Card[] = [];
    const slots = tree.slots;
    if (slots.top) attached.push(slots.top);
    if (slots.bottom) attached.push(slots.bottom);
    if (slots.left) attached.push(slots.left);
    if (slots.right) attached.push(slots.right);

    cardsByTreeInstanceId.set(tree.id, attached);

    attached.forEach((card) => {
      allCards.push(card);
      incrementCount(countsByCategory, card.category);
      incrementCount(countsByName, card.name);
      incrementCount(countsByExpansion, card.expansion);
    });
  });

  // Collecter les espèces d'arbres uniques
  const uniqueTreeSpecies = new Set(allTrees.map(t => t.name));
  const uniqueTreeCount = uniqueTreeSpecies.size;

  // Identifier les cartes d'altitude (Alpes)
  // Les arbres d'altitude sont Mélèze d'Europe, Pin Cembro, Épicéa commun
  const altitudeTreeNames = ["Mélèze d'Europe", "Pin Cembro", "Épicéa commun"];
  const isAltitudeTree = (treeName: string) => altitudeTreeNames.includes(treeName);

  // Compter le nombre de cartes dans la Grotte
  const caveCount = forest.caveCards.length;

  // --- 2. CALCUL DES SCORES PAR ARBRE ---
  forest.trees.forEach((tree) => {
    const treeCard = tree.treeCard;
    const attached = cardsByTreeInstanceId.get(tree.id) || [];
    const numAttached = attached.length;
    const isFullyOccupied = numAttached === 4;

    let points = 0;
    let desc = '';

    switch (treeCard.id) {
      case 'FM_001': // Chêne
        if (uniqueTreeCount >= 8) {
          points = 10;
          desc = "10 pts (8+ espèces d'arbres différentes).";
        } else {
          points = 0;
          desc = `0 pt (${uniqueTreeCount}/8 espèces d'arbres).`;
        }
        break;

      case 'FM_002': // Hêtre
        const beechCount = countsByName.get('Hêtre') || 0;
        if (beechCount >= 4) {
          points = 5;
          desc = "5 pts (Condition de >= 4 Hêtres validée).";
        } else {
          points = 0;
          desc = `0 pt (${beechCount}/4 Hêtres requis).`;
        }
        break;

      case 'FM_003': // Bouleau
        points = 1;
        desc = "1 pt fixe.";
        break;

      case 'FM_004': // Érable
        points = numAttached;
        desc = `${numAttached} pt(s) (${numAttached} carte(s) rattachée(s)).`;
        break;

      case 'FM_005': // Tilleul
        if (options.tilleulBonus === 'majority') {
          points = 10;
          desc = "10 pts (Bonus majorité Tilleuls).";
        } else if (options.tilleulBonus === 'tied') {
          points = 3;
          desc = "3 pts (Bonus égalité Tilleuls).";
        } else {
          points = 0;
          desc = "0 pt (Pas de bonus Tilleuls).";
        }
        break;

      case 'FM_006': // Marronnier
        points = uniqueTreeCount;
        desc = `${uniqueTreeCount} pt(s) (1 pt par espèce d'Arbre différente).`;
        break;

      case 'FM_007': // Sapin Douglas
        if (isFullyOccupied) {
          points = 5;
          desc = "5 pts (Arbre entièrement occupé).";
        } else {
          points = 0;
          desc = "0 pt (Arbre non entièrement occupé).";
        }
        break;

      case 'FM_008': // Pin sylvestre
        const scotsPineCount = countsByName.get('Pin sylvestre') || 0;
        if (scotsPineCount >= 3) {
          points = 3;
          desc = "3 pts (Condition >= 3 Pins sylvestres validée).";
        } else {
          points = 0;
          desc = `0 pt (${scotsPineCount}/3 Pins sylvestres).`;
        }
        break;

      case 'FM_009': // Pousse d'arbre
        points = 0;
        desc = "0 pt (Support générique).";
        break;

      case 'FM_051': // Mélèze d'Europe (Alpes)
        // 3 points par carte d'altitude de l'extension Alpes rattachée à vos arbres
        // En lisant la règle : "3 points par carte d'altitude de l'extension Alpes rattachée à vos arbres."
        // Les cartes rattachées sont celles sur des emplacements de cartes de nos arbres.
        // On va compter toutes les cartes Alpes rattachées à n'importe quel arbre.
        const totalAlpineAttached = allCards.filter(c => c.expansion === 'Alpes' && c.slot !== 'Tree').length;
        points = totalAlpineAttached * 3;
        desc = `${points} pts (3 pts x ${totalAlpineAttached} carte(s) d'altitude rattachée(s) aux arbres).`;
        break;

      case 'FM_052': // Pin Cembro (Alpes)
        // 4 points si vous avez au moins 2 cartes de l'extension Alpes à proximité (dans votre forêt)
        const totalAlpine = allCards.filter(c => c.expansion === 'Alpes').length;
        if (totalAlpine >= 2) {
          points = 4;
          desc = `4 pts (>= 2 cartes des Alpes présente dans la forêt, total: ${totalAlpine}).`;
        } else {
          points = 0;
          desc = `0 pt (Moins de 2 cartes des Alpes, total: ${totalAlpine}).`;
        }
        break;

      case 'FM_053': // Épicéa commun (Alpes)
        // 2 points par carte Champignon et Plante rattachée à cet Épicéa
        const mushroomsAndPlantsOnThisTree = attached.filter(
          (c) => c.category === 'Champignon' || c.category === 'Plante'
        ).length;
        points = mushroomsAndPlantsOnThisTree * 2;
        desc = `${points} pts (2 pts x ${mushroomsAndPlantsOnThisTree} Champignon(s)/Plante(s) rattaché(s)).`;
        break;

      case 'FM_063': // Aubépine (Lisière)
        points = 4;
        desc = "4 pts fixes (Aubépine - limite de 2 emplacements).";
        break;

      case 'FM_064': // Sureau noir (Lisière)
        // 2 points par Arbuste/Haie dans votre forêt (Aubépine, Sureau, Noisetier sont des arbustes de lisière)
        const totalShrubs = allTrees.filter(
          (t) => t.id === 'FM_063' || t.id === 'FM_064' || t.id === 'FM_065'
        ).length;
        points = totalShrubs * 2;
        desc = `${points} pts (2 pts x ${totalShrubs} Arbuste(s)/Haie(s) dans la forêt).`;
        break;

      case 'FM_065': // Noisetier (Lisière)
        // 3 points si au moins 1 Petit Mammifère y est rattaché
        const hasSmallMammalAttached = attached.some((c) => c.category === 'PetitMammifere');
        if (hasSmallMammalAttached) {
          points = 3;
          desc = "3 pts (Au moins 1 Petit Mammifère rattaché).";
        } else {
          points = 0;
          desc = "0 pt (Aucun Petit Mammifère rattaché).";
        }
        break;

      default:
        points = 0;
        desc = "0 pt (Aucune règle de score spécifique).";
    }

    treesPoints += points;
    details.push({
      id: treeCard.id,
      name: treeCard.name,
      category: 'Arbre',
      points,
      description: desc,
      treeInstanceId: tree.id,
      slotName: 'Tree'
    });
  });

  // --- 3. CALCUL DES SCORES DES CARTES DE FAUNE & FLORE ---
  forest.trees.forEach((tree) => {
    const attached = cardsByTreeInstanceId.get(tree.id) || [];
    const treeCard = tree.treeCard;

    attached.forEach((card) => {
      let points = 0;
      let desc = '';

      // Trouver l'emplacement de la carte
      let slotName: 'top' | 'bottom' | 'left' | 'right' | undefined;
      if (tree.slots.top?.id === card.id) slotName = 'top';
      else if (tree.slots.bottom?.id === card.id) slotName = 'bottom';
      else if (tree.slots.left?.id === card.id) slotName = 'left';
      else if (tree.slots.right?.id === card.id) slotName = 'right';

      switch (card.id) {
        // --- OISEAUX ---
        case 'FM_010': // Autour des palombes
          const totalBirds = countsByCategory.get('Oiseau') || 0;
          points = totalBirds * 3;
          desc = `${points} pts (3 pts x ${totalBirds} Oiseau(x) dans la forêt).`;
          break;

        case 'FM_011': // Chouette hulotte
          const birds = countsByCategory.get('Oiseau') || 0;
          const bats = countsByCategory.get('ChauveSouris') || 0;
          points = birds + bats;
          desc = `${points} pts (1 pt par Oiseau [${birds}] et Chauve-souris [${bats}]).`;
          break;

        case 'FM_012': // Bouvreuil pivoine
          const totalInsects = countsByCategory.get('Insecte') || 0;
          points = totalInsects * 2;
          desc = `${points} pts (2 pts x ${totalInsects} Insecte(s) dans la forêt).`;
          break;

        case 'FM_013': // Pic noir
          const totalFullyOccupiedTrees = forest.trees.filter(
            (t) => {
              const att = cardsByTreeInstanceId.get(t.id) || [];
              return att.length === 4;
            }
          ).length;
          points = totalFullyOccupiedTrees * 2;
          desc = `${points} pts (2 pts x ${totalFullyOccupiedTrees} Arbre(s) entièrement occupé(s)).`;
          break;

        case 'FM_014': // Grand Tétras
          const totalMushrooms = countsByCategory.get('Champignon') || 0;
          points = totalMushrooms * 3;
          desc = `${points} pts (3 pts x ${totalMushrooms} Champignon(s) dans la forêt).`;
          break;

        case 'FM_015': // Rougegorge
          points = 1;
          desc = "1 pt fixe (Effet rejouer inclus).";
          break;

        case 'FM_054': // Aigle royal (Alpes)
          // 10 points si placé sur un arbre abritant un Petit Mammifère
          const hasSmallMammalAttachedToThisTree = attached.some(c => c.category === 'PetitMammifere');
          if (hasSmallMammalAttachedToThisTree) {
            points = 10;
            desc = "10 pts (L'arbre abrite au moins 1 Petit Mammifère).";
          } else {
            points = 0;
            desc = "0 pt (Aucun Petit Mammifère sur cet arbre).";
          }
          break;

        case 'FM_055': // Lagopède alpin (Alpes)
          // 3 points par carte de l'extension Alpes dans votre forêt
          const totalAlpes = allCards.filter(c => c.expansion === 'Alpes').length;
          points = totalAlpes * 3;
          desc = `${points} pts (3 pts x ${totalAlpes} carte(s) des Alpes).`;
          break;

        case 'FM_056': // Chocard à bec jaune (Alpes)
          // 2 points par Oiseau et par carte d'altitude
          // "2 points par Oiseau et par carte d'altitude" -> 2 points par oiseau, et 2 points par carte d'altitude.
          const birdsCount = countsByCategory.get('Oiseau') || 0;
          const altitudeCount = allCards.filter(c => c.expansion === 'Alpes' && (c.slot === 'Tree' || isAltitudeTree(c.name))).length; // Simplification d'altitude
          points = (birdsCount + altitudeCount) * 2;
          desc = `${points} pts (2 pts x [${birdsCount} Oiseau(x) + ${altitudeCount} carte(s) d'altitude]).`;
          break;

        case 'FM_066': // Geai des chênes (Lisière)
          // 2 points par Chêne et par Aubépine dans votre forêt
          const oakAndHawthornCount = (countsByName.get('Chêne') || 0) + (countsByName.get('Aubépine') || 0);
          points = oakAndHawthornCount * 2;
          desc = `${points} pts (2 pts x ${oakAndHawthornCount} Chêne(s) / Aubépine(s)).`;
          break;

        // --- CHAUVES-SOURIS ---
        case 'FM_016': // Barbastelle d'Europe
          // Compter le nombre d'espèces de chauves-souris uniques rattachées
          const batCards = allCards.filter(c => c.category === 'ChauveSouris');
          const uniqueBats = new Set(batCards.map(c => c.name));
          const totalBatsOfSameSpecies = countsByName.get(card.name) || 0; // Barbastelles
          const allBats = batCards.length;

          if (uniqueBats.size >= 3) {
            points = allBats * 5; // 5 pts par Chauve-souris dans la forêt
            desc = `${points} pts (5 pts x ${allBats} Chauve(s)-souris car >= 3 espèces uniques, total: ${uniqueBats.size}).`;
          } else {
            points = 0;
            desc = `0 pt (< 3 espèces de chauve-souris, total: ${uniqueBats.size}).`;
          }
          break;

        case 'FM_017': // Grand Rhinolophe
          const totalBatsCount = countsByCategory.get('ChauveSouris') || 0;
          if (totalBatsCount >= 3) {
            points = 5;
            desc = `5 pts (>= 3 Chauves-souris dans la forêt, total: ${totalBatsCount}).`;
          } else {
            points = 0;
            desc = `0 pt (< 3 Chauves-souris dans la forêt, total: ${totalBatsCount}).`;
          }
          break;

        case 'FM_018': // Oreillard roux
          const batsInForestCount = countsByCategory.get('ChauveSouris') || 0;
          points = batsInForestCount;
          desc = `${points} pt(s) (1 pt par Chauve-souris dans la forêt).`;
          break;

        case 'FM_019': // Pipistrelle commune
          // 2 points si associée à une carte de la catégorie Insecte sous le même arbre
          const hasInsectOnThisTree = attached.some(c => c.category === 'Insecte');
          if (hasInsectOnThisTree) {
            points = 2;
            desc = "2 pts (Associée à un Insecte sur le même arbre).";
          } else {
            points = 0;
            desc = "0 pt (Aucun Insecte sur le même arbre).";
          }
          break;

        // --- INSECTES ---
        case 'FM_020': // Paon du jour
          // 3 points s'il y a au moins une Plante sous le même arbre
          const hasPlantOnThisTree = attached.some(c => c.category === 'Plante');
          if (hasPlantOnThisTree) {
            points = 3;
            desc = "3 pts (Une Plante est présente au pied de l'arbre).";
          } else {
            points = 0;
            desc = "0 pt (Aucune Plante au pied de l'arbre).";
          }
          break;

        case 'FM_033': // Lucane cerf-volant
          const totalInsectsCount = countsByCategory.get('Insecte') || 0;
          points = totalInsectsCount;
          desc = `${points} pt(s) (1 pt par Insecte dans la forêt).`;
          break;

        case 'FM_034': // Luciole
          // 2 points si rattachée à un Bouleau ou à un Érable
          if (treeCard.name === 'Bouleau' || treeCard.name === 'Érable') {
            points = 2;
            desc = `2 pts (Rattachée à un ${treeCard.name}).`;
          } else {
            points = 0;
            desc = `0 pt (Rattachée à un ${treeCard.name} au lieu d'un Bouleau/Érable).`;
          }
          break;

        case 'FM_035': // Coccinelle
          const insectsCount = countsByCategory.get('Insecte') || 0;
          const mushroomsCount = countsByCategory.get('Champignon') || 0;
          points = insectsCount + mushroomsCount;
          desc = `${points} pts (1 pt par Insecte [${insectsCount}] et par Champignon [${mushroomsCount}]).`;
          break;

        case 'FM_036': // Abeille mellifère
          const lindenCount = countsByName.get('Tilleul') || 0;
          points = lindenCount * 3;
          desc = `${points} pts (3 pts x ${lindenCount} Tilleul(s) dans la forêt).`;
          break;

        case 'FM_067': // Machaon (Lisière)
          // 3 points s'il est rattaché à une Plante de lisière
          // Les plantes de lisière sont : Lierre terrestre, Genêt à balais.
          const hasEdgePlantOnThisTree = attached.some(
            c => c.category === 'Plante' && (c.id === 'FM_071' || c.id === 'FM_072')
          );
          if (hasEdgePlantOnThisTree) {
            points = 3;
            desc = "3 pts (Rattaché à un arbre possédant une Plante de lisière).";
          } else {
            points = 0;
            desc = "0 pt (Aucune Plante de lisière sur cet arbre).";
          }
          break;

        // --- CHAMPIGNONS ---
        case 'FM_021': // Amanite tue-mouches
          points = 0;
          desc = "0 pt (Effet pioche de cartes).";
          break;

        case 'FM_022': // Cèpe de Bordeaux
          const mushroomsTotal = countsByCategory.get('Champignon') || 0;
          points = mushroomsTotal * 2;
          desc = `${points} pts (2 pts x ${mushroomsTotal} Champignon(s) dans la forêt).`;
          break;

        case 'FM_023': // Pied-de-mouton
          const mushCount = countsByCategory.get('Champignon') || 0;
          if (mushCount >= 3) {
            points = 3;
            desc = `3 pts (>= 3 Champignons dans la forêt, total: ${mushCount}).`;
          } else {
            points = 0;
            desc = `0 pt (< 3 Champignons, total: ${mushCount}).`;
          }
          break;

        case 'FM_024': // Chanterelle
          const mushs = countsByCategory.get('Champignon') || 0;
          const plants = countsByCategory.get('Plante') || 0;
          points = mushs + plants;
          desc = `${points} pts (1 pt par Champignon [${mushs}] et par Plante [${plants}]).`;
          break;

        case 'FM_025': // Coprin chevelu
          const coprinCount = countsByName.get('Coprin chevelu') || 0;
          points = coprinCount * 2;
          desc = `${points} pts (2 pts x ${coprinCount} Coprin(s) chevelu(s) dans la forêt).`;
          break;

        // --- PLANTES ---
        case 'FM_026': // Grande Ortie
          const insectsOnThisTree = attached.filter(c => c.category === 'Insecte').length;
          points = insectsOnThisTree * 1;
          desc = `${points} pt(s) (1 pt x ${insectsOnThisTree} Insecte(s) rattaché(s) à cet arbre).`;
          break;

        case 'FM_027': // Mûre sauvage
          const plantsTotal = countsByCategory.get('Plante') || 0;
          points = plantsTotal * 2;
          desc = `${points} pts (2 pts x ${plantsTotal} Plante(s) dans la forêt).`;
          break;

        case 'FM_028': // Fougère
          const fernCount = countsByName.get('Fougère') || 0;
          if (fernCount >= 3) {
            points = fernCount * 3;
            desc = `${points} pts (3 pts x ${fernCount} Fougère(s) car >= 3 Fougères, total: ${fernCount}).`;
          } else {
            points = 0;
            desc = `0 pt (< 3 Fougères dans la forêt, total: ${fernCount}).`;
          }
          break;

        case 'FM_029': // Mousse
          points = 1;
          desc = "1 pt fixe.";
          break;

        case 'FM_061': // Edelweiss (Alpes)
          // 5 points si vous avez au moins 3 espèces de Plantes différentes
          const plantCards = allCards.filter(c => c.category === 'Plante');
          const uniquePlants = new Set(plantCards.map(c => c.name));
          if (uniquePlants.size >= 3) {
            points = 5;
            desc = `5 pts (>= 3 espèces de Plantes différentes, total: ${uniquePlants.size}).`;
          } else {
            points = 0;
            desc = `0 pt (< 3 espèces de Plantes différentes, total: ${uniquePlants.size}).`;
          }
          break;

        case 'FM_062': // Gentiane alpine (Alpes)
          // 3 points par Gentiane alpine si combinée avec un Épicéa ou un Mélèze
          if (treeCard.name === 'Épicéa commun' || treeCard.name === "Mélèze d'Europe") {
            points = 3;
            desc = `3 pts (Rattachée à un ${treeCard.name}).`;
          } else {
            points = 0;
            desc = `0 pt (Rattachée à un ${treeCard.name} au lieu d'un Épicéa/Mélèze).`;
          }
          break;

        case 'FM_071': // Lierre terrestre (Lisière)
          // 2 points par Arbre ayant un Lierre à sa base
          // On va compter tous les arbres de la forêt qui ont un Lierre terrestre (FM_071) sur leur slot "bottom"
          const treesWithIvy = forest.trees.filter((t) => t.slots.bottom?.id === 'FM_071').length;
          points = treesWithIvy * 2;
          desc = `${points} pts (2 pts x ${treesWithIvy} arbre(s) avec du Lierre terrestre à sa base).`;
          break;

        case 'FM_072': // Genêt à balais (Lisière)
          // 2 points par Plante et par Insecte dans votre lisière (extension Lisière)
          const edgePlants = allCards.filter(c => c.expansion === 'Lisière' && c.category === 'Plante').length;
          const edgeInsects = allCards.filter(c => c.expansion === 'Lisière' && c.category === 'Insecte').length;
          points = (edgePlants + edgeInsects) * 2;
          desc = `${points} pts (2 pts x [${edgePlants} Plante(s) de lisière + ${edgeInsects} Insecte(s) de lisière]).`;
          break;

        // --- AMPHIBIENS ---
        case 'FM_030': // Crapaud commun
          const totalAmphibians = countsByCategory.get('Amphibien') || 0;
          points = totalAmphibians * 1;
          desc = `${points} pt(s) (1 pt x ${totalAmphibians} Amphibien(s) dans la forêt).`;
          break;

        case 'FM_031': // Salamandre tachetée
          // 3 points par Amphibien si vous avez au moins 1 Sanglier/Marcassin dans votre forêt
          const wildBoarCount = (countsByName.get('Sanglier') || 0) + (countsByName.get('Marcassin') || 0);
          const amphibiansCount = countsByCategory.get('Amphibien') || 0;
          if (wildBoarCount >= 1) {
            points = amphibiansCount * 3;
            desc = `${points} pts (3 pts x ${amphibiansCount} Amphibien(s) car >= 1 Sanglier/Marcassin, total: ${wildBoarCount}).`;
          } else {
            points = 0;
            desc = `0 pt (Aucun Sanglier/Marcassin dans la forêt).`;
          }
          break;

        case 'FM_032': // Triton alpestre
          // 2 points par Amphibien et Insecte sous le même arbre
          const amphibiansOnThisTree = attached.filter(c => c.category === 'Amphibien').length;
          const insectsOnThisTreeCount = attached.filter(c => c.category === 'Insecte').length;
          const totalOnThisTree = amphibiansOnThisTree + insectsOnThisTreeCount;
          points = totalOnThisTree * 2;
          desc = `${points} pts (2 pts x [${amphibiansOnThisTree} Amphibien(s) + ${insectsOnThisTreeCount} Insecte(s)] sur cet arbre).`;
          break;

        // --- PETITS MAMMIFÈRES ---
        case 'FM_037': // Loir gris
          points = 1;
          desc = "1 pt fixe (Permet d'ajouter des cartes à la Grotte).";
          break;

        case 'FM_038': // Écureuil roux
          // 5 points si rattaché à un Chêne
          if (treeCard.name === 'Chêne') {
            points = 5;
            desc = "5 pts (Rattaché à un Chêne).";
          } else {
            points = 0;
            desc = `0 pt (Rattaché à un ${treeCard.name} au lieu d'un Chêne).`;
          }
          break;

        case 'FM_039': // Hérisson
          // 2 points si placé au pied d'un arbre comportant une Plante
          const plantOnThisTree = attached.some(c => c.category === 'Plante');
          if (plantOnThisTree) {
            points = 2;
            desc = "2 pts (L'arbre possède une Plante).";
          } else {
            points = 0;
            desc = "0 pt (Aucune Plante sur cet arbre).";
          }
          break;

        case 'FM_040': // Lièvre d'Europe
          const hareCount = countsByName.get("Lièvre d'Europe") || 0;
          points = hareCount;
          desc = `${points} pt(s) (1 pt x ${hareCount} Lièvre(s) d'Europe dans la forêt).`;
          break;

        case 'FM_041': // Blaireau
          // 2 points par Petit Mammifère dans votre forêt
          const smallMammals = countsByCategory.get('PetitMammifere') || 0;
          points = smallMammals * 2;
          desc = `${points} pts (2 pts x ${smallMammals} Petit(s) Mammifère(s) dans la forêt).`;
          break;

        case 'FM_042': // Raton laveur
          // 3 points si au moins 2 cartes sont stockées dans votre Grotte
          if (caveCount >= 2) {
            points = 3;
            desc = `3 pts (>= 2 cartes dans la Grotte, total: ${caveCount}).`;
          } else {
            points = 0;
            desc = `0 pt (Moins de 2 cartes dans la Grotte, total: ${caveCount}).`;
          }
          break;

        case 'FM_057': // Bouquetin des Alpes (Alpes)
          // 4 points par Bouquetin si au moins 2 Bouquetins sont présents dans votre forêt
          const bouquetinCount = countsByName.get('Bouquetin des Alpes') || 0;
          if (bouquetinCount >= 2) {
            points = bouquetinCount * 4;
            desc = `${points} pts (4 pts x ${bouquetinCount} Bouquetin(s) des Alpes dans la forêt).`;
          } else {
            points = 0;
            desc = `0 pt (< 2 Bouquetins des Alpes dans la forêt).`;
          }
          break;

        case 'FM_058': // Chamois (Alpes)
          // 3 points par Chamois s'il est rattaché à un arbre d'altitude (Mélèze/Pin Cembro/Épicéa)
          const isTreeAltitude = isAltitudeTree(treeCard.name);
          if (isTreeAltitude) {
            points = 3;
            desc = `3 pts (Rattaché à un arbre d'altitude : ${treeCard.name}).`;
          } else {
            points = 0;
            desc = `0 pt (Rattaché à un ${treeCard.name} qui n'est pas d'altitude).`;
          }
          break;

        case 'FM_059': // Marmotte (Alpes)
          points = 1;
          desc = "1 pt fixe (Permet d'ajouter 2 cartes à la Grotte).";
          break;

        case 'FM_060': // Chèvre sauvage (Alpes)
          // 2 points par espèce d'Arbre d'altitude présente dans votre forêt
          const uniqueAltitudeTreesInForest = Array.from(uniqueTreeSpecies).filter(isAltitudeTree).length;
          points = uniqueAltitudeTreesInForest * 2;
          desc = `${points} pts (2 pts x ${uniqueAltitudeTreesInForest} espèce(s) d'Arbre d'altitude présente(s)).`;
          break;

        case 'FM_069': // Belette (Lisière)
          // 2 points par Insecte présent sur le même arbre
          const insectsOnThisTreeBelette = attached.filter(c => c.category === 'Insecte').length;
          points = insectsOnThisTreeBelette * 2;
          desc = `${points} pts (2 pts x ${insectsOnThisTreeBelette} Insecte(s) présent(s) sur le même arbre).`;
          break;

        case 'FM_070': // Muscardin (Lisière)
          // 3 points s'il est rattaché à un Sureau, Noisetier ou Mûre sauvage
          const isSureauOrNoisetier = treeCard.name === 'Sureau noir' || treeCard.name === 'Noisetier';
          const hasWildBlackberry = attached.some(c => c.name === 'Mûre sauvage');
          if (isSureauOrNoisetier || hasWildBlackberry) {
            points = 3;
            desc = "3 pts (Rattaché à un Sureau, Noisetier ou un arbre avec Mûre sauvage).";
          } else {
            points = 0;
            desc = "0 pt (Rempli aucune condition de support pour le Muscardin).";
          }
          break;

        // --- GRAND CARNIVORE ---
        case 'FM_043': // Lynx
          // 10 points si vous avez au moins 1 Cervidé dans votre forêt
          const totalCervids = countsByCategory.get('Cervide') || 0;
          if (totalCervids >= 1) {
            points = 10;
            desc = `10 pts (>= 1 Cervidé présent, total: ${totalCervids}).`;
          } else {
            points = 0;
            desc = "0 pt (Aucun Cervidé dans la forêt).";
          }
          break;

        case 'FM_044': // Loup gris
          // 5 points par Cervidé dans votre forêt
          const cervidsTotal = countsByCategory.get('Cervide') || 0;
          points = cervidsTotal * 5;
          desc = `${points} pts (5 pts x ${cervidsTotal} Cervidé(s) dans la forêt).`;
          break;

        case 'FM_045': // Ours brun
          // 2 points par carte déposée dans votre Grotte
          points = caveCount * 2;
          desc = `${points} pts (2 pts x ${caveCount} carte(s) dans la Grotte).`;
          break;

        // --- CERVIDÉS ---
        case 'FM_046': // Chevreuil
          const deerCount = countsByName.get('Chevreuil') || 0;
          points = deerCount * 3;
          desc = `${points} pts (3 pts x ${deerCount} Chevreuil(s) dans la forêt).`;
          break;

        case 'FM_047': // Cerf élaphe
          // 1 point par carte Arbre et par Cervidé dans votre forêt
          const treesTotalCount = allTrees.length;
          const cervidsTotalCount = countsByCategory.get('Cervide') || 0;
          points = treesTotalCount + cervidsTotalCount;
          desc = `${points} pts (1 pt par Arbre [${treesTotalCount}] et par Cervidé [${cervidsTotalCount}]).`;
          break;

        case 'FM_048': // Élan
          const totalDeers = countsByCategory.get('Cervide') || 0;
          if (totalDeers >= 4) {
            points = 10;
            desc = `10 pts (>= 4 Cervidés dans la forêt, total: ${totalDeers}).`;
          } else {
            points = 0;
            desc = `0 pt (< 4 Cervidés, total: ${totalDeers}).`;
          }
          break;

        case 'FM_068': // Cerf Axis (Lisière)
          // 4 points par Cerf Axis si rattaché près d'un Arbuste ou d'un Sureau
          // Arbuste: Aubépine, Sureau, Noisetier
          const isShrub = treeCard.id === 'FM_063' || treeCard.id === 'FM_064' || treeCard.id === 'FM_065';
          if (isShrub) {
            points = 4;
            desc = `4 pts (Rattaché près d'un Arbuste ou d'un Sureau : ${treeCard.name}).`;
          } else {
            points = 0;
            desc = `0 pt (Rattaché près d'un ${treeCard.name} qui n'est pas un Arbuste de lisière).`;
          }
          break;

        // --- SANGLIERS ---
        case 'FM_049': // Sanglier
          // 2 points par Marcassin et par Sanglier dans votre forêt
          const piglets = countsByName.get('Marcassin') || 0;
          const boars = countsByName.get('Sanglier') || 0;
          points = (piglets + boars) * 2;
          desc = `${points} pts (2 pts x [${boars} Sanglier(s) + ${piglets} Marcassin(s)]).`;
          break;

        case 'FM_050': // Marcassin
          // 1 point par Sanglier ou Marcassin dans votre forêt
          const pigletsCount = countsByName.get('Marcassin') || 0;
          const boarsCount = countsByName.get('Sanglier') || 0;
          points = pigletsCount + boarsCount;
          desc = `${points} pts (1 pt x [${boarsCount} Sanglier(s) + ${pigletsCount} Marcassin(s)]).`;
          break;

        default:
          points = 0;
          desc = "0 pt (Aucune règle de score spécifique ou effet de jeu uniquement).";
      }

      wildlifePoints += points;
      details.push({
        id: card.id,
        name: card.name,
        category: card.category,
        points,
        description: desc,
        treeInstanceId: tree.id,
        slotName
      });
    });
  });

  // --- 4. CALCUL DES POINTS DE LA GROTTE ---
  // Chaque carte dans la Grotte rapporte 1 point
  forest.caveCards.forEach((card) => {
    const points = 1;
    const desc = "1 pt par carte de la Grotte.";
    cavePoints += points;
    details.push({
      id: card.id,
      name: card.name,
      category: card.category,
      points,
      description: desc,
      slotName: 'Cave'
    });
  });

  const totalScore = treesPoints + wildlifePoints + cavePoints;

  return {
    treesPoints,
    wildlifePoints,
    cavePoints,
    totalScore,
    details
  };
}
