import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { LitService } from '../../../shared/services/lit';
import { ChambreService } from '../../../shared/services/chambre';
import { Lit, Chambre } from '../../../core/models/user.model';

@Component({
  selector: 'app-lits-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    LayoutComponent,
    MatDividerModule
  ],
  template: `
    <app-layout>
      <div class="list-container">
        <div class="header">
          <div class="header-left">
            <h1>
              <mat-icon class="title-icon">king_bed</mat-icon>
              Gestion des Lits
            </h1>
            <p class="subtitle">
              {{totalLits}} lit(s) total • 
              {{occupiedCount}} occupé(s) • 
              {{availableCount}} disponible(s)
            </p>
          </div>
          <button mat-raised-button color="primary" (click)="createLit()">
            <mat-icon>add</mat-icon>
            Nouveau Lit
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card total">
            <mat-card-content>
              <mat-icon>king_bed</mat-icon>
              <div class="stat-info">
                <h2>{{totalLits}}</h2>
                <p>Total lits</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card occupied">
            <mat-card-content>
              <mat-icon>person</mat-icon>
              <div class="stat-info">
                <h2>{{occupiedCount}}</h2>
                <p>Occupés</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card available">
            <mat-card-content>
              <mat-icon>event_available</mat-icon>
              <div class="stat-info">
                <h2>{{availableCount}}</h2>
                <p>Disponibles</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card rate">
            <mat-card-content>
              <mat-icon>trending_up</mat-icon>
              <div class="stat-info">
                <h2>{{occupationRate}}%</h2>
                <p>Taux d'occupation</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Le reste du template reste inchangé -->
        <!-- Filtres -->
        <div class="filters">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filtrer par chambre</mat-label>
            <mat-select [(value)]="selectedChambre" (selectionChange)="filterLits()">
              <mat-option [value]="null">Toutes les chambres</mat-option>
              <mat-option *ngFor="let chambre of chambres" [value]="chambre.id">
                Chambre {{chambre.numero}}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>meeting_room</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filtrer par statut</mat-label>
            <mat-select [(value)]="statusFilter" (selectionChange)="filterLits()">
              <mat-option [value]="'all'">Tous les lits</mat-option>
              <mat-option [value]="'occupied'">Occupés</mat-option>
              <mat-option [value]="'available'">Disponibles</mat-option>
            </mat-select>
            <mat-icon matPrefix>filter_list</mat-icon>
          </mat-form-field>
        </div>

        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des lits...</p>
        </div>

        <!-- Table des lits -->
        <div class="table-container" *ngIf="!loading && filteredLits.length > 0">
          <table mat-table [dataSource]="filteredLits" class="lits-table">
            <!-- Colonne Numéro -->
            <ng-container matColumnDef="numero">
              <th mat-header-cell *matHeaderCellDef>Numéro de lit</th>
              <td mat-cell *matCellDef="let lit">
                <div class="lit-numero">
                  <mat-icon [class.occupied]="isLitOccupe(lit)">
                    {{isLitOccupe(lit) ? 'person' : 'king_bed'}}
                  </mat-icon>
                  <strong>Lit {{lit.numero}}</strong>
                </div>
              </td>
            </ng-container>

            <!-- Colonne Chambre -->
            <ng-container matColumnDef="chambre">
              <th mat-header-cell *matHeaderCellDef>Chambre</th>
              <td mat-cell *matCellDef="let lit">
                <div class="chambre-info">
                  <mat-icon>meeting_room</mat-icon>
                  <span>Chambre {{getChambreNumero(lit.chambre_id)}}</span>
                </div>
              </td>
            </ng-container>

            <!-- Colonne Statut -->
            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let lit">
                <mat-chip-set>
                  <mat-chip [highlighted]="isLitOccupe(lit)"
                            [color]="isLitOccupe(lit) ? 'warn' : 'primary'">
                    <mat-icon>{{isLitOccupe(lit) ? 'person' : 'event_available'}}</mat-icon>
                    {{isLitOccupe(lit) ? 'Occupé' : 'Disponible'}}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <!-- Colonne Talibé -->
            <ng-container matColumnDef="talibe">
              <th mat-header-cell *matHeaderCellDef>Occupé par</th>
              <td mat-cell *matCellDef="let lit">
                <div class="talibe-info" *ngIf="isLitOccupe(lit)">
                  <mat-icon>person</mat-icon>
                  <span>{{getTalibeOnLit(lit)}}</span>
                </div>
                <span class="empty" *ngIf="!isLitOccupe(lit)">—</span>
              </td>
            </ng-container>

            <!-- Colonne État -->
            <ng-container matColumnDef="etat">
              <th mat-header-cell *matHeaderCellDef>État</th>
              <td mat-cell *matCellDef="let lit">
                <mat-chip-set>
                  <mat-chip [color]="getEtatColor(lit)">
                    {{getEtat(lit)}}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <!-- Colonne Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let lit">
                <button mat-icon-button color="primary" 
                        (click)="viewLit(lit.id)"
                        matTooltip="Voir détails">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" 
                        (click)="editLit(lit.id)"
                        matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" 
                        (click)="deleteLit(lit.id)"
                        matTooltip="Supprimer"
                        [disabled]="isLitOccupe(lit)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.occupied-row]="isLitOccupe(row)"></tr>
          </table>
        </div>

        <div class="no-data" *ngIf="!loading && filteredLits.length === 0">
          <mat-icon>king_bed_off</mat-icon>
          <h3>Aucun lit trouvé</h3>
          <p>{{lits.length === 0 ? 'Commencez par créer des lits' : 'Aucun résultat pour vos critères'}}</p>
          <button mat-raised-button color="primary" (click)="createLit()" 
                  *ngIf="lits.length === 0">
            <mat-icon>add</mat-icon>
            Créer un lit
          </button>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
     .list-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-left h1 {
      margin: 0;
      color: #333;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 28px;
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .subtitle {
      margin: 5px 0 0 42px;
      color: #666;
      font-size: 14px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
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
    }

    .stat-info h2 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }

    .stat-info p {
      margin: 5px 0 0 0;
      font-size: 13px;
      opacity: 0.9;
    }

    .stat-card.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-card.occupied {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-card.available {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .stat-card.rate {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .filter-field {
      flex: 1;
      min-width: 250px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .lits-table {
      width: 100%;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    tr:hover {
      background: #f9f9f9;
    }

    tr.occupied-row {
      background: rgba(245, 87, 108, 0.05);
    }

    .lit-numero {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .lit-numero mat-icon {
      color: #667eea;
    }

    .lit-numero mat-icon.occupied {
      color: #f5576c;
    }

    .chambre-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .chambre-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .talibe-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .talibe-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #f5576c;
    }

    .empty {
      color: #ccc;
    }

    mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      text-align: center;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      color: #ccc;
    }

    @media (max-width: 768px) {
      .table-container {
        overflow-x: auto;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
      }

      .filter-field {
        width: 100%;
      }
    }
  `]
})
export class LitsListComponent implements OnInit {
  private litService = inject(LitService);
  private chambreService = inject(ChambreService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdRef = inject(ChangeDetectorRef);

  lits: Lit[] = [];
  filteredLits: Lit[] = [];
  chambres: Chambre[] = [];
  
  loading = true;
  selectedChambre: number | null = null;
  statusFilter = 'all';
  displayedColumns = ['numero', 'chambre', 'statut', 'talibe', 'etat', 'actions'];

  // Propriétés calculées stables
  totalLits = 0;
  occupiedCount = 0;
  availableCount = 0;
  

  // Cache pour les états aléatoires (pour les rendre stables)
  private litStatusCache = new Map<number, boolean>();
  private litEtatCache = new Map<number, string>();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.litService.getAll().subscribe({
      next: (lits) => {
        this.lits = lits;
        this.filteredLits = lits;
        
        // Initialiser le cache des états
        this.initializeStatusCache(lits);
        
        // Calculer les statistiques une seule fois
        this.calculateStatistics();
        
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });

    this.chambreService.getAll().subscribe({
      next: (data) => {
        this.chambres = data;
        this.cdRef.detectChanges();
      }
    });
  }

  private initializeStatusCache(lits: Lit[]): void {
    this.litStatusCache.clear();
    this.litEtatCache.clear();
    
    lits.forEach(lit => {
      // Générer des valeurs aléatoires stables pour chaque lit
      this.litStatusCache.set(lit.id, Math.random() > 0.6);
      
      const etats = ['Bon état', 'À réparer', 'Neuf'];
      this.litEtatCache.set(lit.id, etats[Math.floor(Math.random() * etats.length)]);
    });
  }

  // 🔥 Supprimer la propriété occupationRate et utiliser un getter
get occupationRate(): number {
  if (!Array.isArray(this.lits) || this.lits.length === 0) return 0;
  
  const occupiedCount = this.lits.filter(lit => this.litStatusCache?.get(lit.id)).length;
  return Math.round((occupiedCount / this.lits.length) * 100);
}

// 🔥 Adapter calculateStatistics pour ne plus calculer occupationRate
private calculateStatistics(): void {
  const litsArray = Array.isArray(this.lits) ? this.lits : [];
  this.totalLits = litsArray.length;
  this.occupiedCount = litsArray.filter(lit => this.litStatusCache?.get(lit.id)).length;
  this.availableCount = Math.max(0, this.totalLits - this.occupiedCount);
  // occupationRate est maintenant calculé via le getter
}

  isLitOccupe(lit: Lit): boolean {
    return this.litStatusCache.get(lit.id) || false;
  }

  getTalibeOnLit(lit: Lit): string {
    // Rendre cette fonction déterministe pour un lit donné
    const prénoms = ['Abdoulaye', 'Moussa', 'Amadou', 'Ibrahima', 'Omar'];
    const noms = ['Diop', 'Sall', 'Fall', 'Ndiaye', 'Sy'];
    
    // Utiliser l'ID du lit pour une valeur stable
    const index = lit.id % prénoms.length;
    return `${prénoms[index]} ${noms[index]}`;
  }

  getChambreNumero(chambreId: number): string {
    return this.chambres.find(c => c.id === chambreId)?.numero || '?';
  }

  getEtat(lit: Lit): string {
    return this.litEtatCache.get(lit.id) || 'Bon état';
  }

  getEtatColor(lit: Lit): string {
    const etat = this.getEtat(lit);
    if (etat === 'Bon état') return 'primary';
    if (etat === 'À réparer') return 'warn';
    return 'accent';
  }

  filterLits(): void {
    let filtered = this.lits;

    if (this.selectedChambre) {
      filtered = filtered.filter(l => l.chambre_id === this.selectedChambre);
    }

    if (this.statusFilter === 'occupied') {
      filtered = filtered.filter(l => this.litStatusCache.get(l.id));
    } else if (this.statusFilter === 'available') {
      filtered = filtered.filter(l => !this.litStatusCache.get(l.id));
    }

    this.filteredLits = filtered;
    
    // Recalculer les statistiques après filtrage
    this.calculateStatistics();
  }

  createLit(): void {
    this.router.navigate(['/lits/create']);
  }

  viewLit(id: number): void {
    this.router.navigate(['/lits', id]);
  }

  editLit(id: number): void {
    this.router.navigate(['/lits', id, 'edit']);
  }

  deleteLit(id: number): void {
    const lit = this.lits.find(l => l.id === id);
    
    if (this.isLitOccupe(lit!)) {
      this.snackBar.open('Impossible de supprimer un lit occupé', 'Fermer', { duration: 3000 });
      return;
    }

    if (confirm(`Supprimer le lit ${lit?.numero} ?`)) {
      this.litService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Lit supprimé', 'Fermer', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Erreur de suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}