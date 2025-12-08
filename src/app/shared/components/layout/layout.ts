import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Sidebar qui se cache sur mobile -->
      <mat-sidenav #sidenav 
                   [mode]="(isHandset$ | async) ? 'over' : 'side'"
                   [opened]="!(isHandset$ | async)"
                   fixedInViewport="true"
                   [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
                   class="sidenav">
        
        <!-- Header du sidenav avec bouton fermer sur mobile -->
        <div class="sidenav-header">
          <div class="logo-container">
            <h2>Daaras Manager</h2>
          </div>
          <button mat-icon-button class="close-btn" 
                  (click)="sidenav.close()" 
                  *ngIf="isHandset$ | async">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <!-- Votre menu existant -->
        <mat-nav-list>
          <!-- Dashboard -->
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active" *ngIf="isAdmin"
             (click)="closeIfHandset(sidenav)">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <!-- Daaras -->
          <a mat-list-item routerLink="/daaras" routerLinkActive="active" *ngIf="isAdmin"
             (click)="closeIfHandset(sidenav)">
            <mat-icon matListItemIcon>business</mat-icon>
            <span matListItemTitle>Daaras</span>
          </a>
          
          <!-- Cours -->
          <a mat-list-item routerLink="/cours" routerLinkActive="active" *ngIf="isAdmin"
             (click)="closeIfHandset(sidenav)">
            <mat-icon matListItemIcon>book</mat-icon>
            <span matListItemTitle>Cours</span>
          </a>

          <!-- Menu Utilisateurs avec sous-menu - SEULEMENT ADMIN -->
          <mat-expansion-panel class="menu-expansion-panel" *ngIf="isAdmin"
                               (click)="$event.stopPropagation()">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>people</mat-icon>
                <span>Utilisateurs</span>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <a mat-list-item routerLink="/talibes" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>school</mat-icon>
              <span matListItemTitle>Talibés</span>
            </a>

            <a mat-list-item routerLink="/enseignants" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Enseignants</span>
            </a>

            <a mat-list-item routerLink="/admins" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
              <span matListItemTitle>Administrateurs</span>
            </a>
          </mat-expansion-panel>

          <!-- Menu Infrastructure avec sous-menu - SEULEMENT ADMIN -->
          <mat-expansion-panel class="menu-expansion-panel" *ngIf="isAdmin"
                               (click)="$event.stopPropagation()">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>construction</mat-icon>
                <span>Infrastructure</span>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <a mat-list-item routerLink="/batiments" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>apartment</mat-icon>
              <span matListItemTitle>Bâtiments</span>
            </a>

            <a mat-list-item routerLink="/chambres" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>meeting_room</mat-icon>
              <span matListItemTitle>Chambres</span>
            </a>

            <a mat-list-item routerLink="/lits" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>single_bed</mat-icon>
              <span matListItemTitle>Lits</span>
            </a>
          </mat-expansion-panel>

          <!-- Menu Enseignant -->
          <div *ngIf="isEnseignant && !isAdmin">
            <a mat-list-item routerLink="/dashboard_enseignant" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Mon Dashboard</span>
            </a>

            <a mat-list-item routerLink="/cours/mes_cours" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>menu_book</mat-icon>
              <span matListItemTitle>Mes Cours</span>
            </a>

            <a mat-list-item routerLink="/talibes/mes_talibes" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>groups</mat-icon>
              <span matListItemTitle>Mes Talibés</span>
            </a>

            <a mat-list-item routerLink="/enseignants/notes" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>grading</mat-icon>
              <span matListItemTitle>Notes</span>
            </a>
            <a mat-list-item routerLink="/profileEnseignant" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Mon Profil</span>
            </a>
          </div>

          <!-- Menu Talibé -->
          <div *ngIf="isTalibe && !isAdmin && !isEnseignant">
            <a mat-list-item routerLink="/dashboard_talibe" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Mon Dashboard</span>
            </a>

            <a mat-list-item routerLink="/talibes/cours" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>school</mat-icon>
              <span matListItemTitle>Mes Cours</span>
            </a>

            <a mat-list-item routerLink="/talibes/notes" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>grade</mat-icon>
              <span matListItemTitle>Mes Notes</span>
            </a>
            <a mat-list-item routerLink="/talibes/profile" routerLinkActive="active"
               (click)="closeIfHandset(sidenav)">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Mon Profil</span>
            </a>
          </div>

          <mat-divider></mat-divider>

          <!-- Déconnexion -->
          <a mat-list-item (click)="logout()">
            <mat-icon matListItemIcon>exit_to_app</mat-icon>
            <span matListItemTitle>Déconnexion</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Contenu principal -->
      <mat-sidenav-content>
        <!-- Barre de navigation avec bouton menu -->
        <mat-toolbar color="primary" class="main-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          
          <span class="app-title">Daara Management</span>
          
          <span class="spacer"></span>
          
          <!-- Info utilisateur (caché sur mobile très petit) -->
          <div class="user-info" *ngIf="currentUser">
            <span class="user-name" *ngIf="!(isHandset$ | async) || (isTablet$ | async)">
              {{ currentUser.prenom }} {{ currentUser.nom }}
            </span>
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            
            <mat-menu #userMenu="matMenu">
              <div class="user-menu-header">
                <div class="user-avatar">
                  <mat-icon>account_circle</mat-icon>
                </div>
                <div class="user-details">
                  <strong>{{ currentUser.prenom }} {{ currentUser.nom }}</strong>
                  <small>{{ currentUser.email }}</small>
                  <small class="user-role">{{ currentUser.role | titlecase }}</small>
                </div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Mon Profil</span>
              </button>
              <button mat-menu-item routerLink="/settings">
                <mat-icon>settings</mat-icon>
                <span>Paramètres</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>exit_to_app</mat-icon>
                <span>Déconnexion</span>
              </button>
            </mat-menu>
          </div>
        </mat-toolbar>

        <!-- Contenu de la page -->
        <div class="content-container">
          <ng-content></ng-content>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 280px;
      background-color: #f5f5f5;
      box-shadow: 3px 0 6px rgba(0,0,0,.24);
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0 16px;
      height: 64px;
    }

    .logo-container {
      flex: 1;
    }

    .logo-container h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .close-btn {
      color: white;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content-container {
      padding: 20px;
      background-color: #fafafa;
      min-height: calc(100vh - 64px);
    }

    /* Styles pour la toolbar principale */
    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }

    .app-title {
      margin-left: 16px;
      font-weight: 500;
    }

    /* Info utilisateur */
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-name {
      font-size: 14px;
    }

    /* Menu utilisateur amélioré */
    .user-menu-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 200px;
    }

    .user-avatar mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-details strong {
      font-size: 14px;
      font-weight: 500;
    }

    .user-details small {
      font-size: 12px;
      color: rgba(0,0,0,.6);
    }

    .user-role {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 6px;
      border-radius: 10px;
      display: inline-block;
      margin-top: 4px;
    }

    /* Styles pour les liens de navigation */
    mat-nav-list a.active {
      background-color: rgba(102, 126, 234, 0.1);
      color: #667eea;
      font-weight: 500;
    }

    mat-nav-list a:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    /* Styles pour les sous-menus */
    .menu-expansion-panel {
      box-shadow: none !important;
      background: transparent !important;
      border-radius: 0 !important;
    }

    .menu-expansion-panel .mat-expansion-panel-header {
      padding: 0 16px;
      height: 48px;
      border-radius: 0 !important;
    }

    .menu-expansion-panel .mat-expansion-panel-header:hover {
      background-color: rgba(0, 0, 0, 0.04) !important;
    }

    .menu-expansion-panel .mat-expansion-panel-body {
      padding: 0;
      background-color: rgba(0, 0, 0, 0.02);
    }

    /* Styles pour les sous-items */
    .menu-expansion-panel .mat-list-item {
      padding-left: 40px !important;
      height: 40px !important;
      font-size: 14px;
    }

    .menu-expansion-panel .mat-list-item.active {
      background-color: rgba(102, 126, 234, 0.08) !important;
      color: #667eea;
      border-right: 3px solid #667eea;
    }

    /* Responsive */
    @media (max-width: 599px) {
      .sidenav {
        width: 85vw;
        max-width: 300px;
      }
      
      .content-container {
        padding: 12px;
      }
      
      .user-name {
        display: none;
      }
      
      .app-title {
        font-size: 16px;
        margin-left: 8px;
      }
    }

    @media (min-width: 600px) and (max-width: 959px) {
      .sidenav {
        width: 250px;
      }
      
      .content-container {
        padding: 16px;
      }
    }

    @media (min-width: 960px) {
      .sidenav {
        width: 280px;
      }
    }

    /* Animation pour le sidenav */
    .mat-sidenav {
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    /* Overlay pour mobile */
    .mat-sidenav-container.mat-drawer-opened .mat-sidenav-backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }
  `]
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private breakpointObserver = inject(BreakpointObserver);

  // Observables pour détecter les tailles d'écran
  isHandset$: Observable<boolean>;
  isTablet$: Observable<boolean>;

  currentUser = this.authService.getCurrentUser();
  
  get isAdmin() { return this.currentUser?.role === 'ADMIN'; }
  get isEnseignant() { return this.currentUser?.role === 'ENSEIGNANT'; }
  get isTalibe() { return this.currentUser?.role === 'TALIBE'; }

  constructor() {
    // Détecter les mobiles
    this.isHandset$ = this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(
        map(result => result.matches),
        shareReplay()
      );

    // Détecter les tablettes
    this.isTablet$ = this.breakpointObserver.observe([Breakpoints.Tablet])
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit() {
    // Écouter les changements de taille d'écran
    this.isHandset$.subscribe(isHandset => {
      console.log('Is handset:', isHandset);
    });
  }

  // Fermer le sidenav automatiquement sur mobile après un clic
  closeIfHandset(sidenav: any) {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset) {
        sidenav.close();
      }
    }).unsubscribe(); // Nettoyer la souscription
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Déconnexion réussie', response);
        this.snackBar.open('Déconnexion réussie', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        this.snackBar.open('Erreur lors de la déconnexion', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        // Forcer la déconnexion même en cas d'erreur
        this.authService.clearAuthData();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}