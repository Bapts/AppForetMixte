# 🌳 Forêt Mixte - Score Companion

Une application compagnon (Progressive Web App - PWA) non officielle pour le jeu de société **Forêt Mixte** (Forest Shuffle). Elle permet aux joueurs de recréer virtuellement leur forêt pour calculer automatiquement et instantanément leur score en fin de partie.

## ✨ Fonctionnalités

- **🪵 Reconstruction de la Forêt** : Ajoutez vos arbres et rattachez-y toutes vos cartes (haut, bas, gauche, droite).
- **📸 Scan IA par Appareil Photo** : Prenez en photo un arbre et ses cartes rattachées ; une Intelligence Artificielle (OpenAI) détectera automatiquement les cartes pour vous faire gagner un temps précieux lors de la saisie.
- **🦇 Gestion de la Grotte** : Enregistrez les cartes que vous avez mises de côté dans votre grotte pour le décompte final.
- **🧮 Calcul Automatique du Score** : Le moteur de l'application connaît toutes les règles de scoring du jeu de base (Arbres, Oiseaux, Chauve-souris, Insectes, Champignons, Plantes, etc.) et de ses extensions (Alpes, Lisière).
- **📱 100% PWA & Hors-ligne** : Installez l'application sur votre smartphone (iOS/Android) pour l'utiliser sans connexion internet (Note : la fonctionnalité de *Scan IA* nécessite temporairement une connexion internet).

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Vite
- **Styling** : Tailwind CSS (v4)
- **Icônes** : Lucide React
- **Backend / API** : Fonctions Serverless Vercel (Node.js)
- **IA Vision** : SDK OpenAI (`gpt-4o-mini`)

## 🚀 Développement Local

### Prérequis
- Node.js (v18+)
- npm ou yarn
- Une clé API OpenAI (pour la fonction de scan photo)

### Installation

1. Clonez le dépôt :
```bash
git clone <votre-url-de-depot>
cd foret-mixte-app
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez l'environnement :
Créez un fichier `.env.local` à la racine du projet et ajoutez-y votre clé API OpenAI :
```env
VITE_OPENAI_API_KEY_SERVER_ONLY=sk-votre-clef-api-secrete
```

4. Lancez le serveur de développement :
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.

> **Note sur le backend en local** : La commande `vite` lance uniquement le frontend. Pour tester concrètement la route `/api/scan` en local, il est recommandé d'utiliser l'interface CLI de Vercel (`vercel dev`).

## ☁️ Déploiement sur Vercel

Le projet est conçu pour être déployé nativement et sans configuration complexe sur [Vercel](https://vercel.com).

1. Poussez votre code sur GitHub/GitLab.
2. Importez le projet dans votre dashboard Vercel.
3. Allez dans **Settings > Environment Variables** et ajoutez :
   - Clé : `VITE_OPENAI_API_KEY_SERVER_ONLY`
   - Valeur : *Votre clé secrète OpenAI*
4. Cliquez sur **Deploy**.

Le frontend Vite sera compilé et la fonction `api/scan.js` sera déployée en tant que Vercel Serverless Function, sécurisant ainsi totalement votre clé API.

## 📄 Données du Jeu

Les données des cartes sont stockées au format JSON dans `src/data/foret_mixte_cards.json`. Le moteur de score qui applique les règles du jeu se situe dans `src/engine/scoringEngine.ts`.
