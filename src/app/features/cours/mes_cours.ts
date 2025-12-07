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
  selector: 'app-mes-cours',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
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
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="page-container">
        <!-- En-tête -->
        <div class="page-header">
          <div class="header-content">
            <div class="title-section">
              <h1>
                <mat-icon>school</mat-icon>
                Mes Cours
              </h1>
              <p>Gérez vos cours et suivez la progression de vos talibés</p>
            </div>
          </div>

          <!-- Statistiques rapides -->
          <div class="quick-stats" *ngFor="let cours of filteredCours">
            <div class="stat-item">
              <mat-icon>library_books</mat-icon>
              <div *ngIf="cours.is_active">
                <strong>{{1}}</strong>
                <span>Cours actifs</span>
              </div>
            </div>
            <div class="stat-item">
              <mat-icon>groups</mat-icon>
              <div>
                <strong>{{cours.nombre_talibes}}</strong>
                <span>Talibés encadrés</span>
              </div>
            </div>
            <div class="stat-item">
              <mat-icon>schedule</mat-icon>
              <div>
                <strong>{{cours.duree}}h</strong>
                <span>Charge hebdo</span>
              </div>
            </div>
            <div class="stat-item">
              <mat-icon>trending_up</mat-icon>
              <div>
                <strong>{{stats.tauxReussite}}%</strong>
                <span>Taux de réussite</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtres et recherche -->
        <mat-card class="filters-card">
          <mat-card-content>
            <div class="filters-container">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Rechercher un cours</mat-label>
                <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterCours()" placeholder="Code, libellé...">
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Niveau</mat-label>
                <mat-select [(ngModel)]="selectedNiveau" (ngModelChange)="filterCours()">
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
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Vue en cartes -->
        <div class="cours-grid" *ngIf="viewMode === 'cards'">
          <mat-card *ngFor="let cours of filteredCours" class="cours-card" [routerLink]="['/cours', cours.id]">
            <div class="card-header" [style.background]="getGradientColor(cours.code)">
              <mat-icon class="card-icon">{{getCoursIcon(cours.code)}}</mat-icon>
              <mat-chip-set class="level-chip">
                <mat-chip>{{cours.niveau}}</mat-chip>
              </mat-chip-set>
            </div>

            <mat-card-content>
              <div class="card-title">
                <h3>{{cours.libelle}}</h3>
                <p class="course-code">{{cours.code}}</p>
              </div>

              <mat-divider></mat-divider>

              <div class="course-stats">
                <div class="stat">
                  <mat-icon>groups</mat-icon>
                  <span>{{cours.nombre_talibes || 0}} talibés</span>
                </div>
                <div class="stat">
                  <mat-icon>schedule</mat-icon>
                  <span>{{cours.duree}}h/semaine</span>
                </div>
              </div>

              <div class="progress-section">
                <div class="progress-header">
                  <span>Progression du programme</span>
                  <strong>{{ 0}}%</strong>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="0"
                  [color]="getProgressColor(0)">
                </mat-progress-bar>
              </div>

              <div class="quick-actions">
                <button mat-icon-button matTooltip="Voir les talibés" [routerLink]="['/cours', cours.id, 'talibes']">
                  <mat-icon>people</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Emploi du temps">
                  <mat-icon>calendar_today</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Évaluations" [matBadge]="" matBadgeColor="warn">
                  <mat-icon>assignment</mat-icon>
                </button>
                <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Plus d'actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/cours', cours.id, 'edit']">
                    <mat-icon>edit</mat-icon>
                    <span>Modifier</span>
                  </button>
                  <button mat-menu-item>
                    <mat-icon>file_download</mat-icon>
                    <span>Exporter</span>
                  </button>
                  <button mat-menu-item>
                    <mat-icon>print</mat-icon>
                    <span>Imprimer</span>
                  </button>
                </mat-menu>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Vue en tableau -->
        <mat-card *ngIf="viewMode === 'table'">
          <mat-card-content>
            <table mat-table [dataSource]="filteredCours" class="full-width-table">
              <ng-container matColumnDef="cours">
                <th mat-header-cell *matHeaderCellDef>Cours</th>
                <td mat-cell *matCellDef="let cours">
                  <div class="course-info">
                    <mat-icon [style.color]="getIconColor(cours.code)">{{getCoursIcon(cours.code)}}</mat-icon>
                    <div>
                      <strong>{{cours.libelle}}</strong>
                      <p>{{cours.code}}</p>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="niveau">
                <th mat-header-cell *matHeaderCellDef>Niveau</th>
                <td mat-cell *matCellDef="let cours">
                  <mat-chip [color]="getNiveauColor(cours.niveau)">{{cours.niveau}}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="talibes">
                <th mat-header-cell *matHeaderCellDef>Talibés</th>
                <td mat-cell *matCellDef="let cours">
                  <div class="talibes-cell">
                    <mat-icon>groups</mat-icon>
                    <span>{{cours.nombre_talibes || 0}}</span>
                    <span class="capacity" *ngIf="cours.capacite_max">/ {{cours.capacite_max}}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="horaire">
                <th mat-header-cell *matHeaderCellDef>Horaire</th>
                <td mat-cell *matCellDef="let cours">
                  <div class="horaire-cell">
                    <mat-icon>schedule</mat-icon>
                    <span>{{cours.duree}}h/sem</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="progression">
                <th mat-header-cell *matHeaderCellDef>Progression</th>
                <td mat-cell *matCellDef="let cours">
                  <div class="progress-cell">
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="cours.progression || 0"
                      [color]="getProgressColor(cours.progression)">
                    </mat-progress-bar>
                    <span>{{cours.progression || 0}}%</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let cours">
                  <button mat-icon-button [routerLink]="['/cours', cours.id]" matTooltip="Voir détails">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button [routerLink]="['/cours', cours.id, 'talibes']" matTooltip="Voir talibés">
                    <mat-icon>people</mat-icon>
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="tableMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #tableMenu="matMenu">
                    <button mat-menu-item [routerLink]="['/cours', cours.id, 'edit']">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier</span>
                    </button>
                    <button mat-menu-item>
                      <mat-icon>file_download</mat-icon>
                      <span>Exporter</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="tableColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: tableColumns;" class="clickable-row"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <!-- Message si aucun cours -->
        <mat-card *ngIf="filteredCours.length === 0" class="empty-state">
          <mat-card-content>
            <mat-icon>school_off</mat-icon>
            <h3>Aucun cours trouvé</h3>
            <p>Vous n'avez pas encore de cours assignés ou aucun cours ne correspond à vos critères de recherche.</p>
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
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .cours-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
      margin-bottom: 30px;
    }

    .cours-card {
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .cours-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }

    .card-header {
      padding: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      position: relative;
    }

    .card-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .level-chip {
      position: absolute;
      top: 15px;
      right: 15px;
    }

    .card-title h3 {
      margin: 0 0 5px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .course-code {
      margin: 0;
      font-size: 13px;
      color: #999;
    }

    .course-stats {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 15px 0;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #666;
    }

    .stat mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    .progress-section {
      margin: 15px 0;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .progress-header strong {
      color: #667eea;
      font-weight: 600;
    }

    .quick-actions {
      display: flex;
      justify-content: space-around;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .full-width-table {
      width: 100%;
    }

    .course-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .course-info mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .course-info strong {
      display: block;
      font-size: 15px;
      margin-bottom: 3px;
    }

    .course-info p {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    .talibes-cell, .horaire-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .talibes-cell mat-icon, .horaire-cell mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #666;
    }

    .capacity {
      color: #999;
      font-size: 13px;
    }

    .progress-cell {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .progress-cell mat-progress-bar {
      flex: 1;
      min-width: 100px;
    }

    .progress-cell span {
      min-width: 45px;
      text-align: right;
      font-size: 13px;
      font-weight: 600;
      color: #667eea;
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

    @media (max-width: 768px) {
      .filters-container {
        flex-direction: column;
      }

      .cours-grid {
        grid-template-columns: 1fr;
      }

      .quick-stats {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class MesCoursComponent implements OnInit {
  private enseignantService = inject(EnseignantService);
  private authService = inject(AuthService);

  cours: Cours[] = [];
  user: any;
  filteredCours: Cours[] = [];
  searchTerm = '';
  selectedNiveau = '';
  viewMode: 'cards' | 'table' = 'cards';

  stats = {
    totalCours: 5,
    totalTalibes: 87,
    heuresHebdo: 18,
    tauxReussite: 85
  };

  tableColumns = ['cours', 'niveau', 'talibes', 'horaire', 'progression', 'actions'];

  ngOnInit(): void {
    this.loadCours();
  }

  loadCours(): void {
    this.user = this.authService.getCurrentUser();
    const userId = this.user.id;
    this.enseignantService.getCours(userId).subscribe({
      next: (data) => {
        this.cours = data;
        this.filteredCours = data;
      }
    });
  }

  filterCours(): void {
    this.filteredCours = this.cours.filter(cours => {
      const matchesSearch = !this.searchTerm || 
        cours.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cours.code.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesNiveau = !this.selectedNiveau || cours.niveau === this.selectedNiveau;

      return matchesSearch && matchesNiveau;
    });
  }

  getCoursIcon(code: string): string {
    if (code.startsWith('COR')) return 'menu_book';
    if (code.startsWith('HAD')) return 'history_edu';
    if (code.startsWith('FIQ')) return 'gavel';
    if (code.startsWith('TAF')) return 'auto_stories';
    if (code.startsWith('ARA')) return 'translate';
    return 'book';
  }

  getGradientColor(code: string): string {
    if (code.startsWith('COR')) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (code.startsWith('HAD')) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    if (code.startsWith('FIQ')) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    if (code.startsWith('TAF')) return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    if (code.startsWith('ARA')) return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  getIconColor(code: string): string {
    if (code.startsWith('COR')) return '#667eea';
    if (code.startsWith('HAD')) return '#f5576c';
    if (code.startsWith('FIQ')) return '#00f2fe';
    if (code.startsWith('TAF')) return '#38f9d7';
    if (code.startsWith('ARA')) return '#fa709a';
    return '#667eea';
  }

  getNiveauColor(niveau: string): string {
    if (niveau === 'Débutant') return 'primary';
    if (niveau === 'Intermédiaire') return 'accent';
    if (niveau === 'Avancé') return 'warn';
    return '';
  }

  getProgressColor(progression: number): 'primary' | 'accent' | 'warn' {
    if (progression >= 70) return 'accent';
    if (progression >= 40) return 'primary';
    return 'warn';
  }
}