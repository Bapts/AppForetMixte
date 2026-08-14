import levenshtein from 'fast-levenshtein';
import { cardsData } from '../store/useGameStore';

export const findClosestCardName = (ocrText: string): string | null => {
  if (!ocrText || ocrText.trim().length < 3) return null;

  // Clean OCR text: remove special chars, normalize spaces, lowercase
  const cleanText = ocrText
    .toLowerCase()
    .replace(/[^\w\sàéèêëîïôöùüç]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanText.length < 3) return null;

  let bestMatch: string | null = null;
  let bestScore = Infinity;

  // Define a threshold (max distance to be considered a match)
  // E.g. max 5 typos allowed, or scaled based on string length
  const MAX_DISTANCE = 5;

  for (const card of cardsData) {
    const targetName = card.name.toLowerCase().trim();
    
    // We can also check if the OCR text contains the target name exactly to be safe
    if (cleanText.includes(targetName)) {
      return card.name;
    }

    const distance = levenshtein.get(cleanText, targetName);
    
    if (distance < bestScore) {
      bestScore = distance;
      bestMatch = card.name;
    }
  }

  // Return the match if it's within our acceptable threshold
  if (bestMatch && bestScore <= MAX_DISTANCE) {
    return bestMatch;
  }

  return null;
};
