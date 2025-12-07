// 3. src/app/features/batiments/batiments.routes.ts
// ============================================
import { Routes } from '@angular/router';

export const BATIMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./batiments-list/batiments-list')
      .then(m => m.BatimentsListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./batiment-form/batiment-form')
      .then(m => m.BatimentFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./batiment-form/batiment-form')
      .then(m => m.BatimentFormComponent)
  },
  {
    path: ':batimentId/chambres/create',
    loadComponent: () => import('../chambres/chambre-form/chambre-form')
      .then(m => m.ChambreFormComponent)
  }
  ,
  {
    path: ':id/detail',
    loadComponent: () => import('./batiment_detail')
      .then(m => m.BatimentDetailsComponent)
  }
];