import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { ChambreService } from '../../shared/services/chambre';
import { LitService } from '../../shared/services/lit';
import { BatimentService } from '../../shared/services/batiment';
import { Chambre, Lit, Batiment, Talibe } from '../../core/models/user.model';
import { MatProgressBarModule } from '@angular/material/progress-bar'; 

@Component({
  selector: 'app-chambre-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    LayoutComponent,
    MatProgressBarModule
  ],
  template: `
    <app-layout>
      <div class="details-container" *ngIf="!loading && chambre">
        <!-- En-tête -->
        <mat-card class="header-card">
          <div class="header-content">
            <div class="icon-wrapper">
              <mat-icon>meeting_room</mat-icon>
              <span class="numero-badge">{{chambre.numero}}</span>
            </div>

            <div class="info-section">
              <h1>Chambre {{chambre.numero}}</h1>
              <p class="subtitle" *ngIf="batiment">
                <mat-icon>apartment</mat-icon>
                {{batiment.nom}}
              </p>

              <div class="quick-stats">
                <mat-chip-set>
                  <mat-chip color="primary" highlighted>
                    <mat-icon>hotel</mat-icon>
                    {{lits.length}} lits
                  </mat-chip>
                  <mat-chip color="accent">
                    <mat-icon>person</mat-icon>
                    {{getOccupiedLitsCount()}} occupés
                  </mat-chip>
                  <mat-chip [color]="getCapacityColor()">
                    <mat-icon>event_available</mat-icon>
                    {{getAvailableLitsCount()}} disponibles
                  </mat-chip>
                </mat-chip-set>
              </div>

              <div class="occupation-bar-wrapper">
                <span>Taux d'occupation:</span>
                <div class="occupation-bar">
                  <div class="fill" [style.width.%]="getOccupationPercentage()"
                       [class.high]="getOccupationPercentage() > 80">
                    {{getOccupationPercentage()}}%
                  </div>
                </div>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="editChambre()">
                  <mat-icon>edit</mat-icon>
                  Modifier
                </button>
                <button mat-raised-button color="accent" (click)="addLit()">
                  <mat-icon>add</mat-icon>
                  Ajouter un lit
                </button>
                <button mat-raised-button color="warn" (click)="deleteChambre()">
                  <mat-icon>delete</mat-icon>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Liste des lits -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>king_bed</mat-icon>
              Lits de la chambre ({{lits.length}})
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="lits-grid" *ngIf="lits.length > 0">
              <mat-card *ngFor="let lit of lits" class="lit-card"
                        [class.occupied]="isLitOccupied(lit)">
                <mat-card-content>
                  <div class="lit-header">
                    <mat-icon>{{isLitOccupied(lit) ? 'person' : 'king_bed'}}</mat-icon>
                    <h3>Lit {{lit.numero}}</h3>
                  </div>

                  <mat-chip-set>
                    <mat-chip [highlighted]="isLitOccupied(lit)"
                              [color]="isLitOccupied(lit) ? 'warn' : 'primary'">
                      {{isLitOccupied(lit) ? 'Occupé' : 'Disponible'}}
                    </mat-chip>
                  </mat-chip-set>

                  <div class="lit-info" *ngIf="isLitOccupied(lit)">
                    <p><strong>Occupé par:</strong> {{getTalibeOnLit(lit)}}</p>
                  </div>

                  <div class="lit-actions">
                    <button mat-icon-button color="accent"
                            [routerLink]="['/lits', lit.id, 'edit']"
                            matTooltip="Modifier">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn"
                            (click)="deleteLit(lit.id)"
                            [disabled]="isLitOccupied(lit)"
                            matTooltip="Supprimer">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="no-data" *ngIf="lits.length === 0">
              <mat-icon>king_bed_off</mat-icon>
              <p>Aucun lit dans cette chambre</p>
              <button mat-raised-button color="primary" (click)="addLit()">
                <mat-icon>add</mat-icon>
                Ajouter un lit
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Liste des talibés -->
        <mat-card *ngIf="talibes.length > 0">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>school</mat-icon>
              Talibés logés ({{talibes.length}})
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let talibe of talibes">
                <mat-icon matListItemIcon>person</mat-icon>
                <div matListItemTitle>{{talibe.nom}} {{talibe.prenom}}</div>
                <div matListItemLine>{{talibe.matricule}}</div>
                <button mat-icon-button matListItemMeta
                        [routerLink]="['/talibes', talibe.id]">
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </mat-list-item>
            </mat-list>
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
      max-width: 1000px;
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
      position: relative;
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

    .numero-badge {
      position: absolute;
      bottom: -10px;
      right: -10px;
      background: white;
      color: #667eea;
      border: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
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

    .occupation-bar-wrapper {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .occupation-bar-wrapper > span {
      font-weight: 600;
      color: #666;
      white-space: nowrap;
    }

    .occupation-bar {
      flex: 1;
      height: 30px;
      background: #e0e0e0;
      border-radius: 15px;
      overflow: hidden;
    }

    .occupation-bar .fill {
      height: 100%;
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      transition: width 0.3s;
    }

    .occupation-bar .fill.high {
      background: linear-gradient(90deg, #f5576c 0%, #fa709a 100%);
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
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

    .lits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .lit-card {
      border-left: 4px solid #4facfe;
      transition: all 0.2s;
    }

    .lit-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    }

    .lit-card.occupied {
      border-left-color: #f5576c;
      background: rgba(245, 87, 108, 0.05);
    }

    .lit-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }

    .lit-header mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #667eea;
    }

    .lit-card.occupied .lit-header mat-icon {
      color: #f5576c;
    }

    .lit-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .lit-info {
      margin: 15px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .lit-info p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .lit-actions {
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

      .lits-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ChambreDetailsComponent implements OnInit {
  private chambreService = inject(ChambreService);
  private litService = inject(LitService);
  private batimentService = inject(BatimentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  chambre: Chambre | null = null;
  lits: Lit[] = [];
  talibes: Talibe[] = [];
  batiment: Batiment | null = null;
  loading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadChambreDetails(id);
    });
  }

  loadChambreDetails(id: number): void {
    this.chambreService.getById(id).subscribe({
      next: (chambre) => {
        this.chambre = chambre;
        this.loadLits(id);
        this.loadTalibes(id);
        
        if (chambre.batiment_id) {
          this.batimentService.getById(chambre.batiment_id).subscribe({
            next: (batiment) => this.batiment = batiment
          });
        }
        
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
        this.router.navigate(['/chambres']);
      }
    });
  }

  loadLits(chambreId: number): void {
    this.chambreService.getLits(chambreId).subscribe({
      next: (lits) => this.lits = lits
    });
  }

  loadTalibes(chambreId: number): void {
    this.chambreService.getTalibes(chambreId).subscribe({
      next: (talibes) => this.talibes = talibes
    });
  }

  isLitOccupied(lit: Lit): boolean {
    return Math.random() > 0.5; // Simulé
  }

  getTalibeOnLit(lit: Lit): string {
    return 'Moussa Diop'; // Simulé
  }

  getOccupiedLitsCount(): number {
    return this.lits.filter(l => this.isLitOccupied(l)).length;
  }

  getAvailableLitsCount(): number {
    return this.lits.length - this.getOccupiedLitsCount();
  }

  getOccupationPercentage(): number {
    return this.lits.length > 0 
      ? Math.round((this.getOccupiedLitsCount() / this.lits.length) * 100)
      : 0;
  }

  getCapacityColor(): string {
    const available = this.getAvailableLitsCount();
    return available === 0 ? 'warn' : 'primary';
  }

  editChambre(): void {
    this.router.navigate(['/chambres', this.chambre?.id, 'edit']);
  }

  addLit(): void {
    this.router.navigate(['/chambres', this.chambre?.id, 'lits', 'create']);
  }

  deleteChambre(): void {
    if (confirm(`Supprimer la chambre ${this.chambre?.numero} ?`)) {
      this.chambreService.delete(this.chambre!.id).subscribe({
        next: () => {
          this.snackBar.open('Chambre supprimée', 'Fermer', { duration: 3000 });
          this.router.navigate(['/chambres']);
        },
        error: () => {
          this.snackBar.open('Erreur de suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  deleteLit(id: number): void {
    if (confirm('Supprimer ce lit ?')) {
      this.litService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Lit supprimé', 'Fermer', { duration: 3000 });
          this.loadLits(this.chambre!.id);
        },
        error: () => {
          this.snackBar.open('Erreur de suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}