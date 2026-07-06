import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'gamme', pathMatch: 'full' },
  {
    path: 'gamme',
    title: 'Diatona · Gamme',
    loadComponent: () => import('./features/scale/scale-page').then((m) => m.ScalePage),
  },
  {
    path: 'accords',
    title: 'Diatona · Accords',
    loadComponent: () => import('./features/chords/chords-page').then((m) => m.ChordsPage),
  },
  {
    path: 'cadences',
    title: 'Diatona · Cadences',
    loadComponent: () => import('./features/cadences/cadences-page').then((m) => m.CadencesPage),
  },
  {
    path: 'deviner',
    title: 'Diatona · Deviner',
    loadComponent: () => import('./features/detect/detect-page').then((m) => m.DetectPage),
  },
  { path: '**', redirectTo: 'gamme' },
];
