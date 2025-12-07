// 17. src/app/app.routes.ts
// ============================================
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'talibes',
    canActivate: [authGuard, roleGuard(['ADMIN', 'ENSEIGNANT'])],
    loadChildren: () => import('./features/talibes/talibe.route').then(m => m.TALIBES_ROUTES)
  },
  {
    path: 'enseignants',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadChildren: () => import('./features/enseignants/enseignants.routes').then(m => m.ENSEIGNANTS_ROUTES)
  },
  {
    path: 'daaras',
    canActivate: [authGuard],
    loadChildren: () => import('./features/daaras/daaras.routes').then(m => m.DAARAS_ROUTES)
  },
  {
    path: 'cours',
    canActivate: [authGuard],
    loadChildren: () => import('./features/cours/cours.routes').then(m => m.COURS_ROUTES)
  },
  {
    path: 'batiments',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadChildren: () => import('./features/batiments/batiments.routes').then(m => m.BATIMENTS_ROUTES)
  },
  {
    path: 'chambres',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadChildren: () => import('./features/chambres/chambres.routes').then(m => m.CHAMBRES_ROUTES)
  },
  {
    path: 'lits',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadChildren: () => import('./features/lits/lits.routes').then(m => m.LISTS_ROUTES)
  },
  {
    path: 'dashboard_enseignant',
    canActivate: [authGuard, roleGuard(['ADMIN', 'ENSEIGNANT'])],
    loadComponent: () => import('./features/enseignants/personal-dashboard')
      .then(m => m.PersonalDashboardComponent)
  },
  {
    path: 'dashboard_talibe',
    canActivate: [authGuard, roleGuard(['ADMIN', 'TALIBE'])],
    loadComponent: () => import('./features/talibes/talibes-dashboard')
      .then(m => m.TalibesDashboardComponent)
  },
  {
    path: 'profileEnseignant',
    loadComponent: () => import('./features/enseignants/enseignant-profile')
      .then(m => m.EnseignantProfileComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/talibes/talibes-dashboard')
      .then(m => m.TalibesDashboardComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];