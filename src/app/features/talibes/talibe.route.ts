
// ============================================
import { Routes } from '@angular/router';

export const TALIBES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./talibe-list/talibe-list')
      .then(m => m.TalibesListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./talibe-form/talibe-form')
      .then(m => m.TalibeFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./talibe-form/talibe-form')
      .then(m => m.TalibeFormComponent)
  },
  {
    path: ':id/details',
    loadComponent: () => import('./talibe-details')
      .then(m => m.TalibeDetailsComponent)
  },
  {
    path: 'mes_talibes',
    loadComponent: () => import('./mes-talibes')
      .then(m => m.MesTalibesComponent)
  }
];