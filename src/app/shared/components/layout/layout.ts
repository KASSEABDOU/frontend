
// ============================================
import { Component, inject } from '@angular/core';
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
      <mat-sidenav #sidenav mode="side"  opened class="sidenav">
        <div class="logo-container">
          <h2>Daaras Manager</h2>
        </div>
        
        <mat-nav-list>
          <!-- Dashboard -->
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active" *ngIf="isAdmin">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <!-- Daaras -->
          <a mat-list-item routerLink="/daaras" routerLinkActive="active" *ngIf="isAdmin">
            <mat-icon matListItemIcon>business</mat-icon>
            <span matListItemTitle>Daaras</span>
          </a>
          
          <!-- Cours -->
          <a mat-list-item routerLink="/cours" routerLinkActive="active" *ngIf="isAdmin">
            <mat-icon matListItemIcon>book</mat-icon>
            <span matListItemTitle>Cours</span>
          </a>

          <!-- Menu Utilisateurs avec sous-menu - SEULEMENT ADMIN -->
          <mat-expansion-panel class="menu-expansion-panel" *ngIf="isAdmin">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>people</mat-icon>
                <span>Utilisateurs</span>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <a mat-list-item routerLink="/talibes" routerLinkActive="active">
              <mat-icon matListItemIcon>school</mat-icon>
              <span matListItemTitle>Talibés</span>
            </a>

            <a mat-list-item routerLink="/enseignants" routerLinkActive="active">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Enseignants</span>
            </a>

            <a mat-list-item routerLink="/admins" routerLinkActive="active">
              <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
              <span matListItemTitle>Administrateurs</span>
            </a>
          </mat-expansion-panel>

          <!-- Menu Infrastructure avec sous-menu - SEULEMENT ADMIN -->
          <mat-expansion-panel class="menu-expansion-panel" *ngIf="isAdmin">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>construction</mat-icon>
                <span>Infrastructure</span>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <a mat-list-item routerLink="/batiments" routerLinkActive="active">
              <mat-icon matListItemIcon>apartment</mat-icon>
              <span matListItemTitle>Bâtiments</span>
            </a>

            <a mat-list-item routerLink="/chambres" routerLinkActive="active">
              <mat-icon matListItemIcon>meeting_room</mat-icon>
              <span matListItemTitle>Chambres</span>
            </a>

            <a mat-list-item routerLink="/lits" routerLinkActive="active">
              <mat-icon matListItemIcon>single_bed</mat-icon>
              <span matListItemTitle>Lits</span>
            </a>
          </mat-expansion-panel>

          <!-- Menu Enseignant (si vous voulez un menu séparé pour les enseignants) -->
          <div *ngIf="isEnseignant && !isAdmin">
            <a mat-list-item routerLink="/dashboard_enseignant" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Mon Dashboard</span>
            </a>

            <a mat-list-item routerLink="/cours/mes_cours" routerLinkActive="active">
              <mat-icon matListItemIcon>menu_book</mat-icon>
              <span matListItemTitle>Mes Cours</span>
            </a>

            <a mat-list-item routerLink="/talibes/mes_talibes" routerLinkActive="active">
              <mat-icon matListItemIcon>groups</mat-icon>
              <span matListItemTitle>Mes Talibés</span>
            </a>

            <a mat-list-item routerLink="/enseignants/notes" routerLinkActive="active">
              <mat-icon matListItemIcon>grading</mat-icon>
              <span matListItemTitle>Notes</span>
            </a>
            <a mat-list-item routerLink="/profileEnseignant" routerLinkActive="active">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Mon Profil</span>
            </a>
          </div>

          <!-- Menu Talibé (exemple) -->
          <div *ngIf="isTalibe && !isAdmin && !isEnseignant">
            <a mat-list-item routerLink="/dashboard_talibe" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Mon Dashboard</span>
            </a>

            <a mat-list-item routerLink="/talibes/cours" routerLinkActive="active">
              <mat-icon matListItemIcon>school</mat-icon>
              <span matListItemTitle>Mes Cours</span>
            </a>

            <a mat-list-item routerLink="/talibes/notes" routerLinkActive="active">
              <mat-icon matListItemIcon>grade</mat-icon>
              <span matListItemTitle>Mes Notes</span>
            </a>
            <a mat-list-item routerLink="/talibes/profile" routerLinkActive="active">
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

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="spacer"></span>
          
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{currentUser?.prenom}} {{currentUser?.nom}}
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item>
              <mat-icon>person</mat-icon>
              <span>Profil</span>
            </button>
            <button mat-menu-item>
              <mat-icon>settings</mat-icon>
              <span>Paramètres</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Déconnexion</span>
            </button>
          </mat-menu>
        </mat-toolbar>

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
          width: 250px;
          background-color: #f5f5f5;
        }

        .logo-container {
          padding: 20px;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin-bottom: 20px;
        }

        .logo-container h2 {
          margin: 0;
          font-size: 20px;
        }

        .spacer {
          flex: 1 1 auto;
        }

        .content-container {
          padding: 20px;
          background-color: #fafafa;
          min-height: calc(100vh - 64px);
        }

        /* Styles pour les liens de navigation */
        mat-nav-list a.active {
          background-color: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        mat-nav-list a:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }

        /* Styles pour les sous-menus (panneaux d'expansion) */
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

        .menu-expansion-panel .mat-expansion-panel-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(0, 0, 0, 0.87);
          font-weight: 500;
        }

        .menu-expansion-panel .mat-expansion-panel-header:hover {
          background-color: rgba(0, 0, 0, 0.04) !important;
        }

        .menu-expansion-panel .mat-expansion-indicator::after {
          color: rgba(0, 0, 0, 0.54);
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

        .menu-expansion-panel .mat-list-item .mat-list-item-content {
          padding-left: 16px !important;
        }

        /* Style pour les sous-items actifs */
        .menu-expansion-panel .mat-list-item.active {
          background-color: rgba(102, 126, 234, 0.08) !important;
          color: #667eea;
          border-right: 3px solid #667eea;
        }

        /* Style pour les icônes des sous-items */
        .menu-expansion-panel .mat-list-item mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-right: 12px;
        }

        /* Style pour le header actif du panneau */
        .menu-expansion-panel.active .mat-expansion-panel-header {
          background-color: rgba(102, 126, 234, 0.1) !important;
          color: #667eea;
        }

        /* Styles pour la version alternative avec sous-titres */
        mat-nav-list h3[matSubheader] {
          font-size: 12px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 16px 0 8px 16px;
          padding: 0;
        }

        /* Style pour les séparateurs */
        mat-divider {
          margin: 8px 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidenav {
            width: 280px;
          }
          
          .content-container {
            padding: 16px;
          }
        }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  currentUser = this.authService.getCurrentUser();
  
  get isAdmin() { return this.currentUser?.role === 'ADMIN'; }
  get isEnseignant() { return this.currentUser?.role === 'ENSEIGNANT'; }
  get isTalibe() { return this.currentUser?.role === 'TALIBE'; }

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

// ============================================