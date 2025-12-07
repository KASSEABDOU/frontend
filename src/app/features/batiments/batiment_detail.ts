// ============================================
import { Component, OnInit, inject } from '@angular/core';
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
import { MatBadgeModule } from '@angular/material/badge';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { BatimentService } from '../../shared/services/batiment';
import { ChambreService } from '../../shared/services/chambre';
import { DaaraService } from '../../shared/services/daara';
import { Batiment, Chambre, Daara } from '../../core/models/user.model';
import { MatProgressBarModule } from '@angular/material/progress-bar'; 

@Component({
  selector: 'app-batiment-details',
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
    MatBadgeModule,
    LayoutComponent,
    MatProgressBarModule
  ],
  template: `
    <app-layout>
      <div class="details-container" *ngIf="!loading && batiment">
        <!-- En-tête -->
        <mat-card class="header-card">
          <div class="header-content">
            <div class="icon-wrapper">
              <mat-icon>apartment</mat-icon>
            </div>

            <div class="info-section">
              <h1>{{batiment.nom}}</h1>
              <p class="subtitle" *ngIf="daara">
                <mat-icon>business</mat-icon>
                {{daara.nom}}
              </p>

              <div class="quick-stats">
                <mat-chip-set>
                  <mat-chip color="primary" highlighted>
                    <mat-icon>meeting_room</mat-icon>
                    {{chambres.length}} chambres
                  </mat-chip>
                  <mat-chip color="accent">
                    <mat-icon>hotel</mat-icon>
                    {{getTotalLits()}} lits
                  </mat-chip>
                  <mat-chip [color]="getOccupationColor()">
                    <mat-icon>trending_up</mat-icon>
                    {{getOccupationRate()}}% occupation
                  </mat-chip>
                </mat-chip-set>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="editBatiment()">
                  <mat-icon>edit</mat-icon>
                  Modifier
                </button>
                <button mat-raised-button color="accent" (click)="addChambre()">
                  <mat-icon>add</mat-icon>
                  Ajouter chambre
                </button>
                <button mat-raised-button color="warn" (click)="deleteBatiment()">
                  <mat-icon>delete</mat-icon>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Stats -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon>meeting_room</mat-icon>
              <div>
                <h2>{{chambres.length}}</h2>
                <p>Chambres</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon>hotel</mat-icon>
              <div>
                <h2>{{getTotalLits()}}</h2>
                <p>Lits totaux</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon>person</mat-icon>
              <div>
                <h2>{{getOccupiedLits()}}</h2>
                <p>Lits occupés</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <mat-icon>event_available</mat-icon>
              <div>
                <h2>{{getAvailableLits()}}</h2>
                <p>Lits disponibles</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Liste des chambres -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>meeting_room</mat-icon>
              Chambres du bâtiment
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chambres-grid" *ngIf="chambres.length > 0">
              <mat-card *ngFor="let chambre of chambres" class="chambre-card"
                        [class.high-occupancy]="getChambreOccupation(chambre) > 80">
                <mat-card-content>
                  <div class="chambre-header">
                    <mat-icon [matBadge]="chambre.numero" matBadgeColor="accent">
                      meeting_room
                    </mat-icon>
                    <h3>Chambre {{chambre.numero}}</h3>
                  </div>

                  <div class="chambre-stats">
                    <div class="stat-row">
                      <span>Capacité:</span>
                      <strong>{{chambre.nb_lits}} lits</strong>
                    </div>
                    <div class="stat-row">
                      <span>Occupation:</span>
                      <strong>{{getChambreOccupation(chambre)}}%</strong>
                    </div>
                  </div>

                  <div class="occupancy-bar">
                    <div class="fill" 
                         [style.width.%]="getChambreOccupation(chambre)"
                         [class.high]="getChambreOccupation(chambre) > 80">
                    </div>
                  </div>

                  <div class="chambre-actions">
                    <button mat-button color="primary" 
                            [routerLink]="['/chambres', chambre.id]">
                      <mat-icon>visibility</mat-icon>
                      Détails
                    </button>
                    <button mat-button color="accent" 
                            [routerLink]="['/chambres', chambre.id, 'edit']">
                      <mat-icon>edit</mat-icon>
                      Modifier
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="no-data" *ngIf="chambres.length === 0">
              <mat-icon>meeting_room_off</mat-icon>
              <p>Aucune chambre dans ce bâtiment</p>
              <button mat-raised-button color="primary" (click)="addChambre()">
                <mat-icon>add</mat-icon>
                Ajouter une chambre
              </button>
            </div>
          </mat-card-content>
        </mat-card>
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
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 30px;
    }

    .header-content {
      display: flex;
      gap: 30px;
      padding: 20px;
      align-items: center;
    }

    .icon-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .icon-wrapper mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: white;
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
      gap: 8px;
      margin: 0 0 20px 0;
      color: #666;
      font-size: 16px;
    }

    .quick-stats {
      margin-bottom: 20px;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px !important;
    }

    .stat-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .stat-card h2 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .stat-card p {
      margin: 5px 0 0 0;
      font-size: 14px;
      color: #666;
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

    .chambres-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .chambre-card {
      border-left: 4px solid #667eea;
      transition: transform 0.2s;
    }

    .chambre-card:hover {
      transform: translateY(-5px);
    }

    .chambre-card.high-occupancy {
      border-left-color: #f5576c;
    }

    .chambre-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .chambre-header mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .chambre-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .chambre-stats {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 15px;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .stat-row:last-child {
      border-bottom: none;
    }

    .stat-row span {
      color: #666;
    }

    .stat-row strong {
      color: #333;
    }

    .occupancy-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 15px;
    }

    .occupancy-bar .fill {
      height: 100%;
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
      transition: width 0.3s;
    }

    .occupancy-bar .fill.high {
      background: linear-gradient(90deg, #f5576c 0%, #fa709a 100%);
    }

    .chambre-actions {
      display: flex;
      justify-content: space-around;
      padding-top: 15px;
      border-top: 1px solid #eee;
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
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .chambres-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BatimentDetailsComponent implements OnInit {
  private batimentService = inject(BatimentService);
  private chambreService = inject(ChambreService);
  private daaraService = inject(DaaraService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  batiment: Batiment | null = null;
  chambres: Chambre[] = [];
  daara: Daara | null = null;
  loading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadBatimentDetails(id);
    });
  }

  loadBatimentDetails(id: number): void {
    this.batimentService.getById(id).subscribe({
      next: (batiment) => {
        this.batiment = batiment;
        this.loadChambres(id);
        
        if (batiment.daara_id) {
          this.daaraService.getById(batiment.daara_id).subscribe({
            next: (daara) => this.daara = daara
          });
        }
        
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
        this.router.navigate(['/batiments']);
      }
    });
  }

  loadChambres(batimentId: number): void {
    this.batimentService.getChambres(batimentId).subscribe({
      next: (chambres) => this.chambres = chambres
    });
  }

  getTotalLits(): number {
    return this.chambres.reduce((sum, c) => sum + c.nb_lits, 0);
  }

  getOccupiedLits(): number {
    // Simulé - à remplacer par vraies données
    return Math.floor(this.getTotalLits() * 0.7);
  }

  getAvailableLits(): number {
    return this.getTotalLits() - this.getOccupiedLits();
  }

  getOccupationRate(): number {
    const total = this.getTotalLits();
    return total > 0 ? Math.round((this.getOccupiedLits() / total) * 100) : 0;
  }

  getOccupationColor(): string {
    const rate = this.getOccupationRate();
    if (rate > 80) return 'warn';
    if (rate > 50) return 'accent';
    return 'primary';
  }

  getChambreOccupation(chambre: Chambre): number {
    // Simulé
    return Math.floor(Math.random() * 100);
  }

  editBatiment(): void {
    this.router.navigate(['/batiments', this.batiment?.id, 'edit']);
  }

  addChambre(): void {
    this.router.navigate(['/batiments', this.batiment?.id, 'chambres', 'create']);
  }

  deleteBatiment(): void {
    if (confirm(`Supprimer "${this.batiment?.nom}" et ses ${this.chambres.length} chambre(s) ?`)) {
      this.batimentService.delete(this.batiment!.id).subscribe({
        next: () => {
          this.snackBar.open('Bâtiment supprimé', 'Fermer', { duration: 3000 });
          this.router.navigate(['/batiments']);
        },
        error: () => {
          this.snackBar.open('Erreur de suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}