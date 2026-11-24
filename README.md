# ceres-www

Site du CERES (Sorbonne Université), généré avec [Astro](https://astro.build).

## Prérequis

- Node 24 (`nvm use`, voir `.nvmrc`)
- Le contenu ([ceres-www-content](https://github.com/CERES-Sorbonne/ceres-www-content)) dans `src/data` :
  `./dev.sh` le clone ou le met à jour. Un lien symbolique vers un clone existant fonctionne aussi :
  `ln -s ../../ContenuSiteCERES src/data`.

## Commandes

```sh
npm install
npm run dev      # serveur de développement
npm run build    # site statique dans dist/
npm run preview  # sert dist/
```

## Organisation

- `src/content.config.ts` : collections `posts` (Markdown de `src/data/<N>_<gabarit>_<section>/…/index.md`)
  et `outils` (`src/data/_outils/outils_numeriques.csv`).
- `src/lib/content.ts` : date (tirée du nom de dossier), image de carte (première image du dossier),
  extrait, URL des articles (`/<uuid>`, `/<prettyName>`, `/<prettyname>`).
- `src/lib/remark-content-links.mjs` et `scripts/copy-content-files.mjs` : les fichiers liés depuis le
  Markdown (pdf, csv, gif…) sont copiés dans `public/files/` et les liens réécrits.
- `src/pages/` : accueil, `[section]/` (pages de liste), `[slug]` (articles), `outils/[tool]`.
- `src/components/` : îles React pour le panneau de tags, les cartes filtrables et le calendrier.
