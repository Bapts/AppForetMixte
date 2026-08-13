import OpenAI from 'openai';
import cardsData from '../src/data/foret_mixte_cards.json' assert { type: 'json' };

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY_SERVER_ONLY,
});

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const prompt = `
Tu es un expert du jeu de société "Forêt Mixte" (Forest Shuffle).
Voici une image représentant une carte Arbre au centre, avec potentiellement d'autres cartes glissées en dessous (en haut, en bas, à gauche, ou à droite).
Ton objectif est de lire le nom exact de chaque carte visible et de les associer à leur position.

La liste EXACTE des noms de cartes possibles est la suivante (ne renvoie JAMAIS un nom qui n'est pas dans cette liste) :
${cardsData.map(c => c.name).join(', ')}

Format de réponse attendu (JSON strict) :
{
  "tree": "Nom de l'arbre au centre" (ou null),
  "top": "Nom de la carte glissée en haut" (ou null),
  "bottom": "Nom de la carte glissée en bas" (ou null),
  "left": "Nom de la carte glissée à gauche" (ou null),
  "right": "Nom de la carte glissée à droite" (ou null)
}

Si tu n'es pas sûr, mets null.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(result);

  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: 'Failed to process image' });
  }
}
