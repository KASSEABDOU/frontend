
// ============================================
import { Routes } from '@angular/router';

export const LISTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lits-list/lits-list')
      .then(m => m.LitsListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./lit-form/lit-form')
      .then(m => m.LitFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./lit-form/lit-form')
      .then(m => m.LitFormComponent)
  }
];