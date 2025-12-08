// ============================================
import { Component, OnInit, inject,ChangeDetectionStrategy, computed, signal } from '@angular/core';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { EnseignantService } from '../../shared/services/enseignant';
import { Enseignant, Cours, Talibe } from '../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-enseignant-details',
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
    MatProgressBarModule,
    LayoutComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-layout>
      <div class="details-container" *ngIf="!loading() && enseignant() as enseignant">
        <!-- En-tête -->
        <mat-card class="header-card">
          <div class="header-content">
            <div class="avatar-wrapper">
              <mat-icon>person</mat-icon>
            </div>

            <div class="info-section">
              <div class="title-section">
                <h1>{{enseignant.prenom}} {{enseignant.nom}}</h1>
                <mat-chip-set>
                  <mat-chip color="primary" highlighted>
                    {{enseignant.matricule}}
                  </mat-chip>
                  <mat-chip [color]="gradeColor()">
                    {{enseignant.grade || 'Enseignant'}}
                  </mat-chip>
                  <mat-chip *ngIf="isActive" color="accent">
                    <mat-icon>check_circle</mat-icon>
                    Actif
                  </mat-chip>
                </mat-chip-set>
              </div>

              <div class="quick-stats">
                <div class="stat">
                  <mat-icon>school</mat-icon>
                  <span>{{cours().length}} cours assignés</span>
                </div>
                <div *ngIf="totalTalibes() > 0" class="stat">
                  <mat-icon>groups</mat-icon>
                  <span>{{totalTalibes()}} talibés</span>
                </div>
                <div class="stat" *ngIf="enseignant.specialite">
                  <mat-icon>menu_book</mat-icon>
                  <span>{{enseignant.specialite}}</span>
                </div>
                <div class="stat" *ngIf="enseignant.telephone">
                  <mat-icon>phone</mat-icon>
                  <span>{{enseignant.telephone}}</span>
                </div>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="editEnseignant()">
                  <mat-icon>edit</mat-icon>
                  Modifier
                </button>
                <button mat-raised-button (click)="exportData()">
                  <mat-icon>file_download</mat-icon>
                  Exporter
                </button>
                <button mat-raised-button color="warn" (click)="deleteEnseignant()">
                  <mat-icon>delete</mat-icon>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Stats cards -->
        <div class="stats-grid">
          <mat-card class="stat-card cours">
            <mat-card-content>
              <mat-icon>school</mat-icon>
              <div class="stat-info">
                <h2>{{cours().length}}</h2>
                <p>Cours assignés</p>
                <small>Charge d'enseignement</small>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card talibes">
            <mat-card-content>
              <mat-icon>groups</mat-icon>
              <div class="stat-info">
                <h2>{{totalTalibes()}}</h2>
                <p>Talibés encadrés</p>
                <small>Tous cours confondus</small>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card experience">
            <mat-card-content>
              <mat-icon>work</mat-icon>
              <div class="stat-info">
                <h2>{{experience()}}</h2>
                <p>Années d'expérience</p>
                <small *ngIf="enseignant.date_recrutement">
                  Depuis {{enseignant.date_recrutement | date:'yyyy'}}
                </small>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card performance">
            <mat-card-content>
              <mat-icon>star</mat-icon>
              <div class="stat-info">
                <h2>{{performance()}}/5</h2>
                <p>Évaluation</p>
                <mat-chip-set>
                  <mat-chip [color]="performanceColor()">
                    {{performanceLabel()}}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Onglets -->
        <mat-tab-group class="content-tabs">
          <!-- Onglet Informations -->
          <mat-tab label="Informations">
            <div class="tab-content">
              <div class="info-grid">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>info</mat-icon>
                      Informations personnelles
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Matricule:</span>
                      <span class="value">{{enseignant.matricule}}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Nom complet:</span>
                      <span class="value">{{enseignant.prenom}} {{enseignant.nom}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.date_naissance">
                      <span class="label">Date de naissance:</span>
                      <span class="value">{{enseignant.date_naissance | date:'dd/MM/yyyy'}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.lieu_naissance">
                      <span class="label">Lieu de naissance:</span>
                      <span class="value">{{enseignant.lieu_naissance}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.sexe">
                      <span class="label">Sexe:</span>
                      <span class="value">{{enseignant.sexe}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.nationalite">
                      <span class="label">Nationalité:</span>
                      <span class="value">{{enseignant.nationalite}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>contact_phone</mat-icon>
                      Coordonnées
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item" *ngIf="enseignant.telephone">
                      <span class="label">Téléphone:</span>
                      <span class="value">{{enseignant.telephone}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.email">
                      <span class="label">Email:</span>
                      <span class="value">{{enseignant.email}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.adresse">
                      <span class="label">Adresse:</span>
                      <span class="value">{{enseignant.adresse}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>school</mat-icon>
                      Informations académiques
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item" *ngIf="enseignant.specialite">
                      <span class="label">Spécialité:</span>
                      <span class="value">{{enseignant.specialite}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.grade">
                      <span class="label">Grade:</span>
                      <span class="value">{{enseignant.grade}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.diplome">
                      <span class="label">Diplôme:</span>
                      <span class="value">{{enseignant.diplome}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.diplome_origine">
                      <span class="label">Établissement:</span>
                      <span class="value">{{enseignant.diplome_origine}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>work</mat-icon>
                      Informations professionnelles
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item" *ngIf="enseignant.date_recrutement">
                      <span class="label">Date de recrutement:</span>
                      <span class="value">{{enseignant.date_recrutement | date:'dd/MM/yyyy'}}</span>
                    </div>
                    <div class="info-item" *ngIf="enseignant.statut">
                      <span class="label">Statut:</span>
                      <span class="value">{{enseignant.statut}}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Expérience:</span>
                      <span class="value">{{getExperience()}} ans</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Charge horaire:</span>
                      <span class="value">{{getChargeHoraire()}}h/semaine</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <mat-card class="info-card full-width" *ngIf="enseignant.biographie">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>description</mat-icon>
                    Biographie
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p class="biography">{{enseignant.biographie}}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Onglet Cours -->
          <mat-tab label="Cours assignés">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>school</mat-icon>
                    Liste des cours ({{cours().length}})
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="cours-grid" *ngIf="cours().length > 0">
                    <mat-card *ngFor="let c of cours()" class="cours-card">
                      <mat-card-content>
                        <div class="cours-header">
                          <mat-icon>{{getCoursIcon(c.code)}}</mat-icon>
                          <div>
                            <h3>{{c.libelle}}</h3>
                            <p>{{c.code}}</p>
                          </div>
                        </div>
                        <mat-divider></mat-divider>
                        <div class="cours-stats">
                          <div class="cours-stat">
                            <mat-icon>groups</mat-icon>
                            <span>{{c.nombre_talibes || 0}} talibés</span>
                          </div>
                          <div class="cours-stat" *ngIf="c.duree">
                            <mat-icon>schedule</mat-icon>
                            <span>{{c.duree}}h/sem</span>
                          </div>
                        </div>
                        <mat-chip-set>
                          <mat-chip color="accent">{{c.niveau || 'Tous niveaux'}}</mat-chip>
                        </mat-chip-set>
                        <div class="card-actions">
                          <button mat-button [routerLink]="['/cours', c.id]">
                            Voir détails
                          </button>
                          <button mat-icon-button color="warn" (click)="retirerCours(c.id)">
                            <mat-icon>remove_circle</mat-icon>
                          </button>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <div class="no-data" *ngIf="cours().length === 0">
                    <mat-icon>school_off</mat-icon>
                    <p>Aucun cours assigné à cet enseignant</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Onglet Talibés -->
          <mat-tab label="Talibés encadrés">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>groups</mat-icon>
                    Liste des talibés ({{totalTalibes()}})
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="allTalibes()" *ngIf="allTalibes().length > 0">
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

                    <ng-container matColumnDef="cours">
                      <th mat-header-cell *matHeaderCellDef>Cours</th>
                      <td mat-cell *matCellDef="let talibe">
                        <mat-chip>{{talibe.cours_libelle}}</mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="niveau">
                      <th mat-header-cell *matHeaderCellDef>Niveau</th>
                      <td mat-cell *matCellDef="let talibe">
                        {{talibe.niveau || 'Non défini'}}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let talibe">
                        <button mat-icon-button [routerLink]="['/talibes', talibe.id]">
                          <mat-icon>visibility</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="talibesColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: talibesColumns;"></tr>
                  </table>

                  <div class="no-data" *ngIf="allTalibes().length === 0">
                    <mat-icon>person_off</mat-icon>
                    <p>Aucun talibé encadré</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

        </mat-tab-group>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement...</p>
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

    .avatar-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .avatar-wrapper mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: white;
    }

    .info-section {
      flex: 1;
    }

    .title-section {
      margin-bottom: 15px;
    }

    .title-section h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      color: #333;
    }

    .quick-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin: 20px 0;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      background: #f5f5f5;
      border-radius: 20px;
      color: #666;
    }

    .stat mat-icon {
      color: #667eea;
      font-size: 20px;
      width: 20px;
      height: 20px;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-card.talibes {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-card.experience {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-card.performance {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .content-tabs {
      margin-top: 30px;
    }

    .tab-content {
      padding: 30px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }

    .info-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .info-card.full-width {
      grid-column: 1 / -1;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .biography {
      line-height: 1.8;
      color: #555;
      white-space: pre-wrap;
    }

    .cours-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .cours-card {
      border-left: 4px solid #667eea;
      transition: transform 0.2s;
    }

    .cours-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .cours-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
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

    .cours-header p {
      margin: 5px 0 0 0;
      font-size: 13px;
      color: #999;
    }

    .cours-stats {
      display: flex;
      gap: 15px;
      margin: 15px 0;
    }

    .cours-stat {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
      color: #666;
    }

    .cours-stat mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    table {
      width: 100%;
      margin-top: 20px;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
    }

    .schedule-summary {
      display: flex;
      justify-content: space-around;
      gap: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .summary-item mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .summary-item strong {
      font-size: 24px;
      color: #333;
      display: block;
    }

    .summary-item p {
      margin: 5px 0 0 0;
      font-size: 13px;
      color: #666;
    }

    .my-4 {
      margin: 24px 0;
    }

    .schedule-placeholder {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .schedule-placeholder mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
    }

    .schedule-placeholder p {
      margin-bottom: 20px;
      font-size: 16px;
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
      margin-bottom: 15px;
    }

    .no-data button {
      margin-top: 15px;
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
      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .cours-grid {
        grid-template-columns: 1fr;
      }

      .schedule-summary {
        flex-direction: column;
      }
    }
  `]
})
export class EnseignantDetailsComponent implements OnInit {
  private enseignantService = inject(EnseignantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  // Utilisation de signals pour une réactivité plus performante
  enseignant = signal<Enseignant | null>(null);
  cours = signal<Cours[]>([]);
  loading = signal(true);
  isActive = true;
  
  talibesColumns = ['matricule', 'nom', 'cours', 'niveau', 'actions'];

  // Propriétés calculées (avec cache)
  totalTalibes = computed(() => {
    return this.cours().reduce((total, c) => total + (c.nombre_talibes || 0), 0);
  });

  chargeHoraire = computed(() => {
    return this.cours().reduce((total, c) => total + (c.duree || 0), 0);
  });

  experience = computed(() => {
    const enseignant = this.enseignant();
    if (!enseignant?.date_recrutement) return 0;
    const dateRecrutement = new Date(enseignant.date_recrutement);
    const today = new Date();
    return today.getFullYear() - dateRecrutement.getFullYear();
  });

  performance = computed(() => {
    // Simulation - À remplacer par vraie logique d'évaluation
    const total = this.totalTalibes();
    if (total > 100) return 5;
    if (total > 50) return 4.5;
    if (total > 20) return 4;
    if (total > 10) return 3.5;
    return 3;
  });

  gradeColor = computed(() => {
    const grade = this.enseignant()?.grade?.toLowerCase() || '';
    if (grade.includes('titulaire') || grade.includes('certifié')) return 'accent';
    if (grade.includes('agrégé') || grade.includes('principal')) return 'warn';
    return 'primary';
  });

  performanceColor = computed(() => {
    const perf = this.performance();
    if (perf >= 4.5) return 'accent';
    if (perf >= 3.5) return 'primary';
    return 'warn';
  });

  performanceLabel = computed(() => {
    const perf = this.performance();
    if (perf >= 4.5) return 'Excellent';
    if (perf >= 3.5) return 'Bon';
    if (perf >= 2.5) return 'Moyen';
    return 'À améliorer';
  });

  allTalibes = computed(() => {
    const coursList = this.cours();
    const allTalibes: any[] = [];
    
    coursList.forEach(c => {
      if (c.talibes) {
        c.talibes.forEach(t => {
          allTalibes.push({
            ...t,
            cours_libelle: c.libelle
          });
        });
      }
    });
    return allTalibes;
  });

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = +params['id'];
        this.loadEnseignantDetails(id);
      });
  }

  loadEnseignantDetails(id: number): void {
    this.loading.set(true);
    
    this.enseignantService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enseignant) => {
          this.enseignant.set(enseignant);
          this.loadCours(id);
        },
        error: () => {
          this.showError('Erreur de chargement');
          this.router.navigate(['/enseignants']);
        }
      });
  }

  loadCours(enseignantId: number): void {
    this.enseignantService.getCours(enseignantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cours) => {
          this.cours.set(cours);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.showError('Erreur de chargement des cours');
        }
      });
  }

  // Fonction utilitaire simplifiée pour le template
  getCoursIcon(code: string): string {
    if (!code) return 'book';
    
    const firstChar = code.charAt(0);
    switch(firstChar) {
      case 'C': return 'menu_book';
      case 'H': return 'history_edu';
      case 'F': return 'gavel';
      case 'T': return 'auto_stories';
      case 'A': return 'translate';
      default: return 'book';
    }
  }

  editEnseignant(): void {
    const id = this.enseignant()?.id;
    if (id) {
      this.router.navigate(['/enseignants', id, 'edit']);
    }
  }

  assignerCours(): void {
    const id = this.enseignant()?.id;
    if (id) {
      this.router.navigate(['/enseignants', id, 'cours']);
    }
  }

  exportData(): void {
    this.snackBar.open('Export en cours...', 'Fermer', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  deleteEnseignant(): void {
    const enseignant = this.enseignant();
    if (!enseignant) return;

    if (confirm(`Supprimer l'enseignant "${enseignant.prenom} ${enseignant.nom}" ?`)) {
      this.enseignantService.delete(enseignant.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Enseignant supprimé');
            this.router.navigate(['/enseignants']);
          },
          error: () => {
            this.showError('Erreur de suppression');
          }
        });
    }
  }

  retirerCours(coursId: number): void {
    const enseignantId = this.enseignant()?.id;
    if (!enseignantId) return;

    if (confirm('Retirer cet enseignant de ce cours ?')) {
      this.enseignantService.retirerCours(enseignantId, coursId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Cours retiré');
            this.loadCours(enseignantId);
          },
          error: () => {
            this.showError('Erreur lors du retrait');
          }
        });
    }
  }

  // Fonctions utilitaires pour les notifications
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
   getPerformance(): number {
    // Simulation - À remplacer par vraie logique d'évaluation
    return 4.5;
  }

  getChargeHoraire(): number {
    return 0;
  }

  getExperience(): number {
    
    const today = new Date();
    return today.getFullYear() ;
  }

  
  
}