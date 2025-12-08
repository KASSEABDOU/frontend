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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { CoursService } from '../../shared/services/cours';
import { Cours, Talibe, Enseignant } from '../../core/models/user.model';
import { Subject, takeUntil, forkJoin } from 'rxjs';


@Component({
  selector: 'app-cours-details',
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
    LayoutComponent,
    MatProgressBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-layout>
      <div class="details-container" *ngIf="!loading() && cours() as cours">
        <!-- En-tête -->
        <mat-card class="header-card">
          <div class="header-content">
            <div class="icon-wrapper">
              <mat-icon>{{coursIcon()}}</mat-icon>
            </div>

            <div class="info-section">
              <div class="title-section">
                <h1>{{cours.libelle}}</h1>
                <mat-chip-set>
                  <mat-chip color="primary" highlighted>
                    {{cours.code}}
                  </mat-chip>
                  <mat-chip [color]="niveauColor()">
                    {{getNiveau()}}
                  </mat-chip>
                  <mat-chip *ngIf="isActive" color="accent">
                    <mat-icon>check_circle</mat-icon>
                    Actif
                  </mat-chip>
                </mat-chip-set>
              </div>

              <p class="description" *ngIf="cours.description">
                {{cours.description}}
              </p>

              <div class="quick-stats">
                <div class="stat">
                  <mat-icon>school</mat-icon>
                  <span>{{talibes().length}} talibés inscrits</span>
                </div>
                <div class="stat">
                  <mat-icon>person</mat-icon>
                  <span>{{enseignants().length}} enseignants</span>
                </div>
                <div class="stat" *ngIf="cours.duree">
                  <mat-icon>schedule</mat-icon>
                  <span>{{cours.duree}}h/semaine</span>
                </div>
                <div class="stat" *ngIf="cours.capacite_max">
                  <mat-icon>groups</mat-icon>
                  <span>Max: {{cours.capacite_max}} places</span>
                </div>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="editCours()">
                  <mat-icon>edit</mat-icon>
                  Modifier
                </button>
                <button mat-raised-button color="accent" (click)="manageTalibes()">
                  <mat-icon>group_add</mat-icon>
                  Gérer inscrits
                </button>
                <button mat-raised-button (click)="exportData()">
                  <mat-icon>file_download</mat-icon>
                  Exporter
                </button>
                <button mat-raised-button color="warn" (click)="deleteCours()">
                  <mat-icon>delete</mat-icon>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Stats cards -->
        <div class="stats-grid">
          <mat-card class="stat-card inscrits">
            <mat-card-content>
              <mat-icon>school</mat-icon>
              <div class="stat-info">
                <h2>{{talibes().length}}</h2>
                <p>Talibés inscrits</p>
                <mat-progress-bar mode="determinate" 
                                  [value]="capacityPercentage()"
                                  [color]="capacityColor()">
                </mat-progress-bar>
                <small *ngIf="cours.capacite_max">
                  {{capacityPercentage()}}% de capacité
                </small>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card enseignants">
            <mat-card-content>
              <mat-icon>person</mat-icon>
              <div class="stat-info">
                <h2>{{enseignants().length}}</h2>
                <p>Enseignants</p>
                <small>Corps professoral</small>
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
                  <mat-chip [color]="ratio() > 20 ? 'warn' : 'primary'">
                    {{ratio() > 20 ? 'Élevé' : 'Optimal'}}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card satisfaction">
            <mat-card-content>
              <mat-icon>star</mat-icon>
              <div class="stat-info">
                <h2>4.5/5</h2>
                <p>Satisfaction</p>
                <small>Basé sur les évaluations</small>
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
                      Détails du cours
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Code:</span>
                      <span class="value">{{cours.code}}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Libellé:</span>
                      <span class="value">{{cours.libelle}}</span>
                    </div>
                    <div class="info-item" *ngIf="cours.categorie">
                      <span class="label">Catégorie:</span>
                      <span class="value">{{cours.categorie}}</span>
                    </div>
                    <div class="info-item" *ngIf="cours.niveau">
                      <span class="label">Niveau:</span>
                      <span class="value">{{cours.niveau}}</span>
                    </div>
                    <div class="info-item" *ngIf="cours.duree">
                      <span class="label">Durée:</span>
                      <span class="value">{{cours.duree}} heures/semaine</span>
                    </div>
                    <div class="info-item" *ngIf="cours.prerequis">
                      <span class="label">Prérequis:</span>
                      <span class="value">{{cours.prerequis}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card" *ngIf="cours.objectifs || cours.programme">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>track_changes</mat-icon>
                      Objectifs & Programme
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="content-section" *ngIf="cours.objectifs">
                      <h4>Objectifs pédagogiques:</h4>
                      <p>{{cours.objectifs}}</p>
                    </div>
                    <mat-divider *ngIf="cours.objectifs && cours.programme"></mat-divider>
                    <div class="content-section" *ngIf="cours.programme">
                      <h4>Programme:</h4>
                      <p>{{cours.programme}}</p>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Talibés -->
          <mat-tab label="Talibés inscrits">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>school</mat-icon>
                    Liste des talibés ({{talibes().length}})
                  </mat-card-title>
                  <button mat-raised-button color="primary" (click)="manageTalibes()">
                    <mat-icon>group_add</mat-icon>
                    Gérer les inscrits
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
                        <button mat-icon-button [routerLink]="['/talibes', talibe.id , 'details']">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="removeTalibe(talibe.id)">
                          <mat-icon>remove_circle</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="talibesColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: talibesColumns;"></tr>
                  </table>

                  <div class="no-data" *ngIf="talibes().length === 0">
                    <mat-icon>person_off</mat-icon>
                    <p>Aucun talibé inscrit à ce cours</p>
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
                    Enseignants du cours ({{enseignants().length}})
                  </mat-card-title>
                  <button mat-raised-button color="primary" (click)="manageEnseignants()">
                    <mat-icon>person_add</mat-icon>
                    Assigner un enseignant
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
                        </mat-chip-set>
                        <div class="card-actions">
                          <button mat-button [routerLink]="['/enseignants', enseignant.id, 'detail']">
                            Voir profil
                          </button>
                          <button mat-icon-button color="warn" (click)="removeEnseignant(enseignant.id)">
                            <mat-icon>remove_circle</mat-icon>
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
        </mat-tab-group>
      </div>

      <div class="loading-container" *ngIf="loading()">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement...</p>
      </div>
    </app-layout>
  `,
  styles: [`
    /* Gardez vos styles existants */
    .details-container { padding: 20px; max-width: 1400px; margin: 0 auto; }
    .header-card { margin-bottom: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header-content { display: flex; gap: 30px; padding: 20px; }
    .icon-wrapper { width: 100px; height: 100px; border-radius: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
    .icon-wrapper mat-icon { font-size: 56px; width: 56px; height: 56px; color: white; }
    .info-section { flex: 1; }
    .title-section { margin-bottom: 15px; }
    .title-section h1 { margin: 0 0 10px 0; font-size: 32px; color: #333; }
    .description { margin: 15px 0; color: #666; line-height: 1.6; font-size: 15px; }
    .quick-stats { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }
    .stat { display: flex; align-items: center; gap: 8px; padding: 10px 15px; background: #f5f5f5; border-radius: 20px; color: #666; }
    .stat mat-icon { color: #667eea; font-size: 20px; width: 20px; height: 20px; }
    .action-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 20px; padding: 25px !important; }
    .stat-card mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .stat-info { flex: 1; }
    .stat-info h2 { margin: 0; font-size: 36px; font-weight: 700; }
    .stat-info p { margin: 5px 0; font-size: 14px; opacity: 0.9; }
    .stat-info small { font-size: 12px; opacity: 0.8; }
    .stat-card.inscrits { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
    .stat-card.enseignants { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
    .stat-card.ratio { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; }
    .stat-card.satisfaction { background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); color: white; }
    .content-tabs { margin-top: 30px; }
    .tab-content { padding: 30px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-card { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    mat-card-title { display: flex; align-items: center; gap: 10px; font-size: 18px !important; }
    mat-card-title mat-icon { color: #667eea; }
    .info-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    .info-item:last-child { border-bottom: none; }
    .info-item .label { color: #666; font-weight: 500; }
    .info-item .value { color: #333; font-weight: 600; text-align: right; }
    .content-section { margin: 15px 0; }
    .content-section h4 { margin: 0 0 10px 0; color: #667eea; font-size: 14px; font-weight: 600; }
    .content-section p { margin: 0; color: #555; line-height: 1.6; white-space: pre-wrap; }
    table { width: 100%; margin-top: 20px; }
    th { background: #f5f5f5; font-weight: 600; }
    .enseignants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
    .enseignant-card { border-left: 4px solid #667eea; }
    .enseignant-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
    .enseignant-header mat-icon { font-size: 40px; width: 40px; height: 40px; color: #667eea; }
    .enseignant-header h3 { margin: 0; font-size: 16px; color: #333; }
    .enseignant-header p { margin: 5px 0 0 0; font-size: 14px; color: #666; }
    .card-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; }
    .no-data { display: flex; flex-direction: column; align-items: center; padding: 40px; color: #999; }
    .no-data mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 15px; }
    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; gap: 20px; }
    @media (max-width: 1024px) { .info-grid { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { 
      .header-content { flex-direction: column; }
      .stats-grid { grid-template-columns: 1fr; }
      .enseignants-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CoursDetailsComponent implements OnInit, OnDestroy {
  private coursService = inject(CoursService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  // Utilisation de signals pour une réactivité optimisée
  cours = signal<Cours | null>(null);
  talibes = signal<Talibe[]>([]);
  enseignants = signal<Enseignant[]>([]);
  loading = signal(true);
  isActive = true; // Simulé
  
  talibesColumns = ['matricule', 'nom', 'niveau', 'actions'];

  // Propriétés calculées avec signaux
  coursIcon = computed(() => {
    const coursValue = this.cours();
    if (!coursValue?.code) return 'book';
    
    const firstChar = coursValue.code.charAt(0);
    switch(firstChar) {
      case 'C': return 'menu_book';
      case 'H': return 'history_edu';
      case 'F': return 'gavel';
      case 'T': return 'auto_stories';
      case 'A': return 'translate';
      default: return 'book';
    }
  });

  niveauColor = computed(() => {
    const niveau = this.getNiveau();
    if (niveau === 'Débutant') return 'primary';
    if (niveau === 'Intermédiaire') return 'accent';
    if (niveau === 'Avancé') return 'warn';
    return '';
  });

  ratio = computed(() => {
    const enseignantsCount = this.enseignants().length;
    const talibesCount = this.talibes().length;
    return enseignantsCount > 0 ? Math.round(talibesCount / enseignantsCount) : 0;
  });

  capacityPercentage = computed(() => {
    const coursValue = this.cours();
    if (!coursValue?.capacite_max) return 0;
    return Math.round((this.talibes().length / coursValue.capacite_max) * 100);
  });

  capacityColor = computed(() => {
    const percentage = this.capacityPercentage();
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  });

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = +params['id'];
        this.loadCoursDetails(id);
      });
  }

  loadCoursDetails(id: number): void {
    this.loading.set(true);
    
    // Chargement parallèle des données pour réduire le temps de chargement
    forkJoin({
      cours: this.coursService.getById(id),
      talibes: this.coursService.getTalibes(id),
      enseignants: this.coursService.getEnseignants(id)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ cours, talibes, enseignants }) => {
          this.cours.set(cours);
          this.talibes.set(talibes);
          this.enseignants.set(enseignants);
          this.loading.set(false);
        },
        error: () => {
          this.snackBar.open('Erreur de chargement', 'Fermer', { 
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loading.set(false);
          this.router.navigate(['/cours']);
        }
      });
  }

  // Méthode simple pour le template
  getNiveau(): string {
    return this.cours()?.niveau || 'Tous niveaux';
  }

  editCours(): void {
    const id = this.cours()?.id;
    if (id) {
      this.router.navigate(['/cours', id, 'edit']);
    }
  }

  manageTalibes(): void {
    const id = this.cours()?.id;
    if (id) {
      this.router.navigate(['/cours', id, 'talibes']);
    }
  }

  exportData(): void {
    this.snackBar.open('Export en cours...', 'Fermer', { 
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  deleteCours(): void {
    const coursValue = this.cours();
    if (!coursValue) return;

    if (confirm(`Supprimer le cours "${coursValue.libelle}" ?`)) {
      this.coursService.delete(coursValue.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Cours supprimé');
            this.router.navigate(['/cours']);
          },
          error: () => {
            this.showError('Erreur de suppression');
          }
        });
    }
  }

  removeTalibe(talibeId: number): void {
    if (confirm('Retirer ce talibé du cours ?')) {
      // TODO: Implémenter la désinscription
      this.snackBar.open('Talibé retiré', 'Fermer', { duration: 2000 });
    }
  }

  removeEnseignant(enseignantId: number): void {
    if (confirm('Retirer cet enseignant du cours ?')) {
      // TODO: Implémenter le retrait
      this.snackBar.open('Enseignant retiré', 'Fermer', { duration: 2000 });
    }
  }

  manageEnseignants(): void {
    const id = this.cours()?.id;
    if (id) {
      this.router.navigate(['/cours', id, 'enseignants']);
    }
  }

  viewEnseignant(id: number): void {
    this.router.navigate(['/enseignants', id, 'detail']);
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