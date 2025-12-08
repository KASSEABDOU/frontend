import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { EnseignantService } from '../../../shared/services/enseignant';
import { Enseignant } from '../../../core/models/user.model';

@Component({
  selector: 'app-enseignants-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="list-container">
        <div class="header">
          <h1>Liste des Enseignants</h1>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="createEnseignant()" [disabled]="loading">
              <mat-icon>add</mat-icon>
              Nouvel Enseignant
            </button>
            <button mat-icon-button (click)="refreshData()" [disabled]="loading" matTooltip="Actualiser">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </div>

        <!-- Debug info -->
        <div class="debug-info" *ngIf="showDebug">
          <p>🕒 Chargement: {{ loading ? 'OUI' : 'NON' }} | 📊 Total: {{ enseignants.length }} | 🔍 Filtre: {{ filteredEnseignants.length }} | 📄 Page: {{ currentPage }}</p>
        </div>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput 
                 (keyup)="applyFilter($event)" 
                 placeholder="Nom, prénom, spécialité..."
                 [disabled]="loading">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <!-- Skeleton loader -->
        <div *ngIf="loading" class="skeleton-container">
          <div class="skeleton-row" *ngFor="let item of skeletonItems">
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell actions"></div>
          </div>
        </div>

        <!-- Table avec données -->
        <div class="table-container" *ngIf="!loading && filteredEnseignants.length > 0">
          <div class="pagination-info">
            Affichage de {{ startIndex + 1 }} à {{ endIndex }} sur {{ totalItems }} enseignant(s)
          </div>

          <table mat-table [dataSource]="paginatedEnseignants" class="mat-elevation-z1">
            <ng-container matColumnDef="matricule">
              <th mat-header-cell *matHeaderCellDef>Matricule</th>
              <td mat-cell *matCellDef="let enseignant">{{enseignant.matricule}}</td>
            </ng-container>

            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef>Nom complet</th>
              <td mat-cell *matCellDef="let enseignant">
                <strong>{{enseignant.nom}} {{enseignant.prenom}}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="specialite">
              <th mat-header-cell *matHeaderCellDef>Spécialité</th>
              <td mat-cell *matCellDef="let enseignant">
                <mat-chip-set>
                  <mat-chip>{{enseignant.specialite || 'Non définie'}}</mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>


            <ng-container matColumnDef="telephone">
              <th mat-header-cell *matHeaderCellDef>Téléphone</th>
              <td mat-cell *matCellDef="let enseignant">{{enseignant.telephone || '-'}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let enseignant">
                <button mat-icon-button color="primary" (click)="viewEnseignant(enseignant.id)"
                        matTooltip="Voir détails" [disabled]="loading">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" (click)="editEnseignant(enseignant.id)"
                        matTooltip="Modifier" [disabled]="loading">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteEnseignant(enseignant.id)"
                        matTooltip="Supprimer" [disabled]="loading">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            *ngIf="totalItems > pageSize"
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageIndex]="currentPage - 1"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            [disabled]="loading"
            aria-label="Select page">
          </mat-paginator>
        </div>

        <!-- États vides -->
        <div *ngIf="!loading && filteredEnseignants.length === 0 && enseignants.length > 0" class="no-data filtered">
          <mat-icon>search_off</mat-icon>
          <h3>Aucun résultat</h3>
          <p>Aucun enseignant ne correspond à votre recherche "{{ searchTerm }}"</p>
          <button mat-button (click)="clearSearch()">
            <mat-icon>clear</mat-icon>
            Effacer la recherche
          </button>
        </div>

        <div *ngIf="!loading && enseignants.length === 0" class="no-data empty">
          <mat-icon>person_off</mat-icon>
          <h3>Aucun enseignant</h3>
          <p>Commencez par créer votre premier enseignant</p>
          <button mat-raised-button color="primary" (click)="createEnseignant()">
            <mat-icon>add</mat-icon>
            Créer un enseignant
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
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header h1 {
      margin: 0;
      color: #333;
      font-size: 28px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .debug-info {
      background: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 12px;
      color: #666;
      font-family: monospace;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
      margin-bottom: 20px;
    }

    /* Skeleton loader */
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-row {
      display: flex;
      gap: 16px;
      padding: 12px;
      background: white;
      border-radius: 4px;
    }

    .skeleton-cell {
      flex: 1;
      height: 20px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-cell.actions {
      flex: 0.5;
      max-width: 150px;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .table-container {
      overflow-x: auto;
      background: white;
      border-radius: 8px;
    }

    .pagination-info {
      padding: 16px;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }

    table {
      width: 100%;
      min-width: 1000px;
    }

    th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    tr:hover {
      background-color: #f8f9fa;
    }

    mat-chip-set {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      text-align: center;
      background: white;
      border-radius: 8px;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .no-data p {
      margin: 0 0 20px 0;
      color: #999;
    }

    .no-data.filtered {
      background: #fff9e6;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        justify-content: space-between;
      }

      .list-container {
        padding: 16px;
      }
    }
  `]
})
export class EnseignantsListComponent implements OnInit, OnDestroy {
  private enseignantService = inject(EnseignantService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdRef = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Données
  enseignants: Enseignant[] = [];
  filteredEnseignants: Enseignant[] = [];
  
  // État
  loading = false;
  showDebug = true; // Mettre à false en production
  
  // Pagination
  currentPage = 1;
  pageSize = 25;
  searchTerm = '';
  skeletonItems = Array(10).fill(0);
  
  // Colonnes
  displayedColumns = ['matricule', 'nom', 'specialite', 'telephone', 'actions'];

  ngOnInit(): void {
    console.log('🎯 EnseignantsListComponent initialisé');
    this.loadEnseignants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEnseignants(): void {
    if (this.loading) {
      console.log('⚠️ Chargement déjà en cours...');
      return;
    }

    this.loading = true;
    console.time('🕒 Chargement enseignants');
    
    this.cdRef.detectChanges();

    this.enseignantService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.timeEnd('🕒 Chargement enseignants');
          console.log(`✅ ${data.length} enseignants chargés`);

          this.enseignants = data;
          this.filteredEnseignants = data;
          this.loading = false;
          
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.timeEnd('🕒 Chargement enseignants');
          console.error('❌ Erreur chargement enseignants:', error);
          
          this.loading = false;
          this.cdRef.detectChanges();
          
          this.snackBar.open('Erreur de chargement des enseignants', 'Fermer', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  refreshData(): void {
    console.log('🔄 Actualisation manuelle...');
    this.enseignantService.refreshEnseignants();
    this.loadEnseignants();
  }

  // Getters pagination
  get paginatedEnseignants(): Enseignant[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredEnseignants.slice(startIndex, startIndex + this.pageSize);
  }

  get totalItems(): number {
    return this.filteredEnseignants.length;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  // Navigation
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  }

  // Filtrage avec debounce
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm = filterValue;
    
    setTimeout(() => {
      if (this.searchTerm === filterValue) {
        this.filterEnseignants();
      }
    }, 300);
  }

  private filterEnseignants(): void {
    if (!this.searchTerm) {
      this.filteredEnseignants = this.enseignants;
    } else {
      this.filteredEnseignants = this.enseignants.filter(e => 
        e.nom?.toLowerCase().includes(this.searchTerm) ||
        e.prenom?.toLowerCase().includes(this.searchTerm) ||
        e.matricule?.toLowerCase().includes(this.searchTerm) ||
        e.specialite?.toLowerCase().includes(this.searchTerm) ||
        e.grade?.toLowerCase().includes(this.searchTerm)
      );
    }
    
    this.currentPage = 1;
    this.cdRef.detectChanges();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredEnseignants = this.enseignants;
    this.currentPage = 1;
  }

  // Helper pour limiter l'affichage des cours
  getLimitedCours(cours: any[] | undefined): any[] {
    return cours ? cours.slice(0, 2) : [];
  }

  // Navigation
  createEnseignant(): void {
    this.router.navigate(['/enseignants/create']);
  }

  viewEnseignant(id: number): void {
    this.router.navigate(['/enseignants', id, 'detail']);
  }

  editEnseignant(id: number): void {
    this.router.navigate(['/enseignants', id, 'edit']);
  }

  deleteEnseignant(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      this.enseignantService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Enseignant supprimé avec succès', 'Fermer', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.refreshData();
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