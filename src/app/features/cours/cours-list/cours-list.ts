// ============================================
// COMPOSANTS COURS - LIST ET FORM
// ============================================

// ============================================
// 1. src/app/features/cours/cours-list/cours-list.component.ts
// ============================================
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { CoursService } from '../../../shared/services/cours';
import { Cours, Talibe, Enseignant } from '../../../core/models/user.model';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-cours-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    LayoutComponent,
    MatDividerModule
  ],
  template: `
    <app-layout>
      <div class="list-container">
        <div class="header">
          <div class="header-left">
            <h1>
              <mat-icon class="title-icon">book</mat-icon>
              Catalogue des Cours
            </h1>
            <p class="subtitle">{{cours.length}} cours disponible(s)</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="accent" (click)="exportCours()">
              <mat-icon>file_download</mat-icon>
              Exporter
            </button>
            <button mat-raised-button color="primary" (click)="createCours()">
              <mat-icon>add</mat-icon>
              Nouveau Cours
            </button>
          </div>
        </div>

        <!-- Stats rapides -->
        <div class="stats-grid">
          <mat-card class="stat-card total">
            <mat-card-content>
              <mat-icon>library_books</mat-icon>
              <div class="stat-info">
                <h2>{{cours.length}}</h2>
                <p>Total cours</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card active">
            <mat-card-content>
              <mat-icon>play_circle</mat-icon>
              <div class="stat-info">
                <h2>{{getActiveCoursCount()}}</h2>
                <p>Cours actifs</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card students">
            <mat-card-content>
              <mat-icon>groups</mat-icon>
              <div class="stat-info">
                <h2>{{getTotalStudents()}}</h2>
                <p>Total talibés</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card teachers">
            <mat-card-content>
              <mat-icon>person</mat-icon>
              <div class="stat-info">
                <h2>{{getTotalTeachers()}}</h2>
                <p>Total enseignants</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Barre de recherche -->
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher un cours</mat-label>
          <input matInput (keyup)="applyFilter($event)" 
                 placeholder="Code, libellé...">
          <mat-icon matPrefix>search</mat-icon>
          <button mat-icon-button matSuffix *ngIf="searchValue" 
                  (click)="clearSearch()">
            <mat-icon>clear</mat-icon>
          </button>
        </mat-form-field>

        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des cours...</p>
        </div>

        <!-- Grille des cours -->
        <div class="cours-grid" *ngIf="!loading && filteredCours.length > 0">
          <mat-card *ngFor="let c of filteredCours; let i = index" 
                    class="cours-card"
                    [class.featured]="i < 3">
            <div class="card-header">
              <div class="cours-icon-wrapper">
                <mat-icon class="cours-icon">{{getCoursIcon(c)}}</mat-icon>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="menu" 
                      class="menu-button">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="viewCours(c.id)">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir détails</span>
                </button>
                <button mat-menu-item (click)="editCours(c.id)">
                  <mat-icon>edit</mat-icon>
                  <span>Modifier</span>
                </button>
                <button mat-menu-item (click)="duplicateCours(c.id)">
                  <mat-icon>content_copy</mat-icon>
                  <span>Dupliquer</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="deleteCours(c.id)" class="delete-item">
                  <mat-icon>delete</mat-icon>
                  <span>Supprimer</span>
                </button>
              </mat-menu>
            </div>

            <mat-card-header>
              <mat-card-title>
                <mat-chip-set>
                  <mat-chip color="primary" highlighted>
                    {{c.code}}
                  </mat-chip>
                </mat-chip-set>
              </mat-card-title>
              <mat-card-subtitle>
                <h3>{{c.libelle}}</h3>
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <!-- Statistiques du cours -->
              <div class="cours-stats">
                <div class="stat-item">
                  <mat-icon>school</mat-icon>
                  <div>
                    <strong>{{c.nombre_talibes}}</strong>
                    <span>Talibés inscrits</span>
                  </div>
                </div>
                <div class="stat-item">
                  <mat-icon>person</mat-icon>
                  <div>
                    <strong>{{c.nombre_enseignants}}</strong>
                    <span>Enseignants</span>
                  </div>
                </div>
              </div>

              <!-- Niveau du cours -->
              <div class="niveau-section">
                <span class="niveau-label">Niveau:</span>
                <mat-chip-set>
                  <mat-chip [color]="getNiveauColor(c)">
                    {{c.niveau}}
                  </mat-chip>
                </mat-chip-set>
              </div>

              <!-- Tags -->
              <div class="tags-section">
                <mat-chip-set>
                  <mat-chip *ngIf="nbTalibes > 20">
                    <mat-icon>trending_up</mat-icon>
                    Populaire
                  </mat-chip>
                  <mat-chip *ngIf="nbTalibes === 0" color="warn">
                    <mat-icon>info</mat-icon>
                    Aucun inscrit
                  </mat-chip>
                  <mat-chip *ngIf="isNewCours(c)" color="accent">
                    <mat-icon>new_releases</mat-icon>
                    Nouveau
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" (click)="viewCours(c.id)">
                <mat-icon>visibility</mat-icon>
                Détails
              </button>
              <button mat-button color="accent" (click)="editCours(c.id)">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-button (click)="manageTalibes(c.id)">
                <mat-icon>group_add</mat-icon>
                Inscrire talibés
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Message si aucun résultat -->
        <div class="no-data" *ngIf="!loading && filteredCours.length === 0">
          <mat-icon>book_off</mat-icon>
          <h3>Aucun cours trouvé</h3>
          <p>{{cours.length === 0 ? 'Commencez par créer votre premier cours' : 'Aucun résultat pour votre recherche'}}</p>
          <button mat-raised-button color="primary" (click)="createCours()" 
                  *ngIf="cours.length === 0">
            <mat-icon>add</mat-icon>
            Créer un cours
          </button>
          <button mat-stroked-button (click)="clearSearch()" 
                  *ngIf="cours.length > 0">
            <mat-icon>clear</mat-icon>
            Effacer la recherche
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

    .header-actions {
      display: flex;
      gap: 10px;
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

    .stat-card.active {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .stat-card.students {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .stat-card.teachers {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .search-field {
      width: 100%;
      max-width: 600px;
      margin-bottom: 30px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    .cours-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .cours-card {
      position: relative;
      transition: all 0.3s ease;
      border-left: 4px solid #667eea;
    }

    .cours-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.25);
    }

    .cours-card.featured {
      border-left-color: #ffa726;
    }

    .cours-card.featured::before {
      content: '⭐ POPULAIRE';
      position: absolute;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 0.5px;
      z-index: 10;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 16px 0 16px;
    }

    .cours-icon-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .cours-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .menu-button {
      margin-top: -8px;
    }

    mat-card-header {
      margin-top: 15px;
    }

    mat-card-title {
      margin-bottom: 10px !important;
    }

    mat-card-subtitle h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
      font-weight: 600;
      line-height: 1.4;
    }

    .cours-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 20px 0;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-item mat-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-item strong {
      display: block;
      font-size: 20px;
      color: #333;
      line-height: 1;
    }

    .stat-item span {
      display: block;
      font-size: 11px;
      color: #666;
      margin-top: 4px;
    }

    .niveau-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .niveau-label {
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }

    .tags-section {
      margin-top: 15px;
    }

    mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px 16px !important;
      border-top: 1px solid #eee;
      flex-wrap: wrap;
      gap: 8px;
    }

    mat-card-actions button {
      flex: 1;
      min-width: 120px;
    }

    .delete-item {
      color: #f44336;
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

    .no-data button {
      margin-top: 10px;
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

      .cours-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      mat-card-actions {
        flex-direction: column;
      }

      mat-card-actions button {
        width: 100%;
      }
    }
  `]
})
export class CoursListComponent implements OnInit {
  private coursService = inject(CoursService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdRef = inject(ChangeDetectorRef)

  cours: Cours[] = [];
  filteredCours: Cours[] = [];
  loading = true;
  searchValue = '';
  nbTalibes : number = 0;
  talibes: Talibe[] = [];
    enseignants: Enseignant[] = [];

  ngOnInit(): void {
    this.loadCours();
  }

  loadCours(): void {
    this.coursService.getAll().subscribe({
      next: (data) => {
        this.cours = data;
        this.filteredCours = data;
        this.loading = false;
        this.nbTalibes = data.length;
        
        // 🔥 SOLUTION : Forcer la détection des changements
        this.cdRef.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
        this.cdRef.detectChanges();
      }
    });
  }

  applyFilter(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    
    if (!this.searchValue) {
      this.filteredCours = this.cours;
      return;
    }

    this.filteredCours = this.cours.filter(c => 
      c.code.toLowerCase().includes(this.searchValue) ||
      c.libelle.toLowerCase().includes(this.searchValue)
    );
    this.cdRef.detectChanges();
  }

  clearSearch(): void {
    this.searchValue = '';
    this.filteredCours = this.cours;
  }

  getCoursIcon(cours: Cours): string {
    // Icônes selon le type de cours (basé sur le code)
    if (cours.code.startsWith('COR')) return 'menu_book';
    if (cours.code.startsWith('HAD')) return 'history_edu';
    if (cours.code.startsWith('FIQ')) return 'gavel';
    if (cours.code.startsWith('TAF')) return 'auto_stories';
    if (cours.code.startsWith('ARA')) return 'translate';
    return 'book';
  }

  getStudentCount(cours: Cours): number {
    // Simulé - à remplacer par un vrai appel API
    return Math.floor(Math.random() * 30);
  }

  getTeacherCount(cours: Cours): number {
    // Simulé
    return Math.floor(Math.random() * 3) + 1;
  }

  getNiveau(cours: Cours): string {
    // Simulé - basé sur le code
    if (cours.code.includes('1')) return 'Débutant';
    if (cours.code.includes('2')) return 'Intermédiaire';
    if (cours.code.includes('3')) return 'Avancé';
    return 'Tous niveaux';
  }

  getNiveauColor(cours: Cours): string {
    const niveau = this.getNiveau(cours);
    if (niveau === 'Débutant') return 'primary';
    if (niveau === 'Intermédiaire') return 'accent';
    if (niveau === 'Avancé') return 'warn';
    return '';
  }

  isNewCours(cours: Cours): boolean {
    // Cours ajouté dans les 30 derniers jours
    return Math.random() > 0.7;
  }

  getActiveCoursCount(): number {
    return this.cours.filter(c => this.getStudentCount(c) > 0).length;
  }

  getTotalStudents(): number {
    return this.cours.reduce((sum, c) => sum + this.getStudentCount(c), 0);
  }

  getTotalTeachers(): number {
    return this.cours.reduce((sum, c) => sum + this.getTeacherCount(c), 0);
  }

  createCours(): void {
    this.router.navigate(['/cours/create']);
  }

  viewCours(id: number): void {
    this.router.navigate(['/cours', id,'detail']);
  }

  editCours(id: number): void {
    this.router.navigate(['/cours', id, 'edit']);
  }

  duplicateCours(id: number): void {
    const cours = this.cours.find(c => c.id === id);
    if (confirm(`Dupliquer le cours "${cours?.libelle}" ?`)) {
      // Créer une copie avec un nouveau code
      const newCours = {
        ...cours,
        code: cours!.code + '-COPIE',
        libelle: cours!.libelle + ' (Copie)'
      };
      
      this.coursService.create(newCours).subscribe({
        next: () => {
          this.snackBar.open('Cours dupliqué avec succès', 'Fermer', { duration: 3000 });
          this.loadCours();
          this.cdRef.detectChanges();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  deleteCours(id: number): void {
    const cours = this.cours.find(c => c.id === id);
    if (confirm(`Supprimer le cours "${cours?.libelle}" ?\n\nCette action est irréversible.`)) {
      this.coursService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Cours supprimé', 'Fermer', { duration: 3000 });
          this.loadCours();
        },
        error: () => {
          this.snackBar.open('Erreur de suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  manageTalibes(id: number): void {
    this.router.navigate(['/cours', id, 'talibes']);
  }

  exportCours(): void {
    this.snackBar.open('Export en cours...', 'Fermer', { duration: 2000 });
    // Implémenter l'export Excel/PDF
  }

  loadTalibes(coursId: number): void {
    this.coursService.getTalibes(coursId).subscribe({
      next: (talibes) => this.talibes = talibes
    });
  }

  loadEnseignants(coursId: number): void {
    this.coursService.getEnseignants(coursId).subscribe({
      next: (enseignants) => this.enseignants = enseignants
    });
  }
}

// Suite avec cours-form...