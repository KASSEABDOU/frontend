// ============================================
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { BatimentService } from '../../../shared/services/batiment';
import { ChambreService } from '../../../shared/services/chambre';
import { DaaraService } from '../../../shared/services/daara';
import { Batiment, Chambre, Daara } from '../../../core/models/user.model';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-batiments-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="list-container">
        <div class="header">
          <div class="header-left">
            <h1>
              <mat-icon class="title-icon">apartment</mat-icon>
              Gestion des Bâtiments
            </h1>
            <p class="subtitle">
              {{batiments.length}} bâtiment(s) • {{getTotalChambres()}} chambre(s)
            </p>
          </div>
          <button mat-raised-button color="primary" (click)="createBatiment()">
            <mat-icon>add</mat-icon>
            Nouveau Bâtiment
          </button>
        </div>

        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des bâtiments...</p>
        </div>

        <div *ngIf="!loading && batiments.length > 0" class="batiments-container">
          <mat-accordion multi>
            <mat-expansion-panel *ngFor="let batiment of batiments; let i = index" 
                                 class="batiment-panel"
                                 [expanded]="i === 0">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <div class="panel-title-content">
                    <div class="batiment-icon-wrapper">
                      <mat-icon class="batiment-icon">apartment</mat-icon>
                      <span class="batiment-number">{{i + 1}}</span>
                    </div>
                    <div class="batiment-info">
                      <strong class="batiment-name">{{batiment.nom}}</strong>
                      <span class="batiment-daara" *ngIf="getDaaraName(batiment.daara_id)">
                        <mat-icon>business</mat-icon>
                        {{getDaaraName(batiment.daara_id)}}
                      </span>
                    </div>
                  </div>
                </mat-panel-title>
                <mat-panel-description>
                  <div class="panel-stats">
                    <mat-chip-set>
                      <mat-chip highlighted color="primary">
                        <mat-icon>meeting_room</mat-icon>
                        {{batiment.nombre_chambres}} chambres
                      </mat-chip>
                      <mat-chip>
                        <mat-icon>hotel</mat-icon>
                        {{getTotalLitsForBatiment(batiment.id)}} lits
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="panel-content">
                <!-- Actions du bâtiment -->
                <div class="batiment-actions">
                  <button mat-raised-button color="accent" 
                          (click)="editBatiment(batiment.id); $event.stopPropagation()"
                          matTooltip="Modifier le bâtiment">
                    <mat-icon>edit</mat-icon>
                    Modifier
                  </button>
                  <button mat-raised-button color="warn" 
                          (click)="deleteBatiment(batiment.id); $event.stopPropagation()"
                          matTooltip="Supprimer le bâtiment">
                    <mat-icon>delete</mat-icon>
                    Supprimer
                  </button>
                </div>

                <mat-divider></mat-divider>

                <!-- Liste des chambres -->
                <div class="chambres-section">
                  <h3>
                    <mat-icon>meeting_room</mat-icon>
                    Chambres du bâtiment
                  </h3>

                  <div class="chambres-grid" *ngIf="getChambresByBatiment(batiment.id).length > 0">
                    <mat-card *ngFor="let chambre of getChambresByBatiment(batiment.id)" 
                              class="chambre-card">
                      <div class="chambre-header">
                        <div class="chambre-title">
                          <mat-icon [matBadge]="chambre.numero" 
                                    matBadgeColor="accent">meeting_room</mat-icon>
                          <span>Chambre {{chambre.numero}}</span>
                        </div>
                        <mat-chip-set>
                          <mat-chip color="primary" highlighted>
                            <mat-icon>hotel</mat-icon>
                            {{chambre.nb_lits}} lits
                          </mat-chip>
                        </mat-chip-set>
                      </div>

                      <mat-card-content>
                        <div class="chambre-stats">
                          <div class="stat">
                            <mat-icon>person</mat-icon>
                            <span>{{getTalibesInChambre(chambre.id)}} talibés</span>
                          </div>
                          <div class="stat">
                            <mat-icon>event_available</mat-icon>
                            <span>{{getAvailableLits(chambre)}} lits disponibles</span>
                          </div>
                        </div>

                        <div class="occupancy-bar">
                          <div class="occupancy-fill" 
                               [style.width.%]="getOccupancyPercentage(chambre)"
                               [class.high]="getOccupancyPercentage(chambre) > 80"
                               [class.medium]="getOccupancyPercentage(chambre) > 50 && getOccupancyPercentage(chambre) <= 80">
                          </div>
                        </div>
                        <p class="occupancy-text">
                          Taux d'occupation: {{getOccupancyPercentage(chambre)}}%
                        </p>
                      </mat-card-content>

                      <mat-card-actions>
                        <button mat-icon-button color="primary" 
                                (click)="viewChambre(chambre.id); $event.stopPropagation()"
                                matTooltip="Voir détails">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button color="accent" 
                                (click)="editChambre(chambre.id); $event.stopPropagation()"
                                matTooltip="Modifier">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" 
                                (click)="deleteChambre(chambre.id); $event.stopPropagation()"
                                matTooltip="Supprimer">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </mat-card-actions>
                    </mat-card>
                  </div>

                  <div class="no-chambres" *ngIf="getChambresByBatiment(batiment.id).length === 0">
                    <mat-icon>meeting_room_off</mat-icon>
                    <p>Aucune chambre dans ce bâtiment</p>
                    <button mat-stroked-button color="primary" 
                            (click)="createChambre(batiment.id); $event.stopPropagation()">
                      <mat-icon>add</mat-icon>
                      Ajouter une chambre
                    </button>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </div>

        <div class="no-data" *ngIf="!loading && batiments.length === 0">
          <mat-icon>apartment_off</mat-icon>
          <h3>Aucun bâtiment trouvé</h3>
          <p>Commencez par créer votre premier bâtiment pour organiser les chambres</p>
          <button mat-raised-button color="primary" (click)="createBatiment()">
            <mat-icon>add</mat-icon>
            Créer un bâtiment
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

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    .batiments-container {
      margin-top: 20px;
    }

    .batiment-panel {
      margin-bottom: 20px;
      border-radius: 12px !important;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important;
    }

    .batiment-panel:hover {
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15) !important;
    }

    .panel-title-content {
      display: flex;
      align-items: center;
      gap: 15px;
      width: 100%;
    }

    .batiment-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .batiment-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px;
      border-radius: 12px;
      font-size: 32px;
      width: 52px;
      height: 52px;
    }

    .batiment-number {
      position: absolute;
      bottom: -5px;
      right: -5px;
      background: white;
      border: 2px solid #667eea;
      color: #667eea;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .batiment-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .batiment-name {
      font-size: 18px;
      color: #333;
    }

    .batiment-daara {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #666;
    }

    .batiment-daara mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .panel-stats {
      display: flex;
      align-items: center;
    }

    mat-chip {
      font-size: 13px;
    }

    mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .panel-content {
      padding: 20px;
    }

    .batiment-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .chambres-section {
      margin-top: 20px;
    }

    .chambres-section h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 20px 0 15px 0;
      color: #555;
      font-size: 16px;
    }

    .chambres-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-top: 15px;
    }

    .chambre-card {
      transition: all 0.3s ease;
      border-left: 4px solid #667eea;
    }

    .chambre-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
    }

    .chambre-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 16px 0 16px;
    }

    .chambre-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
    }

    .chambre-title mat-icon {
      color: #667eea;
    }

    .chambre-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 15px 0;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;
    }

    .stat mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .occupancy-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin: 10px 0;
    }

    .occupancy-fill {
      height: 100%;
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
      transition: width 0.3s ease;
    }

    .occupancy-fill.medium {
      background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
    }

    .occupancy-fill.high {
      background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
    }

    .occupancy-text {
      margin: 5px 0 0 0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-around;
      padding: 8px !important;
      border-top: 1px solid #eee;
    }

    .no-chambres {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      text-align: center;
      color: #999;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .no-chambres mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 15px;
      color: #ccc;
    }

    .no-chambres p {
      margin: 10px 0 15px 0;
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

    .no-data h3 {
      margin: 10px 0;
      color: #666;
      font-size: 24px;
    }

    .no-data p {
      margin: 10px 0 20px;
      color: #999;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .batiment-actions {
        flex-direction: column;
      }

      .batiment-actions button {
        width: 100%;
      }

      .chambres-grid {
        grid-template-columns: 1fr;
      }

      .panel-title-content {
        flex-wrap: wrap;
      }

      .panel-stats {
        width: 100%;
        margin-top: 10px;
      }
    }
  `]
})
export class BatimentsListComponent implements OnInit {
  private batimentService = inject(BatimentService);
  private chambreService = inject(ChambreService);
  private daaraService = inject(DaaraService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdRef = inject(ChangeDetectorRef);

  batiments: Batiment[] = [];
  chambresMap: Map<number, Chambre[]> = new Map();
  daarasMap: Map<number, Daara> = new Map();
  loading = true;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.batimentService.getAll().subscribe({
      next: (batiments) => {
        this.batiments = batiments;
        
        if (batiments.length === 0) {
          // Si pas de bâtiments, charger seulement les daaras
          this.loadDaarasOnly();
          return;
        }

        // Charger chambres et daaras en parallèle
        this.loadChambresAndDaaras(batiments);
      },
      error: (error) => {
        this.handleError('Erreur de chargement des bâtiments');
      }
    });
  }

  private loadDaarasOnly(): void {
    this.daaraService.getAll().subscribe({
      next: (daaras) => {
        daaras.forEach(daara => this.daarasMap.set(daara.id, daara));
        this.setLoadingFalse();
      },
      error: (error) => {
        this.handleError('Erreur de chargement des daaras');
      }
    });
  }

  private loadChambresAndDaaras(batiments: Batiment[]): void {
    // Créer les requêtes pour les chambres de chaque bâtiment
    const chambreRequests = batiments.map(batiment =>
      this.batimentService.getChambres(batiment.id)
    );

    // Exécuter toutes les requêtes en parallèle
    forkJoin({
      chambres: forkJoin(chambreRequests),
      daaras: this.daaraService.getAll()
    }).subscribe({
      next: (results) => {
        // Traiter les chambres
        results.chambres.forEach((chambres: Chambre[], index) => {
          this.chambresMap.set(batiments[index].id, chambres);
        });

        // Traiter les daaras
        results.daaras.forEach((daara: Daara) => {
          this.daarasMap.set(daara.id, daara);
        });

        this.setLoadingFalse();
      },
      error: (error) => {
        this.handleError('Erreur de chargement des données');
      }
    });
  }

  private setLoadingFalse(): void {
    this.loading = false;
    this.cdRef.detectChanges(); // ← FORCER LA DÉTECTION DE CHANGEMENT
  }

  private handleError(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 3000 });
    this.setLoadingFalse();
  }

  getChambresByBatiment(batimentId: number): Chambre[] {
    return this.chambresMap.get(batimentId) || [];
  }

  getDaaraName(daaraId: number): string {
    return this.daarasMap.get(daaraId)?.nom || '';
  }

  getTotalChambres(): number {
    return Array.from(this.chambresMap.values())
      .reduce((total, chambres) => total + chambres.length, 0);
  }

  getTotalLitsForBatiment(batimentId: number): number {
    const chambres = this.getChambresByBatiment(batimentId);
    return chambres.reduce((total, chambre) => total + chambre.nb_lits, 0);
  }

  getTalibesInChambre(chambreId: number): number {
    // Simulé - à remplacer par un vrai appel API
    return Math.floor(Math.random() * 6);
  }

  getAvailableLits(chambre: Chambre): number {
    const occupes = this.getTalibesInChambre(chambre.id);
    return Math.max(0, chambre.nb_lits - occupes);
  }

  getOccupancyPercentage(chambre: Chambre): number {
    if (chambre.nb_lits === 0) return 0;
    const occupes = this.getTalibesInChambre(chambre.id);
    return Math.round((occupes / chambre.nb_lits) * 100);
  }

  createBatiment(): void {
    this.router.navigate(['/batiments/create']);
  }

  editBatiment(id: number): void {
    this.router.navigate(['/batiments', id, 'edit']);
  }

  deleteBatiment(id: number): void {
    const batiment = this.batiments.find(b => b.id === id);
    const chambres = this.getChambresByBatiment(id);
    
    if (confirm(
      `Supprimer "${batiment?.nom}" et ses ${chambres.length} chambre(s) ?\n` +
      `Cette action est irréversible.`
    )) {
      this.batimentService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Bâtiment supprimé', 'Fermer', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Erreur de suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  createChambre(batimentId: number): void {
    this.router.navigate(['/batiments', batimentId, 'chambres', 'create']);
  }

  viewChambre(id: number): void {
    this.router.navigate(['/chambres', id,'detail']);
  }

  editChambre(id: number): void {
    this.router.navigate(['/chambres', id, 'edit']);
  }

  deleteChambre(id: number): void {
    if (confirm('Supprimer cette chambre ?')) {
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
}