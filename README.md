# Diatona

Explorateur harmonique — gammes, accords et cadences visualisés
sur un piano, un piano roll et un manche de guitare.

**Stack** : Angular 21 · Signals · Tailwind CSS 4 · PWA (`@angular/service-worker`) · Vitest.

## Démarrer

```bash
npm install
npm start          # http://localhost:4200
npm test           # tests unitaires (vitest)
npm run build      # build de production
```

Le service worker n'est actif qu'en build de production. Pour le tester en local :

```bash
npm run build
npx http-server dist/diatona/browser -p 8080
```

## Architecture

```
src/app/
├─ core/                    ← aucune dépendance vers l'UI
│  ├─ music/                ← domaine pur (zéro import Angular) : notes, gammes,
│  │                          harmonisation, cadences. Testable sans TestBed.
│  ├─ state/music-state.ts  ← source de vérité unique (signals + computed)
│  └─ audio/audio-engine.ts ← synthé Web Audio (2 saws désaccordées + passe-bas)
├─ shared/
│  ├─ ui/                   ← washi-button (habille <button>/<a> natifs), pipe noteName
│  └─ viz/                  ← piano, piano-roll, fretboard : composants de présentation
│                             purs, pilotés par le contrat `Highlight`
└─ features/                ← pages lazy-loadées par le routeur
   ├─ scale/  (/gamme)
   ├─ chords/ (/accords)
   ├─ cadences/ (/cadences)
   └─ detect/ (/deviner) ← détection inverse : notes saisies → gammes candidates
```

Principes appliqués :

- **Domaine séparé du framework** : `core/music` est du TypeScript pur ; l'harmonisation
  se teste en trois lignes (`chord.spec.ts`).
- **Signals partout** : état dans `MusicState`, dérivations en `computed`, composants
  en `ChangeDetectionStrategy.OnPush`, inputs via `input.required()`. Pas de RxJS
  pour l'état local.
- **Contrat `Highlight`** : les trois visualisations consomment la même structure
  immuable — ajouter une 4e visualisation (ex. clavier isomorphique) ne touche
  ni l'état ni les pages.
- **La vue suit la route** : `/accords` bascule les visualisations en mode accord
  (effet local dans `ChordsPage`, remis à zéro via `DestroyRef`).
- **Sémantique native** : les tapes sont de vrais `<button>`/`<a>`/`<select>`
  (focus, clavier, lecteurs d'écran), habillés par `WashiButton` (sélecteur
  d'attribut `diaWashi`) et les classes du design system.

## Design system

Les tokens vivent dans `src/styles.css` sous `@theme` (Tailwind 4, config CSS-first) :
couleurs papier/encre/feutres/washi, polices (`--font-hand`, `--font-script`),
rayons « tracés main » et ombres. Chaque token devient à la fois un utilitaire
Tailwind (`bg-paper`, `text-ink-soft`, `font-script`…) et une variable CSS
(`var(--color-marker-yellow)`).

Les composants du langage visuel (`.tape`, `.tag`, `.tape-seigaiha`, `.dcard`,
`.piano`…) sont dans `@layer components` ; les motifs japonais (ichimatsu, kiku,
seigaiha, sakura, shibori) sont des tuiles SVG en data-URI ou des dégradés —
aucune image externe, tout fonctionne hors-ligne.

`prefers-reduced-motion` neutralise les rotations et transitions décoratives.

## PWA

- Manifest fr (`public/manifest.webmanifest`), icônes générées 72→512 px.
- `ngsw-config.json` : assets en prefetch + groupe `fonts` qui met en cache
  Google Fonts à l'exécution (l'inlining au build est désactivé dans
  `angular.json` pour rester indépendant du réseau de build).

## Déploiement

`.github/workflows/deploy.yml` : à chaque push sur `main` → tests, build avec
`--base-href=/diatona/`, copie `index.html → 404.html` (fallback SPA) et
publication sur GitHub Pages. **Si le dépôt ne s'appelle pas `diatona`,
adapte le `--base-href`.** Activer Pages : Settings → Pages → Source
« GitHub Actions ».

## Pistes suivantes

Inversions et drop voicings, détection inverse d'accords, accords
empruntés, export MIDI d'une cadence, mode sombre « papier kraft ».
