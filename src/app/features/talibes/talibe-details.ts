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
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { TalibeService } from '../../shared/services/talibe';
import { DaaraService } from '../../shared/services/daara';
import { ChambreService } from '../../shared/services/chambre';
import { Talibe, Daara, Chambre, Cours } from '../../core/models/user.model';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-talibe-details',
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
    LayoutComponent,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-layout>
      <div class="details-container" *ngIf="!loading() && talibe() as talibe">
        <!-- En-tête avec photo -->
        <mat-card class="header-card">
          <div class="header-content">
            <div class="photo-section">
              <div class="photo-wrapper">
                <img [src]="talibe.photo_profil_url || defaultAvatar" 
                    [alt]="talibe.prenom + ' ' + talibe.nom"
                    (error)="handleImageError($event)">
              </div>
              <mat-chip-set>
                <mat-chip color="primary" highlighted>
                  <mat-icon>badge</mat-icon>
                  {{talibe.matricule}}
                </mat-chip>
                <mat-chip *ngIf="talibe.photo_profil_url" color="accent">
                  <mat-icon>photo_camera</mat-icon>
                  Photo disponible
                </mat-chip>
              </mat-chip-set>
            </div>

            <div class="info-section">
              <h1>{{talibe.prenom}} {{talibe.nom}}</h1>
              <p class="subtitle">
                <mat-icon>cake</mat-icon>
                {{age()}} ans • 
                Né le {{talibe.date_naissance | date:'dd/MM/yyyy'}}
                <span *ngIf="talibe.lieu_naissance"> à {{talibe.lieu_naissance}}</span>
              </p>
              
              <div class="identity-badges">
                <mat-chip *ngIf="talibe.sexe" [color]="sexeColor()" highlighted>
                  <mat-icon>{{ sexeIcon() }}</mat-icon>
                  {{ sexeLabel() }}
                </mat-chip>
                
                <mat-chip *ngIf="talibe.nationalite" color="primary">
                  <mat-icon>flag</mat-icon>
                  {{talibe.nationalite}}
                </mat-chip>
              </div>

              <div class="quick-stats">
                <div class="stat">
                  <mat-icon>school</mat-icon>
                  <span>{{talibe.niveau || 'Niveau non défini'}}</span>
                </div>
                <div class="stat">
                  <mat-icon>event</mat-icon>
                  <span>{{ yearsInDaara() }}</span>
                </div>
                <div class="stat" *ngIf="talibe.extrait_naissance">
                  <mat-icon>check_circle</mat-icon>
                  <span>Extrait de naissance disponible</span>
                </div>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="editTalibe()">
                  <mat-icon>edit</mat-icon>
                  Modifier
                </button>
                <button mat-raised-button color="accent" (click)="printProfile()">
                  <mat-icon>print</mat-icon>
                  Imprimer
                </button>
                <button mat-raised-button color="warn" (click)="deleteTalibe()">
                  <mat-icon>delete</mat-icon>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Onglets de contenu -->
        <mat-tab-group class="content-tabs">
          <!-- Onglet Informations -->
          <mat-tab label="Informations">
            <div class="tab-content">
              <div class="info-grid">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>person</mat-icon>
                      Informations personnelles
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Email:</span>
                      <span class="value">{{talibe.email}}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Adresse:</span>
                      <span class="value">{{talibe.adresse || 'Non renseignée'}}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Date d'entrée:</span>
                      <span class="value">{{talibe.date_entree | date:'dd/MM/yyyy'}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>family_restroom</mat-icon>
                      Parents
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Père:</span>
                      <span class="value">{{talibe.pere || 'Non renseigné'}}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Mère:</span>
                      <span class="value">{{talibe.mere || 'Non renseignée'}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>business</mat-icon>
                      Daara
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Nom:</span>
                      <span class="value">{{daara()?.nom || 'Non assigné'}}</span>
                    </div>
                    <div class="info-item" *ngIf="daara()">
                      <span class="label">Lieu:</span>
                      <span class="value">{{daara()?.lieu}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>meeting_room</mat-icon>
                      Logement
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Chambre:</span>
                      <span class="value">
                        {{chambre() ? 'Chambre ' + chambre()?.numero : 'Non assignée'}}
                      </span>
                    </div>
                    <div class="info-item" *ngIf="chambre()">
                      <span class="label">Capacité:</span>
                      <span class="value">{{chambre()?.nb_lits}} lits</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Cours -->
          <mat-tab label="Cours">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>book</mat-icon>
                    Cours suivis ({{coursTalibe().length || 0}})
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="cours-grid" *ngIf="coursTalibe() && coursTalibe().length > 0">
                    <mat-card *ngFor="let cours of coursTalibe()" class="cours-card">
                      <mat-card-content>
                        <div class="cours-header">
                          <mat-icon>book</mat-icon>
                          <h3>{{cours.libelle}}</h3>
                        </div>
                        <p class="cours-code">Code: {{cours.code}}</p>
                      </mat-card-content>
                    </mat-card>
                  </div>
                  <div class="no-data" *ngIf="!coursTalibe() || coursTalibe().length === 0">
                    <mat-icon>book_off</mat-icon>
                    <p>Aucun cours assigné</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Onglet Activités -->
          <mat-tab label="Activités">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>history</mat-icon>
                    Historique des activités
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="timeline">
                    <div class="timeline-item">
                      <mat-icon>check_circle</mat-icon>
                      <div>
                        <strong>Inscription au daara</strong>
                        <p>{{talibe.date_entree | date:'dd/MM/yyyy'}}</p>
                      </div>
                    </div>
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
      max-width: 1200px;
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

    .photo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .photo-wrapper {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      overflow: hidden;
      border: 5px solid #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .photo-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .info-section {
      flex: 1;
    }

    .info-section h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      color: #333;
    }

    .subtitle {
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 0 0 20px 0;
      color: #666;
      font-size: 16px;
    }

    .subtitle mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .identity-badges {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .identity-badges mat-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .quick-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 25px;
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

    .content-tabs {
      margin-top: 30px;
    }

    .tab-content {
      padding: 30px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .info-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px !important;
    }

    .info-card mat-card-title mat-icon {
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

    .cours-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }

    .cours-card {
      border-left: 4px solid #667eea;
    }

    .cours-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .cours-header mat-icon {
      color: #667eea;
    }

    .cours-header h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .cours-code {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .timeline-item mat-icon {
      color: #667eea;
    }

    .timeline-item strong {
      display: block;
      margin-bottom: 5px;
      color: #333;
    }

    .timeline-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
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

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TalibeDetailsComponent implements OnInit, OnDestroy {
  private talibeService = inject(TalibeService);
  private daaraService = inject(DaaraService);
  private chambreService = inject(ChambreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  // Signaux pour une réactivité optimisée
  talibe = signal<Talibe | null>(null);
  daara = signal<Daara | null>(null);
  chambre = signal<Chambre | null>(null);
  coursTalibe = signal<Cours[]>([]);
  loading = signal(true);

  defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjI1IiBmaWxsPSIjMkU3RDMyIi8+CiAgICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iIzJFN0QzMiIvPgogICAgPGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMjAiIGZpbGw9IiNGOUY3RjIiLz4KICAgIDxwYXRoIGQ9Ik01MCw2MCBRNzAsODAgMzAsODAiIGZpbGw9IiNGOUY3RjIiLz4KPC9zdmc+';
// Changez pour un chemin local

  // Propriétés calculées
  age = computed(() => {
    const talibeValue = this.talibe();
    if (!talibeValue?.date_naissance) return 'N/A';
    
    try {
      const birthDate = new Date(talibeValue.date_naissance);
      if (isNaN(birthDate.getTime())) return 'N/A';
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age.toString();
    } catch {
      return 'N/A';
    }
  });

  yearsInDaara = computed(() => {
    const talibeValue = this.talibe();
    if (!talibeValue?.date_entree) return 'Nouveau';
    
    try {
      const startDate = new Date(talibeValue.date_entree);
      if (isNaN(startDate.getTime())) return 'Nouveau';
      
      const today = new Date();
      let years = today.getFullYear() - startDate.getFullYear();
      const monthDiff = today.getMonth() - startDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < startDate.getDate())) {
        years--;
      }
      
      if (years <= 0) return 'Nouveau au daara';
      if (years === 1) return '1 an au daara';
      return `${years} ans au daara`;
    } catch {
      return 'Nouveau';
    }
  });

  sexeLabel = computed(() => {
    const talibeValue = this.talibe();
    return talibeValue?.sexe === 'F' ? 'Féminin' : 'Masculin';
  });

  sexeIcon = computed(() => {
    const talibeValue = this.talibe();
    return talibeValue?.sexe === 'F' ? 'female' : 'male';
  });

  sexeColor = computed(() => {
    const talibeValue = this.talibe();
    return talibeValue?.sexe === 'F' ? 'accent' : 'primary';
  });

  ngOnInit(): void {
    this.loadTalibeDetails();
  }

  loadTalibeDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.showError('ID du talibé non trouvé');
      this.router.navigate(['/talibes']);
      return;
    }

    this.loading.set(true);

    // Chargement parallèle de toutes les données
    forkJoin({
      talibe: this.talibeService.getById(+id),
      cours: this.talibeService.getCoursTalibes(+id),
      daara: this.loadDaaraIfExists(+id),
      chambre: this.loadChambreIfExists(+id)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ talibe, cours, daara, chambre }) => {
          this.talibe.set(talibe);
          this.coursTalibe.set(Array.isArray(cours) ? cours : []);
          this.daara.set(daara);
          this.chambre.set(chambre);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement:', error);
          this.showError('Erreur de chargement des données');
          this.router.navigate(['/talibes']);
          this.loading.set(false);
        }
      });
  }

  private loadDaaraIfExists(talibeId: number) {
    return this.talibeService.getById(talibeId).pipe(
      switchMap(talibe => {
        if (talibe?.daara_id) {
          return this.daaraService.getById(talibe.daara_id);
        }
        return of(null);
      }),
      catchError(() => of(null))
    );
  }

  private loadChambreIfExists(talibeId: number) {
    return this.talibeService.getById(talibeId).pipe(
      switchMap(talibe => {
        if (talibe?.chambre_id) {
          return this.chambreService.getById(talibe.chambre_id).pipe(
            map(chambreData => ({
              id: chambreData.id,
              batiment_id: chambreData.batiment_id,
              numero: chambreData.numero,
              nb_lits: chambreData.nb_lits
            })),
            catchError(() => of(null))
          );
        }
        return of(null);
      })
    );
  }

  editTalibe(): void {
    const id = this.talibe()?.id;
    if (id) {
      this.router.navigate(['/talibes', id, 'edit']);
    } else {
      this.showError('Impossible de modifier ce talibé');
    }
  }

  printProfile(): void {
    window.print();
  }

  deleteTalibe(): void {
    const talibeValue = this.talibe();
    if (!talibeValue) return;

    if (confirm(`Supprimer définitivement ${talibeValue.prenom} ${talibeValue.nom} ?`)) {
      this.talibeService.delete(talibeValue.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Talibé supprimé avec succès');
            this.router.navigate(['/talibes']);
          },
          error: () => {
            this.showError('Erreur lors de la suppression');
          }
        });
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultAvatar;
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