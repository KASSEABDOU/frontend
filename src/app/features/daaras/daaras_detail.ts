import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { DaaraService } from '../../shared/services/daara';
import { TalibeService } from '../../shared/services/talibe';
import { EnseignantService } from '../../shared/services/enseignant';
import { BatimentService } from '../../shared/services/batiment';
import { Daara, Talibe, Enseignant, Batiment } from '../../core/models/user.model';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil, forkJoin } from 'rxjs';

@Component({
  selector: 'app-daara-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatExpansionModule,
    BaseChartDirective,
    LayoutComponent,
    MatProgressBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-layout>
      <div class="details-container" *ngIf="!loading() && daara() as daara">
        <!-- En-tête -->
        <mat-card class="header-card">
          <div class="header-content">
            <div class="icon-section">
              <div class="icon-wrapper">
                <mat-icon>business</mat-icon>
              </div>
              <mat-chip-set>
                <mat-chip color="primary" highlighted>
                  ID: {{daara.id}}
                </mat-chip>
              </mat-chip-set>
            </div>

            <div class="info-section">
              <h1>{{daara.nom}}</h1>
              <p class="subtitle">
                <mat-icon>location_on</mat-icon>
                {{daara.lieu || 'Lieu non spécifié'}}
              </p>
              <p class="proprietaire" *ngIf="daara.proprietaire">
                <mat-icon>person_outline</mat-icon>
                Propriétaire: {{daara.proprietaire}}
              </p>

              <div class="quick-stats">
                <div class="stat">
                  <mat-icon>school</mat-icon>
                  <span>{{talibes().length}} talibés</span>
                </div>
                <div class="stat">
                  <mat-icon>person</mat-icon>
                  <span>{{enseignants().length}} enseignants</span>
                </div>
                <div class="stat">
                  <mat-icon>apartment</mat-icon>
                  <span>{{batiments().length}} bâtiments</span>
                </div>
                <div class="stat">
                  <mat-icon>calculate</mat-icon>
                  <span>Ratio: {{ratio()}} : 1</span>
                </div>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="editDaara()">
                  <mat-icon>edit</mat-icon>
                  Modifier
                </button>
                <button mat-raised-button color="accent" routerLink="/daaras/map">
                  <mat-icon>map</mat-icon>
                  Voir sur carte
                </button>
                <button mat-raised-button (click)="exportData()">
                  <mat-icon>file_download</mat-icon>
                  Exporter
                </button>
                <button mat-raised-button color="warn" (click)="deleteDaara()">
                  <mat-icon>delete</mat-icon>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Statistiques visuelles -->
        <div class="stats-grid">
          <mat-card class="stat-card talibes">
            <mat-card-content>
              <mat-icon>school</mat-icon>
              <div class="stat-info">
                <h2>{{talibes().length}}</h2>
                <p>Talibés inscrits</p>
                <mat-progress-bar mode="determinate" [value]="capacityPercentage()" 
                                  [color]="capacityColor()"></mat-progress-bar>
                <small>{{capacityPercentage()}}% de capacité</small>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card enseignants">
            <mat-card-content>
              <mat-icon>person</mat-icon>
              <div class="stat-info">
                <h2>{{enseignants().length}}</h2>
                <p>Enseignants actifs</p>
                <mat-chip-set>
                  <mat-chip>{{specialitiesCount()}} spécialités</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card batiments">
            <mat-card-content>
              <mat-icon>apartment</mat-icon>
              <div class="stat-info">
                <h2>{{batiments().length}}</h2>
                <p>Bâtiments</p>
                <mat-chip-set>
                  <mat-chip>{{totalChambres()}} chambres</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card ratio">
            <mat-card-content>
              <mat-icon>trending_up</mat-icon>
              <div class="stat-info">
                <h2>{{ratio()}}</h2>
                <p>Ratio T/E</p>
                <mat-chip-set>
                  <mat-chip [color]="ratio() > 15 ? 'warn' : 'primary'">
                    {{ratio() > 15 ? 'Élevé' : 'Optimal'}}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Onglets -->
        <mat-tab-group class="content-tabs">
          <!-- Onglet Vue d'ensemble -->
          <mat-tab label="Vue d'ensemble">
            <div class="tab-content">
              <div class="overview-grid">
                <!-- Graphique répartition -->
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>pie_chart</mat-icon>
                      Répartition
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="chart-wrapper">
                      <canvas baseChart
                        [data]="pieChartData()"
                        [type]="'pie'"
                        [options]="pieChartOptions">
                      </canvas>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Informations générales -->
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>info</mat-icon>
                      Informations
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-list">
                      <div class="info-item">
                        <span class="label">Nom:</span>
                        <span class="value">{{daara.nom}}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Lieu:</span>
                        <span class="value">{{daara.lieu || 'Non spécifié'}}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Propriétaire:</span>
                        <span class="value">{{daara.proprietaire || 'Non spécifié'}}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Capacité totale:</span>
                        <span class="value">~{{capacity()}} personnes</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Talibés -->
          <mat-tab label="Talibés">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>school</mat-icon>
                    Liste des talibés ({{talibes().length}})
                  </mat-card-title>
                  <button mat-raised-button color="primary" routerLink="/talibes/create">
                    <mat-icon>add</mat-icon>
                    Ajouter un talibé
                  </button>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="talibes()" *ngIf="talibes().length > 0">
                    <ng-container matColumnDef="matricule">
                      <th mat-header-cell *matHeaderCellDef>Matricule</th>
                      <td mat-cell *matCellDef="let talibe">{{talibe.matricule}}</td>
                    </ng-container>

                    <ng-container matColumnDef="nom">
                      <th mat-header-cell *matHeaderCellDef>Nom complet</th>
                      <td mat-cell *matCellDef="let talibe">
                        <strong>{{talibe.nom}} {{talibe.prenom}}</strong>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="niveau">
                      <th mat-header-cell *matHeaderCellDef>Niveau</th>
                      <td mat-cell *matCellDef="let talibe">
                        <mat-chip>{{talibe.niveau || 'Non défini'}}</mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let talibe">
                        <button mat-icon-button [routerLink]="['/talibes', talibe.id]">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button [routerLink]="['/talibes', talibe.id, 'edit']">
                          <mat-icon>edit</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="talibesColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: talibesColumns;"></tr>
                  </table>

                  <div class="no-data" *ngIf="talibes().length === 0">
                    <mat-icon>person_off</mat-icon>
                    <p>Aucun talibé inscrit</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Onglet Enseignants -->
          <mat-tab label="Enseignants">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>person</mat-icon>
                    Corps enseignant ({{enseignants().length}})
                  </mat-card-title>
                  <button mat-raised-button color="primary" routerLink="/enseignants/create">
                    <mat-icon>add</mat-icon>
                    Ajouter un enseignant
                  </button>
                </mat-card-header>
                <mat-card-content>
                  <div class="enseignants-grid" *ngIf="enseignants().length > 0">
                    <mat-card *ngFor="let enseignant of enseignants()" class="enseignant-card">
                      <mat-card-content>
                        <div class="enseignant-header">
                          <mat-icon>person</mat-icon>
                          <div>
                            <h3>{{enseignant.nom}} {{enseignant.prenom}}</h3>
                            <p>{{enseignant.specialite || 'Spécialité non définie'}}</p>
                          </div>
                        </div>
                        <mat-chip-set>
                          <mat-chip color="accent">{{enseignant.grade || 'Enseignant'}}</mat-chip>
                          <mat-chip>{{enseignant.cours?.length || 0}} cours</mat-chip>
                        </mat-chip-set>
                        <div class="card-actions">
                          <button mat-button [routerLink]="['/enseignants', enseignant.id]">
                            Voir profil
                          </button>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <div class="no-data" *ngIf="enseignants().length === 0">
                    <mat-icon>person_off</mat-icon>
                    <p>Aucun enseignant assigné</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Onglet Infrastructure -->
          <mat-tab label="Infrastructure">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>apartment</mat-icon>
                    Bâtiments ({{batiments().length}})
                  </mat-card-title>
                  <button mat-raised-button color="primary" routerLink="/batiments/create">
                    <mat-icon>add</mat-icon>
                    Ajouter un bâtiment
                  </button>
                </mat-card-header>
                <mat-card-content>
                  <mat-accordion *ngIf="batiments().length > 0">
                    <mat-expansion-panel *ngFor="let batiment of batiments()">
                      <mat-expansion-panel-header>
                        <mat-panel-title>
                          <mat-icon>apartment</mat-icon>
                          {{batiment.nom}}
                        </mat-panel-title>
                        <mat-panel-description>
                          {{batiment.nombre_chambres}} chambres
                        </mat-panel-description>
                      </mat-expansion-panel-header>
                      <div class="batiment-details">
                        <p><strong>Nombre de chambres:</strong> {{batiment.nombre_chambres}}</p>
                        <button mat-raised-button color="primary" 
                                [routerLink]="['/batiments', batiment.id]">
                          <mat-icon>visibility</mat-icon>
                          Voir détails
                        </button>
                      </div>
                    </mat-expansion-panel>
                  </mat-accordion>

                  <div class="no-data" *ngIf="batiments().length === 0">
                    <mat-icon>apartment_off</mat-icon>
                    <p>Aucun bâtiment enregistré</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div class="loading-container" *ngIf="loading()">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des détails...</p>
      </div>
    </app-layout>
  `,
  styles: [`
    .details-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      gap: 30px;
      padding: 20px;
    }

    .icon-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .icon-wrapper {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .icon-wrapper mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: white;
    }

    .info-section {
      flex: 1;
    }

    .info-section h1 {
      margin: 0 0 10px 0;
      font-size: 36px;
      color: #333;
    }

    .subtitle,
    .proprietaire {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: #666;
      font-size: 16px;
    }

    .subtitle mat-icon,
    .proprietaire mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    .quick-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin: 25px 0;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 18px;
      background: #f5f5f5;
      border-radius: 25px;
      color: #666;
      font-weight: 500;
    }

    .stat mat-icon {
      color: #667eea;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
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

    .stat-card.talibes {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-card.enseignants {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-card.batiments {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .stat-card.ratio {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .content-tabs {
      margin-top: 30px;
    }

    .tab-content {
      padding: 30px 0;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .chart-card,
    .info-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px !important;
    }

    mat-card-title mat-icon {
      color: #667eea;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-wrapper {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .info-item .label {
      color: #666;
      font-weight: 600;
    }

    .info-item .value {
      color: #333;
      font-weight: 700;
    }

    table {
      width: 100%;
      margin-top: 20px;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
    }

    .enseignants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .enseignant-card {
      border-left: 4px solid #667eea;
    }

    .enseignant-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }

    .enseignant-header mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .enseignant-header h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .enseignant-header p {
      margin: 5px 0 0 0;
      font-size: 14px;
      color: #666;
    }

    .card-actions {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .batiment-details {
      padding: 15px;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #999;
      text-align: center;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 15px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    @media (max-width: 1024px) {
      .overview-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .enseignants-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DaaraDetailsComponent implements OnInit, OnDestroy {
  private daaraService = inject(DaaraService);
  private talibeService = inject(TalibeService);
  private enseignantService = inject(EnseignantService);
  private batimentService = inject(BatimentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  // Utilisation de signaux pour une réactivité optimisée
  daara = signal<Daara | null>(null);
  talibes = signal<Talibe[]>([]);
  enseignants = signal<Enseignant[]>([]);
  batiments = signal<Batiment[]>([]);
  loading = signal(true);
  
  talibesColumns = ['matricule', 'nom', 'niveau', 'actions'];

  // Propriétés calculées avec signaux
  ratio = computed(() => {
    const enseignantsCount = this.enseignants().length;
    const talibesCount = this.talibes().length;
    return enseignantsCount > 0 ? Math.round(talibesCount / enseignantsCount) : 0;
  });

  capacity = computed(() => {
    return Math.round((this.talibes().length + this.enseignants().length) * 1.2);
  });

  capacityPercentage = computed(() => {
    const cap = this.capacity();
    return Math.min(Math.round((this.talibes().length / cap) * 100), 100);
  });

  capacityColor = computed(() => {
    const percentage = this.capacityPercentage();
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  });

  specialitiesCount = computed(() => {
    const specialities = new Set(
      this.enseignants()
        .map(e => e.specialite)
        .filter(Boolean)
    );
    return specialities.size;
  });

  totalChambres = computed(() => {
    return this.batiments().reduce((sum, b) => sum + b.nombre_chambres, 0);
  });

  // Chart.js configuration
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  pieChartData = computed(() => {
    return {
      labels: ['Talibés', 'Enseignants', 'Bâtiments'],
      datasets: [{
        data: [this.talibes().length, this.enseignants().length, this.batiments().length],
        backgroundColor: ['#f093fb', '#4facfe', '#43e97b']
      }]
    };
  });

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = +params['id'];
        this.loadDaaraDetails(id);
      });
  }

  loadDaaraDetails(id: number): void {
    this.loading.set(true);

    forkJoin({
      daara: this.daaraService.getById(id),
      talibes: this.daaraService.getTalibes(id),
      enseignants: this.daaraService.getEnseignants(id),
      batiments: this.batimentService.getAll()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.daara.set(data.daara);
          this.talibes.set(data.talibes);
          this.enseignants.set(data.enseignants);
          this.batiments.set(data.batiments.filter(b => b.daara_id === id));
          this.loading.set(false);
        },
        error: () => {
          this.showError('Erreur de chargement');
          this.router.navigate(['/daaras']);
          this.loading.set(false);
        }
      });
  }

  editDaara(): void {
    const id = this.daara()?.id;
    if (id) {
      this.router.navigate(['/daaras', id, 'edit']);
    }
  }

  exportData(): void {
    this.snackBar.open('Export en cours...', 'Fermer', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  deleteDaara(): void {
    const daaraValue = this.daara();
    if (!daaraValue) return;

    if (confirm(`Supprimer le daara "${daaraValue.nom}" ?\n\nCette action est irréversible.`)) {
      this.daaraService.delete(daaraValue.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Daara supprimé');
            this.router.navigate(['/daaras']);
          },
          error: () => {
            this.showError('Erreur de suppression');
          }
        });
    }
  }

  // Méthodes utilitaires
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}