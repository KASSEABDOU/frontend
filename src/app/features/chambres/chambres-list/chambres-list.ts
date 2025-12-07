import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { ChambreService } from '../../../shared/services/chambre';
import { BatimentService } from '../../../shared/services/batiment';
import { LitService } from '../../../shared/services/lit';
import { Chambre, Batiment, Lit } from '../../../core/models/user.model';

@Component({
  selector: 'app-chambres-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="list-container">
        <div class="header">
          <div class="header-left">
            <h1>
              <mat-icon class="title-icon">meeting_room</mat-icon>
              Gestion des Chambres
            </h1>
            <p class="subtitle">{{chambres.length}} chambre(s) • {{getTotalLits()}} lit(s) total</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="createChambre()">
              <mat-icon>add</mat-icon>
              Nouvelle Chambre
            </button>
          </div>
        </div>

        <!-- Filtres -->
        <div class="filters">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Rechercher</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Numéro de chambre...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filtrer par bâtiment</mat-label>
            <mat-select [(value)]="selectedBatiment" (selectionChange)="filterByBatiment()">
              <mat-option [value]="null">Tous les bâtiments</mat-option>
              <mat-option *ngFor="let batiment of batiments" [value]="batiment.id">
                {{batiment.nom}}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>apartment</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Trier par</mat-label>
            <mat-select [(value)]="sortBy" (selectionChange)="sortChambres()">
              <mat-option value="numero">Numéro</mat-option>
              <mat-option value="lits">Nombre de lits</mat-option>
              <mat-option value="occupation">Taux d'occupation</mat-option>
            </mat-select>
            <mat-icon matPrefix>sort</mat-icon>
          </mat-form-field>
        </div>

        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des chambres...</p>
        </div>

        <div class="chambres-grid" *ngIf="!loading && filteredChambres.length > 0">
          <mat-card *ngFor="let chambre of filteredChambres" class="chambre-card"
                    [class.high-occupancy]="getOccupancyPercentage(chambre) > 80">
            <div class="card-ribbon" *ngIf="getOccupancyPercentage(chambre) === 100">
              COMPLET
            </div>

            <mat-card-header>
              <div class="chambre-header-content">
                <div class="chambre-icon-wrapper">
                  <span [matBadge]="chambre.numero" matBadgeColor="accent" class="chambre-badge-container">
                    <mat-icon class="chambre-icon">meeting_room</mat-icon>
                  </span>
                </div>
                <div class="chambre-info">
                  <h3>Chambre {{chambre.numero}}</h3>
                  <p class="batiment-name">
                    <mat-icon>apartment</mat-icon>
                    {{getBatimentName(chambre.batiment_id)}}
                  </p>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content>
              <!-- Stats principales -->
              <div class="stats-row">
                <div class="stat-box lits">
                  <mat-icon>hotel</mat-icon>
                  <div>
                    <strong>{{chambre.nb_lits}}</strong>
                    <span>Lits totaux</span>
                  </div>
                </div>

                <div class="stat-box occupes">
                  <mat-icon>person</mat-icon>
                  <div>
                    <strong>{{getTalibesCount(chambre)}}</strong>
                    <span>Occupés</span>
                  </div>
                </div>

                <div class="stat-box disponibles">
                  <mat-icon>event_available</mat-icon>
                  <div>
                    <strong>{{getAvailableLits(chambre)}}</strong>
                    <span>Disponibles</span>
                  </div>
                </div>
              </div>

              <!-- Barre d'occupation -->
              <div class="occupancy-section">
                <div class="occupancy-header">
                  <span class="label">Taux d'occupation</span>
                  <span class="percentage">{{getOccupancyPercentage(chambre)}}%</span>
                </div>
                <div class="occupancy-bar">
                  <div class="occupancy-fill"
                       [style.width.%]="getOccupancyPercentage(chambre)"
                       [class.low]="getOccupancyPercentage(chambre) <= 50"
                       [class.medium]="getOccupancyPercentage(chambre) > 50 && getOccupancyPercentage(chambre) <= 80"
                       [class.high]="getOccupancyPercentage(chambre) > 80">
                  </div>
                </div>
              </div>

              <!-- Liste des lits -->
              <div class="lits-section">
                <div class="lits-header">
                  <mat-icon>king_bed</mat-icon>
                  <span>Lits de la chambre</span>
                </div>
                <mat-chip-set>
                  <mat-chip *ngFor="let lit of getLitsByChambre(chambre.id)"
                            [highlighted]="isLitOccupe(lit)"
                            [color]="isLitOccupe(lit) ? 'warn' : 'primary'">
                    <mat-icon>{{isLitOccupe(lit) ? 'person' : 'hotel'}}</mat-icon>
                    Lit {{lit.numero}}
                  </mat-chip>
                </mat-chip-set>
                <button mat-stroked-button color="primary" class="add-lit-btn"
                        (click)="addLit(chambre.id); $event.stopPropagation()">
                  <mat-icon>add</mat-icon>
                  Ajouter un lit
                </button>
              </div>

              <!-- Tags -->
              <div class="tags-section">
                <mat-chip-set>
                  <mat-chip *ngIf="getOccupancyPercentage(chambre) === 0" color="accent">
                    <mat-icon>new_releases</mat-icon>
                    Vide
                  </mat-chip>
                  <mat-chip *ngIf="getOccupancyPercentage(chambre) === 100" color="warn">
                    <mat-icon>block</mat-icon>
                    Complet
                  </mat-chip>
                  <mat-chip *ngIf="chambre.nb_lits >= 6">
                    <mat-icon>groups</mat-icon>
                    Grande capacité
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" (click)="viewChambre(chambre.id)"
                      matTooltip="Voir les détails">
                <mat-icon>visibility</mat-icon>
                Détails
              </button>
              <button mat-button color="accent" (click)="editChambre(chambre.id)"
                      matTooltip="Modifier">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-button color="warn" (click)="deleteChambre(chambre.id)"
                      matTooltip="Supprimer">
                <mat-icon>delete</mat-icon>
                Supprimer
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <div class="no-data" *ngIf="!loading && filteredChambres.length === 0">
          <mat-icon>meeting_room_off</mat-icon>
          <h3>Aucune chambre trouvée</h3>
          <p>{{chambres.length === 0 ? 'Commencez par créer votre première chambre' : 'Aucun résultat pour vos critères'}}</p>
          <button mat-raised-button color="primary" (click)="createChambre()" 
                  *ngIf="chambres.length === 0">
            <mat-icon>add</mat-icon>
            Créer une chambre
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

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .filter-field {
      flex: 1;
      min-width: 200px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    .chambres-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .chambre-card {
      position: relative;
      transition: all 0.3s ease;
      border-left: 4px solid #667eea;
      overflow: visible;
    }

    .chambre-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
    }

    .chambre-card.high-occupancy {
      border-left-color: #f5576c;
    }

    .card-ribbon {
      position: absolute;
      top: 15px;
      right: -5px;
      background: linear-gradient(135deg, #f5576c 0%, #fa709a 100%);
      color: white;
      padding: 5px 15px;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 1px;
      box-shadow: 0 2px 8px rgba(245, 87, 108, 0.4);
      z-index: 10;
    }

    .card-ribbon::before {
      content: '';
      position: absolute;
      bottom: -5px;
      right: 0;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid #c23647;
      border-bottom: 5px solid transparent;
    }

    .chambre-header-content {
      display: flex;
      align-items: center;
      gap: 15px;
      width: 100%;
    }

    .chambre-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chambre-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px;
      border-radius: 12px;
      font-size: 32px;
      width: 56px;
      height: 56px;
    }

    .chambre-info h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .batiment-name {
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 5px 0 0 0;
      font-size: 13px;
      color: #666;
    }

    .batiment-name mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 20px 0;
    }

    .stat-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border-radius: 8px;
      transition: transform 0.2s;
    }

    .stat-box:hover {
      transform: scale(1.05);
    }

    .stat-box mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-box strong {
      display: block;
      font-size: 20px;
      line-height: 1;
    }

    .stat-box span {
      display: block;
      font-size: 11px;
      opacity: 0.8;
    }

    .stat-box.lits {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-box.occupes {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-box.disponibles {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .occupancy-section {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .occupancy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .occupancy-header .label {
      font-size: 13px;
      color: #666;
      font-weight: 500;
    }

    .occupancy-header .percentage {
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    .occupancy-bar {
      width: 100%;
      height: 10px;
      background: #e0e0e0;
      border-radius: 5px;
      overflow: hidden;
    }

    .occupancy-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .occupancy-fill.low {
      background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
    }

    .occupancy-fill.medium {
      background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
    }

    .occupancy-fill.high {
      background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
    }

    .lits-section {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .lits-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-weight: 600;
      color: #333;
    }

    .lits-header mat-icon {
      color: #667eea;
    }

    mat-chip-set {
      margin-bottom: 10px;
    }

    mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .add-lit-btn {
      width: 100%;
      margin-top: 10px;
    }

    .tags-section {
      margin-top: 15px;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-around;
      padding: 8px 16px 16px !important;
      border-top: 1px solid #eee;
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
      .chambres-grid {
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
export class ChambresListComponent implements OnInit {
  private chambreService = inject(ChambreService);
  private batimentService = inject(BatimentService);
  private litService = inject(LitService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  chambres: Chambre[] = [];
  filteredChambres: Chambre[] = [];
  batiments: Batiment[] = [];
  litsMap: Map<number, Lit[]> = new Map();
  
  loading = true;
  selectedBatiment: number | null = null;
  sortBy = 'numero';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.chambreService.getAll().subscribe({
      next: (chambres) => {
        this.chambres = chambres;
        this.filteredChambres = chambres;
        chambres.forEach(c => this.loadLits(c.id));
        this.loadBatiments();
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadLits(chambreId: number): void {
    this.chambreService.getLits(chambreId).subscribe({
      next: (lits) => this.litsMap.set(chambreId, lits)
    });
  }

  loadBatiments(): void {
    this.batimentService.getAll().subscribe({
      next: (data) => this.batiments = data
    });
  }

  getLitsByChambre(chambreId: number): Lit[] {
    return this.litsMap.get(chambreId) || [];
  }

  getBatimentName(batimentId: number): string {
    return this.batiments.find(b => b.id === batimentId)?.nom || 'Bâtiment inconnu';
  }

  getTotalLits(): number {
    return this.chambres.reduce((total, c) => total + c.nb_lits, 0);
  }

  getTalibesCount(chambre: Chambre): number {
    // Simulé - nombre de lits occupés
    return Math.min(chambre.nb_lits, Math.floor(Math.random() * (chambre.nb_lits + 1)));
  }

  getAvailableLits(chambre: Chambre): number {
    return Math.max(0, chambre.nb_lits - this.getTalibesCount(chambre));
  }

  getOccupancyPercentage(chambre: Chambre): number {
    if (chambre.nb_lits === 0) return 0;
    return Math.round((this.getTalibesCount(chambre) / chambre.nb_lits) * 100);
  }

  isLitOccupe(lit: Lit): boolean {
    return Math.random() > 0.5; // Simulé
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredChambres = this.chambres.filter(c =>
      c.numero.toString().toLowerCase().includes(value)
    );
  }

  filterByBatiment(): void {
    if (this.selectedBatiment) {
      this.filteredChambres = this.chambres.filter(c => c.batiment_id === this.selectedBatiment);
    } else {
      this.filteredChambres = this.chambres;
    }
  }

  sortChambres(): void {
    switch (this.sortBy) {
      case 'numero':
        this.filteredChambres.sort((a, b) => a.numero.localeCompare(b.numero));
        break;
      case 'lits':
        this.filteredChambres.sort((a, b) => b.nb_lits - a.nb_lits);
        break;
      case 'occupation':
        this.filteredChambres.sort((a, b) => 
          this.getOccupancyPercentage(b) - this.getOccupancyPercentage(a)
        );
        break;
    }
  }

  createChambre(): void {
    this.router.navigate(['/chambres/create']);
  }

  viewChambre(id: number): void {
    this.router.navigate(['/chambres', id]);
  }

  editChambre(id: number): void {
    this.router.navigate(['/chambres', id, 'edit']);
  }

  deleteChambre(id: number): void {
    if (confirm('Supprimer cette chambre et tous ses lits ?')) {
      this.chambreService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Chambre supprimée', 'Fermer', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Erreur de suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  addLit(chambreId: number): void {
    this.router.navigate(['/chambres', chambreId, 'lits', 'create']);
  }
}