import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { EnseignantService } from '../../shared/services/enseignant';
import { AuthService } from '../../core/services/auth';
import { Cours, User } from '../../core/models/user.model';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-mes-talibes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatProgressBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    LayoutComponent,
    MatDividerModule
  ],
  template: `
    <app-layout>
      <div class="page-container">
        <!-- En-tête -->
        <div class="page-header">
          <div class="header-content">
            <div class="title-section">
              <h1>
                <mat-icon>groups</mat-icon>
                Mes Talibés
              </h1>
              <p>Liste complète des talibés que vous encadrez</p>
            </div>
          </div>

          <!-- Statistiques rapides -->
          <div class="quick-stats">
            <div class="stat-item">
              <mat-icon>school</mat-icon>
              <div>
                <strong>{{filteredTalibes.length}}</strong>
                <span>Talibés encadrés</span>
              </div>
            </div>
            <div class="stat-item">
              <mat-icon>event_available</mat-icon>
              <div>
                <strong>{{stats.tauxPresence}}%</strong>
                <span>Taux de présence</span>
              </div>
            </div>
            <div class="stat-item">
              <mat-icon>trending_up</mat-icon>
              <div>
                <strong>{{stats.moyenneClasse}}/20</strong>
                <span>Moyenne de classe</span>
              </div>
            </div>
            <div class="stat-item">
              <mat-icon>star</mat-icon>
              <div>
                <strong>{{stats.excellents}}</strong>
                <span>Excellents</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtres et recherche -->
        <mat-card class="filters-card">
          <mat-card-content>
            <div class="filters-container">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Rechercher un talibé</mat-label>
                <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterTalibes()" placeholder="Nom, prénom, matricule...">
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Cours</mat-label>
                <mat-select [(ngModel)]="selectedCours" (ngModelChange)="filterTalibes()">
                  <mat-option value="">Tous les cours</mat-option>
                  <mat-option *ngFor="let cours of mesCours" [value]="cours.id">
                    {{cours.libelle}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Niveau</mat-label>
                <mat-select [(ngModel)]="selectedNiveau" (ngModelChange)="filterTalibes()">
                  <mat-option value="">Tous les niveaux</mat-option>
                  <mat-option value="Débutant">Débutant</mat-option>
                  <mat-option value="Intermédiaire">Intermédiaire</mat-option>
                  <mat-option value="Avancé">Avancé</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Affichage</mat-label>
                <mat-select [(ngModel)]="viewMode">
                  <mat-option value="cards">
                    <mat-icon>view_module</mat-icon>
                    Cartes
                  </mat-option>
                  <mat-option value="table">
                    <mat-icon>view_list</mat-icon>
                    Tableau
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-raised-button color="primary">
                <mat-icon>file_download</mat-icon>
                Exporter la liste
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Vue en cartes -->
        <div class="talibes-grid" *ngIf="viewMode === 'cards'">
          <mat-card *ngFor="let talibe of filteredTalibes" class="talibe-card">
            <div class="card-header">
              <div class="avatar">
                <mat-icon>person</mat-icon>
              </div>
              <mat-chip-set class="status-chip">
                <mat-chip [color]="getStatusColor(talibe.statut)">
                  {{talibe.statut}}
                </mat-chip>
              </mat-chip-set>
            </div>

            <mat-card-content>
              <div class="talibe-info">
                <h3>{{talibe.prenom}} {{talibe.nom}}</h3>
                <p class="matricule">{{talibe.matricule}}</p>
                
                <div class="info-grid">
                  <div class="info-item">
                    <mat-icon>cake</mat-icon>
                    <span>{{talibe.age}} ans</span>
                  </div>
                  <div class="info-item">
                    <mat-icon>layers</mat-icon>
                    <span>{{talibe.niveau}}</span>
                  </div>
                  <div class="info-item">
                    <mat-icon>school</mat-icon>
                    <span>{{talibe.cours_principal}}</span>
                  </div>
                  <div class="info-item">
                    <mat-icon>phone</mat-icon>
                    <span>{{talibe.telephone_tuteur}}</span>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="performance-section">
                  <div class="performance-item">
                    <span>Présence</span>
                    <div class="progress-wrapper">
                      <mat-progress-bar 
                        mode="determinate" 
                        [value]="talibe.taux_presence"
                        [color]="getPresenceColor(talibe.taux_presence)">
                      </mat-progress-bar>
                      <strong>{{talibe.taux_presence}}%</strong>
                    </div>
                  </div>

                  <div class="performance-item">
                    <span>Moyenne</span>
                    <div class="moyenne-badge" [ngClass]="getMoyenneClass(talibe.moyenne)">
                      {{talibe.moyenne}}/20
                    </div>
                  </div>
                </div>

                <div class="card-actions">
                  <button mat-button color="primary" [routerLink]="['/talibes', talibe.id]">
                    <mat-icon>visibility</mat-icon>
                    Voir profil
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item>
                      <mat-icon>grade</mat-icon>
                      <span>Évaluer</span>
                    </button>
                    <button mat-menu-item>
                      <mat-icon>event_busy</mat-icon>
                      <span>Absences</span>
                    </button>
                    <button mat-menu-item>
                      <mat-icon>message</mat-icon>
                      <span>Contacter tuteur</span>
                    </button>
                  </mat-menu>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Vue en tableau -->
        <mat-card *ngIf="viewMode === 'table'">
          <mat-card-content>
            <table mat-table [dataSource]="filteredTalibes" class="full-width-table">
              <ng-container matColumnDef="talibe">
                <th mat-header-cell *matHeaderCellDef>Talibé</th>
                <td mat-cell *matCellDef="let talibe">
                  <div class="talibe-cell">
                    <div class="avatar-small">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div>
                      <strong>{{talibe.prenom}} {{talibe.nom}}</strong>
                      <p>{{talibe.matricule}}</p>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="niveau">
                <th mat-header-cell *matHeaderCellDef>Niveau</th>
                <td mat-cell *matCellDef="let talibe">
                  <mat-chip>{{talibe.niveau}}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="cours">
                <th mat-header-cell *matHeaderCellDef>Cours principal</th>
                <td mat-cell *matCellDef="let talibe">
                  {{talibe.cours_principal}}
                </td>
              </ng-container>

              <ng-container matColumnDef="presence">
                <th mat-header-cell *matHeaderCellDef>Présence</th>
                <td mat-cell *matCellDef="let talibe">
                  <div class="presence-cell">
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="talibe.taux_presence"
                      [color]="getPresenceColor(talibe.taux_presence)">
                    </mat-progress-bar>
                    <span>{{talibe.taux_presence}}%</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="moyenne">
                <th mat-header-cell *matHeaderCellDef>Moyenne</th>
                <td mat-cell *matCellDef="let talibe">
                  <div class="moyenne-badge" [ngClass]="getMoyenneClass(talibe.moyenne)">
                    {{talibe.moyenne}}/20
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let talibe">
                  <mat-chip [color]="getStatusColor(talibe.statut)">
                    {{talibe.statut}}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let talibe">
                  <button mat-icon-button [routerLink]="['/talibes', talibe.id]" matTooltip="Voir profil">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Évaluer">
                    <mat-icon>grade</mat-icon>
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="tableMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #tableMenu="matMenu">
                    <button mat-menu-item>
                      <mat-icon>event_busy</mat-icon>
                      <span>Gérer absences</span>
                    </button>
                    <button mat-menu-item>
                      <mat-icon>message</mat-icon>
                      <span>Contacter tuteur</span>
                    </button>
                    <button mat-menu-item>
                      <mat-icon>print</mat-icon>
                      <span>Imprimer relevé</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="tableColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: tableColumns;" class="clickable-row"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <!-- Message si aucun talibé -->
        <mat-card *ngIf="filteredTalibes.length === 0" class="empty-state">
          <mat-card-content>
            <mat-icon>person_off</mat-icon>
            <h3>Aucun talibé trouvé</h3>
            <p>Aucun talibé ne correspond à vos critères de recherche.</p>
          </mat-card-content>
        </mat-card>

        <!-- Statistiques par cours -->
        <mat-card class="stats-by-course">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>bar_chart</mat-icon>
              Statistiques par cours
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="course-stats-grid">
              <div *ngFor="let stat of courseStats" class="course-stat-item">
                <div class="course-stat-header">
                  <mat-icon [style.color]="stat.color">{{stat.icon}}</mat-icon>
                  <h4>{{stat.cours}}</h4>
                </div>
                <div class="course-stat-details">
                  <div class="stat-detail">
                    <span>Talibés</span>
                    <strong>{{stat.nombre_talibes}}</strong>
                  </div>
                  <div class="stat-detail">
                    <span>Présence</span>
                    <strong>{{stat.taux_presence}}%</strong>
                  </div>
                  <div class="stat-detail">
                    <span>Moyenne</span>
                    <strong>{{stat.moyenne}}/20</strong>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 30px;
    }

    .header-content {
      margin-bottom: 20px;
    }

    .title-section h1 {
      display: flex;
      align-items: center;
      gap: 15px;
      margin: 0 0 10px 0;
      font-size: 32px;
      color: #333;
    }

    .title-section h1 mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .title-section p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      color: white;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stat-item mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      opacity: 0.9;
    }

    .stat-item strong {
      display: block;
      font-size: 24px;
      font-weight: 700;
    }

    .stat-item span {
      display: block;
      font-size: 13px;
      opacity: 0.9;
    }

    .filters-card {
      margin-bottom: 30px;
    }

    .filters-container {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .talibes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
      margin-bottom: 30px;
    }

    .talibe-card {
      transition: all 0.3s ease;
    }

    .talibe-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .avatar mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .status-chip {
      position: absolute;
      top: 15px;
      right: 15px;
    }

    .talibe-info h3 {
      margin: 0 0 5px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .matricule {
      margin: 0 0 15px 0;
      font-size: 13px;
      color: #999;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 15px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;
    }

    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .performance-section {
      margin: 15px 0;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .performance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .performance-item span {
      font-size: 13px;
      color: #666;
      font-weight: 500;
    }

    .progress-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      margin-left: 15px;
    }

    .progress-wrapper mat-progress-bar {
      flex: 1;
    }

    .progress-wrapper strong {
      min-width: 45px;
      text-align: right;
      font-size: 13px;
      color: #667eea;
    }

    .moyenne-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
      text-align: center;
    }

    .moyenne-badge.excellent {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .moyenne-badge.bien {
      background: #e3f2fd;
      color: #1565c0;
    }

    .moyenne-badge.moyen {
      background: #fff3e0;
      color: #e65100;
    }

    .moyenne-badge.faible {
      background: #ffebee;
      color: #c62828;
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .full-width-table {
      width: 100%;
    }

    .talibe-cell {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .avatar-small {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .avatar-small mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .talibe-cell strong {
      display: block;
      font-size: 14px;
      margin-bottom: 3px;
    }

    .talibe-cell p {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    .presence-cell {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .presence-cell mat-progress-bar {
      flex: 1;
      min-width: 100px;
    }

    .presence-cell span {
      min-width: 45px;
      text-align: right;
      font-size: 13px;
      font-weight: 600;
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background-color: #f5f5f5;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin: 0 0 10px 0;
      font-size: 24px;
      color: #666;
    }

    .empty-state p {
      margin: 0;
      color: #999;
    }

    .stats-by-course {
      margin-top: 30px;
    }

    .course-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .course-stat-item {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .course-stat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
    }

    .course-stat-header mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .course-stat-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .course-stat-details {
      display: flex;
      justify-content: space-around;
      gap: 15px;
    }

    .stat-detail {
      text-align: center;
    }

    .stat-detail span {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }

    .stat-detail strong {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    @media (max-width: 768px) {
      .filters-container {
        flex-direction: column;
      }

      .talibes-grid {
        grid-template-columns: 1fr;
      }

      .quick-stats {
        grid-template-columns: 1fr 1fr;
      }

      .course-stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MesTalibesComponent implements OnInit {
  private enseignantService = inject(EnseignantService);
  private authService = inject(AuthService);

  talibes: any[] = [];
  enseignant : any;
  filteredTalibes: any[] = [];
  mesCours: any[] = [];
  searchTerm = '';
  selectedCours = '';
  selectedNiveau = '';
  viewMode: 'cards' | 'table' = 'cards';

  stats = {
    totalTalibes: 87,
    tauxPresence: 92,
    moyenneClasse: 14.5,
    excellents: 23
  };

  courseStats = [
    {
      cours: 'Coran - Niveau 1',
      icon: 'menu_book',
      color: '#667eea',
      nombre_talibes: 25,
      taux_presence: 95,
      moyenne: 15.2
    },
    {
      cours: 'Hadith - Intermédiaire',
      icon: 'history_edu',
      color: '#f5576c',
      nombre_talibes: 18,
      taux_presence: 88,
      moyenne: 13.8
    },
    {
      cours: 'Fiqh - Avancé',
      icon: 'gavel',
      color: '#00f2fe',
      nombre_talibes: 12,
      taux_presence: 92,
      moyenne: 16.1
    }
  ];

  tableColumns = ['talibe', 'niveau', 'cours', 'presence', 'moyenne', 'statut', 'actions'];

  ngOnInit(): void {
    this.loadTalibes();
    this.loadMesCours();
  }

  loadTalibes(): void {
     this.enseignant = this.authService.getCurrentUser();
    const userId = this.enseignant.id;
    this.enseignantService.getTalibes(userId).subscribe({
      next: (data) => {
        this.talibes = data;
        this.filteredTalibes = data;
      }
    });
  }

  loadMesCours(): void {
    this.enseignant = this.authService.getCurrentUser();
    const userId = this.enseignant.id;
    this.enseignantService.getCours(userId).subscribe({
      next: (data) => {
        this.mesCours = data;
      }
    });
  }

  filterTalibes(): void {
    this.filteredTalibes = this.talibes.filter(talibe => {
      const matchesSearch = !this.searchTerm || 
        talibe.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        talibe.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        talibe.matricule.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCours = !this.selectedCours || talibe.cours_id === this.selectedCours;
      const matchesNiveau = !this.selectedNiveau || talibe.niveau === this.selectedNiveau;

      return matchesSearch && matchesCours && matchesNiveau;
    });
  }

  getStatusColor(statut: string): 'primary' | 'accent' | 'warn' | '' {
    if (statut === 'Actif') return 'accent';
    if (statut === 'Suspendu') return 'warn';
    return '';
  }

  getPresenceColor(taux: number): 'primary' | 'accent' | 'warn' {
    if (taux >= 90) return 'accent';
    if (taux >= 75) return 'primary';
    return 'warn';
  }

  getMoyenneClass(moyenne: number): string {
    if (moyenne >= 16) return 'excellent';
    if (moyenne >= 14) return 'bien';
    if (moyenne >= 10) return 'moyen';
    return 'faible';
  }
}