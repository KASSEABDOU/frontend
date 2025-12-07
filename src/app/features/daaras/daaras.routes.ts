// 5. src/app/features/daaras/daaras.routes.ts - AVEC CARTE
// ============================================
import { Routes } from '@angular/router';

export const DAARAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./daaras-list/daaras-list')
      .then(m => m.DaarasListComponent)
  },
  {
    path: 'map',
    loadComponent: () => import('./daaras-map/daaras-map')
      .then(m => m.DaarasMapComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./daara-form/daara-form')
      .then(m => m.DaaraFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./daara-form/daara-form')
      .then(m => m.DaaraFormComponent)
  },
  {
    path: ':id/detail',
    loadComponent: () => import('./daaras_detail')
      .then(m => m.DaaraDetailsComponent)
  }
];