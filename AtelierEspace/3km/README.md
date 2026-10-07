# 3 km — Atelier Espaces (ESADSE)

Une ligne droite de 3 km dans Saint-Étienne, de chez moi (D) à la destination (A), marchée deux fois par les rues.
8 épingles : D (photo 1 « Début »), 6 paires de photos (2e chemin en haut, 1er en bas : comme sur la carte, gauche → haut, droite → bas), A (photo 30 « Fini »).
Un clic sur n'importe quelle image l'ouvre en grand.

## Démarrer (dans VS Code)

1. `File → Open Folder…` → `~/Study/ESADSE/AtelierEspace/3km`
2. Terminal intégré (`Ctrl + ù` ou `View → Terminal`) :
   ```bash
   npm install          # une seule fois
   npm run dev          # → http://localhost:5173
   ```
3. Chaque fois que tu sauves un fichier, la page se recharge toute seule.

## Les pages

| Adresse | Quoi |
|---|---|
| `localhost:5173/` | le site |
| `localhost:5173/selection` | l'outil (dev seulement) : corriger des positions, composer les 6 paires (sauvegarde automatique) |

## Les données

```bash
npm run donnees   # GPX + Linha do Tempo → traces, photos → src/data/photos.json + copies réduites dans public/media
npm run esquisses # la note Supernote (NOTE_SUPERNOTE dans .env) → public/media/esquisses/1.png…
npm run upload    # (facultatif) envoie les photos sur Cloudinary
```

Pour `npm run esquisses`, une seule fois avant : `python3 -m venv .venv && .venv/bin/pip install supernotelib`.

- Les photos et GPX originaux restent dans OneDrive (`SOURCE_DIR` dans `.env`).
- Photos 22–54 : placées automatiquement (heure de la photo + trace GPX).
- Photos 1–21 (22/09) : placées par la Linha do Tempo Google (`Travaux/Vos trajets.json`, lu par `scripts/timeline.mjs` ; seule la fenêtre de la marche est copiée dans le projet).
- Une position peut toujours être corrigée dans `/selection` (glisser le point).
- Les copies réduites (`public/media`) sont dans le repo : c'est Vercel qui les sert.

## Les écrans (l'adresse change : #intro, #droite, #parcours/3…)

| # | Écran | Fichier |
|---|---|---|
| 1 | Intro | `src/ecrans/Intro.tsx` |
| 2 | Carte horizontale, ligne droite seule + texte (20 %) | `src/ecrans/EcranCarte.tsx` |
| 3 | Carte horizontale, les deux chemins + « Il y a DEUX chemins. » | idem |
| 4 → | Photo D / 2 photos / photo A à gauche, carte verticale fixe (cadenas) à droite, épingles | `src/ecrans/Parcours.tsx` |
| | « J'espère que vous avez aimé… » | `src/ecrans/Merci.tsx` |
| | Processus : esquisses Supernote, technologies, toutes les photos | `src/ecrans/Processus.tsx` |

L'ordre est dans `src/App.tsx`. Bouton « Suivant » : `src/components/BoutonSuivant.tsx`.

## Où est quoi

```
src/
  App.tsx                 l'enchaînement des écrans
  ecrans/                 un fichier par écran
  components/
    Carte.tsx             fond IGN, traces, mode horizontal, cadenas
    FichePoint.tsx        ✏️ À TOI : les deux photos d'un point (exercices dans le fichier)
    Visionneuse.tsx       une image en grand (clic), ← → pour parcourir
    ChoixPolice.tsx       provisoire : ?police=arvo / ?police=oswald pour comparer
    BoutonSuivant.tsx, Marqueur.tsx
  lib/donnees.ts          données + calculs (km, projection sur la ligne droite)
  lib/icones.ts           pins D/A Visorando, épingles de détective
  data/                   photos.json, points.json, placements.json, traces/
  selection/              l'outil /selection
  index.css               ✏️ couleurs et typographie (variables en haut)
scripts/                  gpx-to-geojson, photos, esquisses.py, upload-cloudinary
```

## Typographie

Titres : **Oswald** (par défaut) ou **Arvo** ; texte : **Montserrat**.
Pour comparer, ajouter `?police=arvo` ou `?police=oswald` à l'adresse (aussi sur téléphone) : un petit sélecteur apparaît en haut à gauche.
Une fois choisi : mettre la police dans `--police-titre` (`src/index.css`), puis supprimer `ChoixPolice.tsx` et la ligne dans `main.tsx`.

## Mettre en ligne

Le code est dans le repo GitHub **saviotp/ESADSE**, dossier `AtelierEspace/3km`.

1. `git push` → Vercel redéploie tout seul.
2. Réglage Vercel (une seule fois) : *Add New → Project* → importer `saviotp/ESADSE` → **Root Directory : `AtelierEspace/3km`** → Deploy.
   Aucune variable d'environnement : les images sont servies depuis `public/media`.
