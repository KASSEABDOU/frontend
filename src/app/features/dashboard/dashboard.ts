// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { DaaraService } from '../../shared/services/daara';
import { TalibeService } from '../../shared/services/talibe';
import { EnseignantService } from '../../shared/services/enseignant';
import { CoursService } from '../../shared/services/cours';
import { AuthService } from '../../core/services/auth';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

interface DashboardStats {
  totalDaaras: number;
  totalTalibes: number;
  totalEnseignants: number;
  totalCours: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h1>Tableau de bord</h1>
          <div class="user-welcome" *ngIf="currentUser">
            Bienvenue, <strong>{{ currentUser.prenom }} {{ currentUser.nom }}</strong>
            <span class="user-role">({{ currentUser.role }})</span>
          </div>
        </div>

        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Chargement des données...</p>
        </div>

        <div *ngIf="errorMessage && !loading" class="error-container">
          <mat-card class="error-card">
            <mat-card-content>
              <div class="error-content">
                <mat-icon color="warn">error_outline</mat-icon>
                <div>
                  <h3>Erreur de chargement</h3>
                  <p>{{ errorMessage }}</p>
                  <button mat-raised-button color="primary" (click)="loadStats()">
                    <mat-icon>refresh</mat-icon>
                    Réessayer
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Statistiques -->
        <mat-grid-list cols="4" rowHeight="150px" gutterSize="20" 
                       *ngIf="!loading && !errorMessage && stats">
          <mat-grid-tile>
            <mat-card class="stat-card daara-card">
              <mat-card-content>
                <mat-icon>business</mat-icon>
                <h2>{{stats.totalDaaras}}</h2>
                <p>Daaras</p>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-card class="stat-card talibe-card">
              <mat-card-content>
                <mat-icon>school</mat-icon>
                <h2>{{stats.totalTalibes}}</h2>
                <p>Talibés</p>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-card class="stat-card enseignant-card">
              <mat-card-content>
                <mat-icon>person</mat-icon>
                <h2>{{stats.totalEnseignants}}</h2>
                <p>Enseignants</p>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-card class="stat-card cours-card">
              <mat-card-content>
                <mat-icon>book</mat-icon>
                <h2>{{stats.totalCours}}</h2>
                <p>Cours</p>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>
        </mat-grid-list>

      </div>
    </app-layout>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .user-welcome {
      color: #666;
      font-size: 16px;
    }

    .user-role {
      background: #667eea;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      margin-left: 8px;
    }

    .debug-btn {
      margin-bottom: 20px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 400px;
      gap: 20px;
    }

    .error-container {
      display: flex;
      justify-content: center;
      margin: 40px 0;
    }

    .error-card {
      max-width: 500px;
    }

    .error-content {
      display: flex;
      align-items: flex-start;
      gap: 15px;
    }

    .stat-card {
      width: 100%;
      height: 100%;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .stat-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
    }

    .stat-card h2 {
      margin: 10px 0;
      font-size: 32px;
      font-weight: bold;
    }

    .stat-card p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .daara-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .talibe-card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .enseignant-card {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .cours-card {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .debug-info {
      margin-top: 30px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }

    .debug-info h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .debug-info p {
      margin: 5px 0;
      font-size: 14px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private daaraService = inject(DaaraService);
  private talibeService = inject(TalibeService);
  private enseignantService = inject(EnseignantService);
  private coursService = inject(CoursService);
  protected authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
    private cdr = inject(ChangeDetectorRef);

  stats: DashboardStats | null = null;
  loading = true;
  errorMessage = '';
  currentUser: any;
  showDebug = true; // Mettre à false en production

  ngOnInit(): void {
    console.log('🎯 Dashboard Component initialisé');
    this.currentUser = this.authService.getCurrentUser();
    this.debugAuth();
    this.loadStats();
  }

  debugAuth(): void {
    console.group('🔐 DASHBOARD DEBUG');
    console.log('👤 Current User:', this.currentUser);
    console.log('🔐 Token présent:', !!this.authService.getToken());
    console.log('✅ Authentifié:', this.authService.isAuthenticated());
    console.groupEnd();
  }

  loadStats(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('🔄 Début du chargement des statistiques...');

    forkJoin({
      daaras: this.daaraService.getAll(),
      talibes: this.talibeService.getAll(),
      enseignants: this.enseignantService.getAll(),
      cours: this.coursService.getAll()
    }).subscribe({
      next: (data) => {
        console.log('✅ Données chargées avec succès:', {
          daaras: data.daaras.length,
          talibes: data.talibes.length,
          enseignants: data.enseignants.length,
          cours: data.cours.length
        });

        // ✅ Mettre à jour les valeurs
        this.stats = {
          totalDaaras: data.daaras.length,
          totalTalibes: data.talibes.length,
          totalEnseignants: data.enseignants.length,
          totalCours: data.cours.length
        };
        this.loading = false;

        // 🔄 Forcer Angular à redétecter les changements
        this.cdr.detectChanges();

        this.snackBar.open('✅ Données chargées avec succès!', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des statistiques:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.loading = false;

        // 🔄 Forcer la redétection ici aussi
        this.cdr.detectChanges();

        this.snackBar.open(`❌ Erreur: ${this.errorMessage}`, 'Fermer', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Endpoint non trouvé. Vérifiez les routes backend.';
    } else if (error.status === 401) {
      return 'Non authentifié. Token manquant ou invalide.';
    } else if (error.status === 403) {
      return 'Accès refusé. Droits insuffisants.';
    } else if (error.status === 0) {
      return 'Impossible de contacter le serveur. Vérifiez qu\'il est démarré.';
    } else {
      return error.error?.error || error.message || 'Erreur inconnue';
    }
  }
}