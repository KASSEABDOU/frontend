// ============================================
import { Routes } from '@angular/router';

export const CHAMBRES_ROUTES: Routes = [
   {
    path: '',
    loadComponent: () => import('./chambres-list/chambres-list')
      .then(m => m.ChambresListComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./chambre-form/chambre-form')
      .then(m => m.ChambreFormComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./chambre-form/chambre-form')
      .then(m => m.ChambreFormComponent)
  }
  ,
  {
    path: ':id/detail',
    loadComponent: () => import('./chambre_detail')
      .then(m => m.ChambreDetailsComponent)
  },
  {
    path: ':id/lits/create',
    loadComponent: () => import('../lits/lit-form/lit-form')
      .then(m => m.LitFormComponent)
  }
];
