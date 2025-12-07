// talibes-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { AuthService } from '../../core/services/auth';
import { TalibeService } from '../../shared/services/talibe';

@Component({
  selector: 'app-talibes-dashboard',
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
    MatTableModule,
    MatProgressBarModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="talibe-dashboard" *ngIf="currentUser && !loading">
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
              <p class="subtitle">Bienvenue dans votre espace talibé</p>
              
              <div class="quick-info">
                <mat-chip color="primary">{{ currentUser.matricule }}</mat-chip>
                <mat-chip color="accent" *ngIf="currentUser.niveau">
                  {{ currentUser.niveau }}
                </mat-chip>
                <mat-chip *ngIf="currentUser.daara">
                  {{ currentUser.daara.nom }}
                </mat-chip>
                <mat-chip *ngIf="currentUser.chambre">
                  Chambre {{ currentUser.chambre.numero }}
                </mat-chip>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Statistiques -->
        <div class="stats-grid">
          <mat-card class="stat-card cours">
            <mat-card-content>
              <mat-icon>menu_book</mat-icon>
              <div class="stat-info">
                <h2>{{ mesCours.length }}</h2>
                <p>Cours inscrits</p>
                <small>Cette année scolaire</small>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card notes">
            <mat-card-content>
              <mat-icon>grade</mat-icon>
              <div class="stat-info">
                <h2>{{ getMoyenneGenerale() }}/20</h2>
                <p>Moyenne générale</p>
                <small>Dernière évaluation</small>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card presence">
            <mat-card-content>
              <mat-icon>check_circle</mat-icon>
              <div class="stat-info">
                <h2>{{ tauxPresence }}%</h2>
                <p>Taux de présence</p>
                <small>Ce mois</small>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card progression">
            <mat-card-content>
              <mat-icon>trending_up</mat-icon>
              <div class="stat-info">
                <h2>{{ getProgression() }}%</h2>
                <p>Progression</p>
                <mat-progress-bar mode="determinate" [value]="getProgression()"></mat-progress-bar>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Mes Cours -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">
              <mat-icon>school</mat-icon>
              Mes Cours ({{ mesCours.length }})
            </h2>
            <button mat-raised-button color="primary" routerLink="/talibes/mes-cours">
              Voir tous mes cours
            </button>
          </div>

          <div class="cours-grid" *ngIf="mesCours.length > 0">
            <mat-card *ngFor="let cours of mesCours.slice(0, 4)" class="cours-card">
              <mat-card-content>
                <div class="cours-header">
                  <mat-icon [class]="getCoursIconClass(cours.categorie)">{{ getCoursIcon(cours.categorie) }}</mat-icon>
                  <div>
                    <h3>{{ cours.libelle }}</h3>
                    <p class="cours-code">{{ cours.code }}</p>
                  </div>
                </div>
                
                <mat-divider></mat-divider>
                
                <div class="cours-info">
                  <div class="info-item">
                    <mat-icon>person</mat-icon>
                    <span>{{ cours.enseignant_nom || 'Enseignant non assigné' }}</span>
                  </div>
                  
                  <div class="info-item">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ cours.duree || 0 }}h/semaine</span>
                  </div>
                  
                  <div class="info-item" *ngIf="getNoteCours(cours.id)">
                    <mat-icon>grade</mat-icon>
                    <span class="note">{{ getNoteCours(cours.id) }}/20</span>
                  </div>
                </div>
                
                <mat-chip-set>
                  <mat-chip [color]="getNiveauColor(cours.niveau)">
                    {{ cours.niveau || 'Tous niveaux' }}
                  </mat-chip>
                  <mat-chip *ngIf="cours.is_certificat" color="accent">
                    <mat-icon>verified</mat-icon>
                    Certificat
                  </mat-chip>
                </mat-chip-set>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-button [routerLink]="['/cours', cours.id]">
                  Détails
                </button>
                <button mat-button [routerLink]="['/talibes/cours', cours.id, 'notes']">
                  Notes
                </button>
              </mat-card-actions>
            </mat-card>
          </div>

          <div class="no-data" *ngIf="mesCours.length === 0">
            <mat-icon>school_off</mat-icon>
            <p>Vous n'êtes inscrit à aucun cours pour le moment</p>
            <button mat-raised-button color="primary" routerLink="/cours">
              <mat-icon>search</mat-icon>
              Parcourir les cours
            </button>
          </div>
        </div>

        <!-- Dernières notes -->
        <div class="section" *ngIf="dernieresNotes.length > 0">
          <h2 class="section-title">
            <mat-icon>grading</mat-icon>
            Dernières notes
          </h2>
          
          <mat-card>
            <mat-card-content>
              <table mat-table [dataSource]="dernieresNotes">
                <!-- Cours Column -->
                <ng-container matColumnDef="cours">
                  <th mat-header-cell *matHeaderCellDef>Cours</th>
                  <td mat-cell *matCellDef="let note">
                    <div class="cours-cell">
                      <mat-icon>{{ getCoursIcon(note.cours_categorie) }}</mat-icon>
                      <span>{{ note.cours_libelle }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Note Column -->
                <ng-container matColumnDef="note">
                  <th mat-header-cell *matHeaderCellDef>Note</th>
                  <td mat-cell *matCellDef="let note">
                    <span class="note-value" [class.excellent]="note.valeur >= 16"
                          [class.bon]="note.valeur >= 14 && note.valeur < 16"
                          [class.moyen]="note.valeur >= 10 && note.valeur < 14"
                          [class.faible]="note.valeur < 10">
                      {{ note.valeur }}/20
                    </span>
                  </td>
                </ng-container>

                <!-- Date Column -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let note">
                    {{ note.date_evaluation | date:'dd/MM/yyyy' }}
                  </td>
                </ng-container>

                <!-- Commentaire Column -->
                <ng-container matColumnDef="commentaire">
                  <th mat-header-cell *matHeaderCellDef>Commentaire</th>
                  <td mat-cell *matCellDef="let note">
                    {{ note.commentaire || 'Aucun commentaire' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="notesColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: notesColumns;"></tr>
              </table>
            </mat-card-content>
            
            <mat-card-actions>
              <button mat-button routerLink="/talibes/mes-notes">
                Voir toutes mes notes
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Prochaines échéances -->
        <div class="section">
          <h2 class="section-title">
            <mat-icon>event</mat-icon>
            Prochaines échéances
          </h2>
          
          <mat-card>
            <mat-card-content>
              <div class="echeances-list">
                <div class="echeance-item" *ngFor="let echeance of prochainesEcheances">
                  <mat-icon class="echeance-icon">event_note</mat-icon>
                  <div class="echeance-content">
                    <h4>{{ echeance.titre }}</h4>
                    <p>{{ echeance.description }}</p>
                    <div class="echeance-meta">
                      <span class="date">
                        <mat-icon>schedule</mat-icon>
                        {{ echeance.date | date:'dd/MM/yyyy' }}
                      </span>
                      <span class="cours">
                        <mat-icon>book</mat-icon>
                        {{ echeance.cours_libelle }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="no-echeances" *ngIf="prochainesEcheances.length === 0">
                  <mat-icon>event_available</mat-icon>
                  <p>Aucune échéance prochaine</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Informations personnelles -->
        <!--<div class="section">
          <h2 class="section-title">
            <mat-icon>info</mat-icon>
            Mes informations
          </h2>
          
          <div class="info-grid">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Informations personnelles</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-item">
                  <span class="label">Matricule:</span>
                  <span class="value">{{ currentUser.matricule }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Nom complet:</span>
                  <span class="value">{{ currentUser.prenom }} {{ currentUser.nom }}</span>
                </div>
                <div class="info-item" *ngIf="currentUser.date_naissance">
                  <span class="label">Date de naissance:</span>
                  <span class="value">{{ currentUser.date_naissance | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-item" *ngIf="currentUser.lieu_naissance">
                  <span class="label">Lieu de naissance:</span>
                  <span class="value">{{ currentUser.lieu_naissance }}</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-card-title>Scolarité</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-item" *ngIf="currentUser.niveau">
                  <span class="label">Niveau:</span>
                  <span class="value">{{ currentUser.niveau }}</span>
                </div>
                <div class="info-item" *ngIf="currentUser.date_entree">
                  <span class="label">Date d'entrée:</span>
                  <span class="value">{{ currentUser.date_entree | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Années au daara:</span>
                  <span class="value">{{ getAnneesDaara() }} ans</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>-->
      </div>

      <!-- Loading state -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement de votre dashboard...</p>
      </div>
    </app-layout>
  `,
  styles: [`
    .talibe-dashboard {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      color: white;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 25px !important;
    }

    .stat-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-info h2 {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
    }

    .stat-info p {
      margin: 5px 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .stat-info small {
      font-size: 12px;
      opacity: 0.8;
    }

    .stat-card.cours {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    }

    .stat-card.notes {
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
    }

    .stat-card.presence {
      background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
    }

    .stat-card.progression {
      background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
    }

    .section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .cours-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .cours-card {
      border-left: 4px solid #4CAF50;
      transition: transform 0.2s;
    }

    .cours-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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
      margin: 16px 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }

    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #666;
    }

    .note {
      font-weight: bold;
      color: #FF9800;
    }

    table {
      width: 100%;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
    }

    .cours-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .note-value {
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .note-value.excellent {
      background: #4CAF50;
      color: white;
    }

    .note-value.bon {
      background: #8BC34A;
      color: white;
    }

    .note-value.moyen {
      background: #FFC107;
      color: #333;
    }

    .note-value.faible {
      background: #F44336;
      color: white;
    }

    .echeances-list {
      padding: 8px 0;
    }

    .echeance-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }

    .echeance-item:last-child {
      border-bottom: none;
    }

    .echeance-icon {
      color: #2196F3;
    }

    .echeance-content h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
    }

    .echeance-content p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .echeance-meta {
      display: flex;
      gap: 16px;
    }

    .echeance-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #999;
    }

    .no-echeances {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .no-echeances mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item .label {
      color: #666;
      font-weight: 500;
    }

    .info-item .value {
      color: #333;
      font-weight: 600;
      text-align: right;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .welcome-content {
        flex-direction: column;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .cours-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TalibesDashboardComponent implements OnInit {
  currentUser: any;
  mesCours: any[] = [];
  dernieresNotes: any[] = [];
  prochainesEcheances: any[] = [];
  tauxPresence = 85;
  loading = true;
  
  notesColumns = ['cours', 'note', 'date', 'commentaire'];

  constructor(
    private authService: AuthService,
    private talibeService: TalibeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (!this.currentUser?.id) {
      this.loading = false;
      return;
    }

    // Charger les cours du talibé
    this.talibeService.getMesCours(this.currentUser.id).subscribe({
      next: (cours) => {
        this.mesCours = cours;
        this.loadNotes();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadNotes(): void {
    this.talibeService.getMesNotes(this.currentUser.id).subscribe({
      next: (notes) => {
        this.dernieresNotes = notes.slice(0, 5); // 5 dernières notes
        this.loadEcheances();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadEcheances(): void {
    this.talibeService.getProchainesEcheances(this.currentUser.id).subscribe({
      next: (echeances) => {
        this.prochainesEcheances = echeances;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getMoyenneGenerale(): number {
    if (this.dernieresNotes.length === 0) return 0;
    const sum = this.dernieresNotes.reduce((total, note) => total + note.valeur, 0);
    return Math.round((sum / this.dernieresNotes.length) * 10) / 10;
  }

  getProgression(): number {
    // Simulation - À remplacer par vraie logique
    return 75;
  }

  getAnneesDaara(): number {
    if (!this.currentUser?.date_entree) return 0;
    const dateEntree = new Date(this.currentUser.date_entree);
    const today = new Date();
    return today.getFullYear() - dateEntree.getFullYear();
  }

  getNoteCours(coursId: number): number | null {
    const note = this.dernieresNotes.find(n => n.cours_id === coursId);
    return note ? note.valeur : null;
  }

  getCoursIcon(categorie: string): string {
    const cat = (categorie || '').toLowerCase();
    if (cat.includes('coran')) return 'menu_book';
    if (cat.includes('hadith')) return 'history_edu';
    if (cat.includes('fiqh')) return 'gavel';
    if (cat.includes('tafsir')) return 'auto_stories';
    if (cat.includes('arabe')) return 'translate';
    return 'school';
  }

  getCoursIconClass(categorie: string): string {
    const cat = (categorie || '').toLowerCase();
    if (cat.includes('coran')) return 'coran-icon';
    if (cat.includes('hadith')) return 'hadith-icon';
    if (cat.includes('fiqh')) return 'fiqh-icon';
    if (cat.includes('tafsir')) return 'tafsir-icon';
    if (cat.includes('arabe')) return 'arabe-icon';
    return '';
  }

  getNiveauColor(niveau: string): string {
    const niv = (niveau || '').toLowerCase();
    if (niv.includes('débutant')) return 'primary';
    if (niv.includes('intermédiaire')) return 'accent';
    if (niv.includes('avancé')) return 'warn';
    return '';
  }
}