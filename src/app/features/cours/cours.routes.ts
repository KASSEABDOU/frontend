// ============================================
import { Routes } from '@angular/router';

export const COURS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cours-list/cours-list')
      .then(m => m.CoursListComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./cours-form/cours-form')
      .then(m => m.CoursFormComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./cours-form/cours-form')
      .then(m => m.CoursFormComponent)
  },
  {
    path: ':id/detail',
    loadComponent: () => import('./cours.detail')
      .then(m => m.CoursDetailsComponent)
  },
  {
    path: ':id/detail',
    loadComponent: () => import('./cours.detail')
      .then(m => m.CoursDetailsComponent)
  },
  {
    path: ':id/talibes',
    loadComponent: () => import('../gerer-inscriptions/gerer-inscriptions')
      .then(m => m.GererInscriptionsComponent)
  },
  {
    path: ':id/enseignants',
    loadComponent: () => import('../gerer-inscriptions/assigner-enseignants')
      .then(m => m.AssignerEnseignantsComponent)
  },
  {
    path: 'mes_cours',
    loadComponent: () => import('./mes_cours')
      .then(m => m.MesCoursComponent)
  }
  

];
