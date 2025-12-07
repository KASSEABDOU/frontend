// personal-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { AuthService } from '../../core/services/auth';
import { EnseignantService } from '../../shared/services/enseignant';

@Component({
  selector: 'app-personal-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="personal-dashboard" *ngIf="currentUser">
        <!-- En-tête personnelle -->
        <mat-card class="welcome-card">
          <div class="welcome-content">
            <div class="avatar-section">
              <div class="avatar">
                <mat-icon>school</mat-icon>
              </div>
            </div>
            
            <div class="greeting-section">
              <h1>Bonjour, {{ currentUser.prenom }} {{ currentUser.nom }} !</h1>
              <p class="subtitle">Bienvenue dans votre espace enseignant</p>
              
              <div class="quick-info">
                <mat-chip color="primary">{{ currentUser.matricule }}</mat-chip>
                <mat-chip color="accent">{{ currentUser.specialite || 'Enseignant' }}</mat-chip>
                <mat-chip>{{ currentUser.grade || 'Grade non défini' }}</mat-chip>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Cartes d'action rapide -->
        <div class="quick-actions">
          <h2 class="section-title">Actions rapides</h2>
          <div class="actions-grid">
            <mat-card class="action-card" routerLink="/cours">
              <mat-card-content>
                <mat-icon>menu_book</mat-icon>
                <h3>Mes Cours</h3>
                <p>Consulter et gérer vos cours</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/talibes">
              <mat-card-content>
                <mat-icon>groups</mat-icon>
                <h3>Mes Talibés</h3>
                <p>Voir vos étudiants</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/enseignants/profile">
              <mat-card-content>
                <mat-icon>person</mat-icon>
                <h3>Mon Profil</h3>
                <p>Modifier vos informations</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/cours/notes">
              <mat-card-content>
                <mat-icon>grading</mat-icon>
                <h3>Notes</h3>
                <p>Saisir les notes</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/enseignants/emploi-du-temps">
              <mat-card-content>
                <mat-icon>calendar_today</mat-icon>
                <h3>Emploi du temps</h3>
                <p>Voir votre planning</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="action-card" routerLink="/enseignants/statistiques">
              <mat-card-content>
                <mat-icon>bar_chart</mat-icon>
                <h3>Statistiques</h3>
                <p>Vos indicateurs</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Aperçu des cours -->
        <div class="cours-preview" *ngIf="mesCours.length > 0">
          <div class="section-header">
            <h2 class="section-title">Mes Cours Récemment Actifs</h2>
            <button mat-raised-button color="primary" routerLink="/cours">
              Voir tous mes cours
            </button>
          </div>
          
          <div class="cours-list">
            <mat-card *ngFor="let cours of mesCours.slice(0, 3)" class="cours-item">
              <mat-card-content>
                <div class="cours-header">
                  <mat-icon>{{ getCoursIcon(cours.code) }}</mat-icon>
                  <div>
                    <h3>{{ cours.libelle }}</h3>
                    <p class="cours-code">{{ cours.code }}</p>
                  </div>
                </div>
                <mat-divider></mat-divider>
                <div class="cours-info">
                  <span class="info-item">
                    <mat-icon>groups</mat-icon>
                    {{ cours.nombre_talibes || 0 }} talibés
                  </span>
                  <span class="info-item" *ngIf="cours.duree">
                    <mat-icon>schedule</mat-icon>
                    {{ cours.duree }}h/sem
                  </span>
                </div>
                <mat-chip-set>
                  <mat-chip color="accent">{{ cours.niveau || 'Tous niveaux' }}</mat-chip>
                </mat-chip-set>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Prochaines activités -->
        <div class="upcoming-activities">
          <h2 class="section-title">Prochaines Activités</h2>
          <mat-card>
            <mat-card-content>
              <div class="activity-list">
                <div class="activity-item">
                  <mat-icon class="activity-icon">event</mat-icon>
                  <div class="activity-content">
                    <h4>Réunion pédagogique</h4>
                    <p>Demain, 10:00 • Salle de conférence</p>
                  </div>
                </div>
                <mat-divider></mat-divider>
                <div class="activity-item">
                  <mat-icon class="activity-icon">assignment</mat-icon>
                  <div class="activity-content">
                    <h4>Échéance des notes</h4>
                    <p>3 jours restants • Cours de Coran</p>
                  </div>
                </div>
                <mat-divider></mat-divider>
                <div class="activity-item">
                  <mat-icon class="activity-icon">school</mat-icon>
                  <div class="activity-content">
                    <h4>Visite du Daara</h4>
                    <p>Vendredi • Daara Serigne Fallou</p>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>
    </app-layout>
  `,
  styles: [`
    .personal-dashboard {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .welcome-card {
      margin-bottom: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .welcome-content {
      display: flex;
      align-items: center;
      padding: 32px;
      gap: 32px;
    }

    .avatar-section {
      flex-shrink: 0;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .avatar mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .greeting-section {
      flex: 1;
    }

    .greeting-section h1 {
      margin: 0 0 8px 0;
      font-size: 36px;
      font-weight: 700;
    }

    .subtitle {
      margin: 0 0 16px 0;
      font-size: 18px;
      opacity: 0.9;
    }

    .quick-info {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .quick-actions {
      margin-bottom: 32px;
    }

    .section-title {
      margin: 0 0 20px 0;
      font-size: 24px;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .action-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .action-card mat-card-content {
      text-align: center;
      padding: 32px 24px;
    }

    .action-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #667eea;
    }

    .action-card h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
    }

    .action-card p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .cours-preview {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .cours-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .cours-item {
      border-left: 4px solid #667eea;
    }

    .cours-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .cours-header mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .cours-header h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .cours-code {
      margin: 4px 0 0 0;
      color: #999;
      font-size: 13px;
    }

    .cours-info {
      display: flex;
      gap: 16px;
      margin: 12px 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #666;
    }

    .upcoming-activities {
      margin-bottom: 32px;
    }

    .activity-list {
      padding: 8px 0;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
    }

    .activity-icon {
      color: #667eea;
    }

    .activity-content h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
    }

    .activity-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    @media (max-width: 768px) {
      .welcome-content {
        flex-direction: column;
        text-align: center;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .cours-list {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
    }
  `]
})
export class PersonalDashboardComponent implements OnInit {
  currentUser: any;
  mesCours: any[] = [];
  loading = false;

  constructor(
    private authService: AuthService,
    private enseignantService: EnseignantService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMesCours();
  }

  loadMesCours(): void {
    if (!this.currentUser?.id) return;
    
    this.loading = true;
    this.enseignantService.getCours(this.currentUser.id).subscribe({
      next: (cours) => {
        this.mesCours = cours;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getCoursIcon(code: string): string {
    if (code?.startsWith('COR')) return 'menu_book';
    if (code?.startsWith('HAD')) return 'history_edu';
    if (code?.startsWith('FIQ')) return 'gavel';
    if (code?.startsWith('TAF')) return 'auto_stories';
    if (code?.startsWith('ARA')) return 'translate';
    return 'book';
  }
}