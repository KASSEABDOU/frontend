import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { DaaraService } from '../../../shared/services/daara';
import { Daara } from '../../../core/models/user.model';

@Component({
  selector: 'app-daaras-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="list-container">
        <div class="header">
          <div class="header-left">
            <h1>
              <mat-icon class="title-icon">business</mat-icon>
              Gestion des Daaras
            </h1>
            <p class="subtitle">{{daaras.length}} daara(s) enregistré(s)</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="accent" routerLink="/daaras/map">
              <mat-icon>map</mat-icon>
              Voir la carte
            </button>
            <button mat-raised-button color="primary" (click)="createDaara()">
              <mat-icon>add</mat-icon>
              Nouveau Daara
            </button>
          </div>
        </div>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher un daara</mat-label>
          <input matInput (keyup)="applyFilter($event)" 
                 placeholder="Nom, lieu, propriétaire...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <!-- Skeleton Loader -->
        <div *ngIf="loading" class="skeleton-container">
          <mat-card *ngFor="let item of skeletonItems" class="skeleton-card">
            <div class="skeleton-header">
              <div class="skeleton-icon"></div>
              <div class="skeleton-badge"></div>
            </div>
            <div class="skeleton-title"></div>
            <div class="skeleton-subtitle"></div>
            <div class="skeleton-content">
              <div class="skeleton-stat" *ngFor="let stat of [1,2,3]"></div>
            </div>
            <div class="skeleton-actions">
              <div class="skeleton-button" *ngFor="let btn of [1,2,3]"></div>
            </div>
          </mat-card>
        </div>

        <!-- Liste des daaras avec pagination -->
        <div class="daaras-grid" *ngIf="!loading && paginatedDaaras.length > 0">
          <mat-card *ngFor="let daara of paginatedDaaras; trackBy: trackByDaaraId" 
                    class="daara-card">
            <!-- Contenu de la carte (inchangé) -->
            <div class="card-header">
              <mat-icon class="daara-icon">business</mat-icon>
              <span class="daara-badge">ID: {{daara.id}}</span>
            </div>

            <mat-card-header>
              <mat-card-title>{{daara.nom}}</mat-card-title>
              <mat-card-subtitle>
                <mat-icon>location_on</mat-icon>
                {{daara.lieu || 'Lieu non spécifié'}}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="proprietaire-section" *ngIf="daara.proprietaire">
                <mat-icon>person_outline</mat-icon>
                <span>{{daara.proprietaire}}</span>
              </div>

              <div class="stats-grid">
                <div class="stat-item talibes">
                  <mat-icon>school</mat-icon>
                  <div class="stat-content">
                    <span class="stat-number">{{daara.nombre_talibes}}</span>
                    <span class="stat-label">Talibés</span>
                  </div>
                </div>

                <div class="stat-item enseignants">
                  <mat-icon>person</mat-icon>
                  <div class="stat-content">
                    <span class="stat-number">{{daara.nombre_enseignants}}</span>
                    <span class="stat-label">Enseignants</span>
                  </div>
                </div>

                <div class="stat-item batiments">
                  <mat-icon>apartment</mat-icon>
                  <div class="stat-content">
                    <span class="stat-number">{{daara.nombre_batiments}}</span>
                    <span class="stat-label">Bâtiments</span>
                  </div>
                </div>
              </div>

              <div class="ratio-section">
                <span class="ratio-label">Ratio Talibés/Enseignant:</span>
                <mat-chip-set>
                  <mat-chip [highlighted]="getRatio(daara) > 10" 
                            [color]="getRatio(daara) > 10 ? 'warn' : 'accent'">
                    {{getRatio(daara)}} : 1
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" (click)="viewDaara(daara.id)"
                      matTooltip="Voir les détails">
                <mat-icon>visibility</mat-icon>
                Voir
              </button>
              <button mat-button color="accent" (click)="editDaara(daara.id)"
                      matTooltip="Modifier le daara">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-button color="warn" (click)="deleteDaara(daara.id)"
                      matTooltip="Supprimer le daara">
                <mat-icon>delete</mat-icon>
                Supprimer
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" *ngIf="!loading && totalPages > 1">
          <div class="pagination-info">
            Affichage de {{ (currentPage - 1) * pageSize + 1 }} à 
            {{ getEndIndex() }} sur {{ totalItems }} daaras
          </div>
          
          <div class="pagination-controls">
            <button mat-icon-button (click)="goToPage(currentPage - 1)" 
                    [disabled]="currentPage === 1">
              <mat-icon>chevron_left</mat-icon>
            </button>
            
            <button *ngFor="let page of getVisiblePages()" 
                    mat-button
                    [class.active]="page === currentPage"
                    (click)="goToPage(page)"
                    [disabled]="page === '...'">
              {{ page }}
            </button>
            
            <button mat-icon-button (click)="goToPage(currentPage + 1)" 
                    [disabled]="currentPage === totalPages">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>

        <!-- Aucune donnée -->
        <div class="no-data" *ngIf="!loading && filteredDaaras.length === 0">
          <mat-icon>business_off</mat-icon>
          <h3>Aucun daara trouvé</h3>
          <p>{{daaras.length === 0 ? 'Commencez par créer votre premier daara' : 'Aucun résultat pour votre recherche'}}</p>
          <button mat-raised-button color="primary" (click)="createDaara()" 
                  *ngIf="daaras.length === 0">
            <mat-icon>add</mat-icon>
            Créer un daara
          </button>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    /* Styles inchangés */
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

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .search-field {
      width: 100%;
      max-width: 500px;
      margin-bottom: 30px;
    }

    .skeleton-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .skeleton-card {
      padding: 16px;
      animation: pulse 2s infinite;
      height: 380px;
    }

    .skeleton-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .skeleton-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e0e0e0;
    }

    .skeleton-badge {
      width: 60px;
      height: 20px;
      border-radius: 10px;
      background: #e0e0e0;
    }

    .skeleton-title {
      width: 70%;
      height: 24px;
      background: #e0e0e0;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .skeleton-subtitle {
      width: 50%;
      height: 16px;
      background: #e0e0e0;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .skeleton-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .skeleton-stat {
      height: 60px;
      background: #e0e0e0;
      border-radius: 8px;
    }

    .skeleton-actions {
      display: flex;
      justify-content: space-around;
      gap: 8px;
    }

    .skeleton-button {
      flex: 1;
      height: 36px;
      background: #e0e0e0;
      border-radius: 4px;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .daaras-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 30px;
    }

    .daara-card {
      position: relative;
      transition: all 0.2s ease;
      overflow: visible;
      height: 380px;
    }

    .daara-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1) !important;
    }

    .card-header {
      position: absolute;
      top: -10px;
      right: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .daara-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px;
      border-radius: 50%;
      font-size: 24px;
      width: 40px;
      height: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .daara-badge {
      background: #f5f5f5;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      color: #666;
    }

    mat-card-header {
      margin-top: 30px;
    }

    mat-card-title {
      font-size: 20px !important;
      font-weight: 600 !important;
      color: #333 !important;
      margin-bottom: 8px !important;
    }

    mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666 !important;
      font-size: 14px !important;
    }

    mat-card-subtitle mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #667eea;
    }

    .proprietaire-section {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 16px;
      color: #555;
      font-size: 14px;
    }

    .proprietaire-section mat-icon {
      color: #667eea;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .stat-item:hover {
      transform: scale(1.05);
    }

    .stat-item.talibes {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-item.enseignants {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-item.batiments {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .stat-item mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      margin-bottom: 8px;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
    }

    .stat-label {
      font-size: 11px;
      margin-top: 4px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ratio-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 13px;
      color: #555;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-around;
      padding: 8px 16px 16px !important;
      border-top: 1px solid #eee;
    }

    mat-card-actions button {
      flex: 1;
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .pagination-info {
      color: #666;
      font-size: 14px;
    }

    .pagination-controls {
      display: flex;
      gap: 5px;
      align-items: center;
      flex-wrap: wrap;
    }

    .pagination-controls button.active {
      background: #667eea;
      color: white;
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

    @media (max-width: 1200px) {
      .daaras-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions button {
        flex: 1;
      }

      .daaras-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .pagination-container {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class DaarasListComponent implements OnInit {
  private daaraService = inject(DaaraService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdRef = inject(ChangeDetectorRef);

  // Données
  daaras: Daara[] = [];
  filteredDaaras: Daara[] = [];
  
  // État de chargement
  loading = true;
  skeletonItems = Array(6).fill(0);
  
  // Pagination
  currentPage = 1;
  pageSize = 9;
  searchTerm = '';

  ngOnInit(): void {
    this.loadDaaras();
  }

  loadDaaras(): void {
    this.loading = true;
    
    this.daaraService.getAll().subscribe({
      next: (data) => {
        this.daaras = data;
        this.filteredDaaras = data;
        this.loading = false;
        
        // Forcer la détection de changement
        this.cdRef.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.cdRef.detectChanges();
        
        this.snackBar.open('Erreur lors du chargement des daaras', 'Fermer', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Getters pour la pagination
  get paginatedDaaras(): Daara[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredDaaras.slice(startIndex, startIndex + this.pageSize);
  }

  get totalItems(): number {
    return this.filteredDaaras.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  goToPage(page: number | string): void {
    if (typeof page === 'string') {
      return;
    }
    
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1, '...', this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages);
      } else {
        pages.push(1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages);
      }
    }
    
    return pages;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm = filterValue;
    
    setTimeout(() => {
      if (this.searchTerm === filterValue) {
        this.filterDaaras();
      }
    }, 300);
  }

  private filterDaaras(): void {
    if (!this.searchTerm) {
      this.filteredDaaras = this.daaras;
    } else {
      this.filteredDaaras = this.daaras.filter(daara => 
        daara.nom.toLowerCase().includes(this.searchTerm) ||
        daara.lieu?.toLowerCase().includes(this.searchTerm) ||
        daara.proprietaire?.toLowerCase().includes(this.searchTerm)
      );
    }
    
    this.currentPage = 1;
  }

  trackByDaaraId(index: number, daara: Daara): number {
    return daara.id;
  }

  getRatio(daara: Daara): number {
    if (daara.nombre_enseignants === 0) return 0;
    return Math.round(daara.nombre_talibes / daara.nombre_enseignants);
  }

  createDaara(): void {
    this.router.navigate(['/daaras/create']);
  }

  viewDaara(id: number): void {
    this.router.navigate(['/daaras', id,'detail']);
  }

  editDaara(id: number): void {
    this.router.navigate(['/daaras', id, 'edit']);
  }

  deleteDaara(id: number): void {
    const daara = this.daaras.find(d => d.id === id);
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir supprimer le daara "${daara?.nom}" ?\n\n` +
      `Cette action supprimera également:\n` +
      `- ${daara?.nombre_talibes} talibé(s)\n` +
      `- ${daara?.nombre_enseignants} enseignant(s)\n` +
      `- ${daara?.nombre_batiments} bâtiment(s)\n\n` +
      `Cette action est irréversible.`
    );

    if (confirmation) {
      this.daaraService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Daara supprimé avec succès', 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadDaaras();
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}