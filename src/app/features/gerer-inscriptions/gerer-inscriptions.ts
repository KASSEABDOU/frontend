import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { CoursService } from '../../shared/services/cours';
import { TalibeService } from '../../shared/services/talibe';
import { Cours, Talibe } from '../../core/models/user.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-gerer-inscriptions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="container" *ngIf="!loading">
        <!-- En-tête -->
        <mat-card class="header-card">
          <mat-card-content>
            <div class="header">
              <div>
                <h1>Gérer les inscriptions</h1>
                <p *ngIf="cours">Cours: <strong>{{cours.libelle}}</strong></p>
              </div>
              <button mat-raised-button (click)="retour()">
                <mat-icon>arrow_back</mat-icon>
                Retour
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="content-grid">
          <!-- Inscrire des talibés -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person_add</mat-icon>
                Inscrire des talibés
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Sélectionner des talibés</mat-label>
                <mat-select [formControl]="selectedTalibes" multiple>
                  <mat-option *ngFor="let talibe of talibesDisponibles" [value]="talibe.id">
                    {{talibe.prenom}} {{talibe.nom}} - {{talibe.matricule}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <button 
                mat-raised-button 
                color="primary" 
                [disabled]="!selectedTalibes.value?.length"
                (click)="inscrireTalibes()"
                class="full-width">
                <mat-icon>group_add</mat-icon>
                Inscrire {{selectedTalibes.value?.length || 0}} talibé(s)
              </button>
            </mat-card-content>
          </mat-card>

          <!-- Liste des inscrits -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>school</mat-icon>
                Talibés inscrits ({{talibesInscrits.length}})
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="talibesInscrits" *ngIf="talibesInscrits.length > 0">
                <ng-container matColumnDef="nom">
                  <th mat-header-cell *matHeaderCellDef>Nom complet</th>
                  <td mat-cell *matCellDef="let talibe ">
                    <strong>{{talibe.prenom}} {{talibe.nom}}</strong>
                  </td>
                </ng-container>

                <ng-container matColumnDef="matricule">
                  <th mat-header-cell *matHeaderCellDef>Matricule</th>
                  <td mat-cell *matCellDef="let talibe of talibesInscrits">{{talibe.matricule}}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let talibe">
                    <button 
                      mat-icon-button 
                      color="warn" 
                      (click)="desinscrireTalibe(talibe.id)"
                      matTooltip="Désinscrire">
                      <mat-icon>remove_circle</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <div class="empty-state" *ngIf="talibesInscrits.length === 0">
                <mat-icon>person_off</mat-icon>
                <p>Aucun talibé inscrit</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner></mat-spinner>
      </div>
    </app-layout>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 30px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    table {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    @media (max-width: 968px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GererInscriptionsComponent implements OnInit {
  private coursService = inject(CoursService);
  private talibeService = inject(TalibeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  cours: Cours | null = null;
  talibesInscrits: Talibe[] = [];
  talibesDisponibles: Talibe[] = [];
  loading = true;

  selectedTalibes = new FormControl<number[]>([]);
  selectedTalibe = 0;
  displayedColumns = ['nom', 'matricule', 'actions'];
  coursId!: number;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.coursId = +params['id'];
      this.loadData();
    });
  }

 loadData(): void {
    this.loading = true;
    
    forkJoin({
      cours: this.coursService.getById(this.coursId),
      talibesInscrits: this.coursService.getTalibes(this.coursId),
      allTalibes: this.talibeService.getAll()
    }).subscribe({
      next: ({ cours, talibesInscrits, allTalibes }) => {
        this.cours = cours;
        // 🔥 SOLUTION : S'assurer que ce sont des tableaux
        this.talibesInscrits = Array.isArray(talibesInscrits) ? talibesInscrits : [];
        const allTalibesArray = Array.isArray(allTalibes) ? allTalibes : [];
        
        const inscritIds = this.talibesInscrits.map(t => t.id);
        this.talibesDisponibles = allTalibesArray.filter(t => 
          !inscritIds.includes(t.id)
        );
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement données:', error);
        this.talibesInscrits = [];
        this.talibesDisponibles = [];
        this.loading = false;
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
      }
    });
    
  }

  // ============================================
  // UTILISATION: inscrire_talibe_cours
  // ============================================
  inscrireTalibes(): void {
    const talibeIds = this.selectedTalibes.value || [];
    if (talibeIds.length === 0) {
      this.snackBar.open('Veuillez sélectionner au moins un talibé', 'Fermer', { duration: 3000 });
      return;
    }
    
    this.selectedTalibe = talibeIds[0];

    this.coursService.inscrireTalibeCours(this.coursId, this.selectedTalibe).subscribe({
      next: () => {
        this.snackBar.open(
          `${talibeIds.length} talibé(s) inscrit(s) avec succès`,
          'Fermer',
          { duration: 3000 }
        );
        this.selectedTalibes.reset();
        this.loadData();
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'inscription', 'Fermer', { duration: 3000 });
      }
    });
  }

  desinscrireTalibe(talibeId: number): void {
    if (!confirm('Désinscrire ce talibé du cours ?')) return;

    this.coursService.desinscrireTalibeCours(this.coursId, talibeId).subscribe({
      next: () => {
        this.snackBar.open('Talibé désinscrit', 'Fermer', { duration: 2000 });
        this.loadData();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la désinscription', 'Fermer', { duration: 3000 });
      }
    });
  }

  retour(): void {
    this.router.navigate(['/cours', this.coursId]);
  }
}