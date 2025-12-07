
// ============================================
import { Routes } from '@angular/router';

export const ENSEIGNANTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./enseignants-list/enseignants-list')
      .then(m => m.EnseignantsListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./enseignant-form/enseignant-form')
      .then(m => m.EnseignantFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./enseignant-form/enseignant-form')
      .then(m => m.EnseignantFormComponent)
  },
  {
    path: ':id/detail',
    loadComponent: () => import('./enseignant-details')
      .then(m => m.EnseignantDetailsComponent)
  }
];