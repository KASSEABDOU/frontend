import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
import { EnseignantService } from '../../shared/services/enseignant';
import { Cours, Talibe, Enseignant } from '../../core/models/user.model';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-assigner-enseignants',
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
        <mat-card class="header-card">
          <mat-card-content>
            <div class="header">
              <div>
                <h1>Assigner des enseignants</h1>
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
          <!-- Confier enseignant -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person_add</mat-icon>
                Confier un enseignant
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Sélectionner un enseignant</mat-label>
                <mat-select [formControl]="selectedEnseignant">
                  <mat-option *ngFor="let ens of enseignantsDisponibles" [value]="ens.id">
                    {{ens.prenom}} {{ens.nom}} - {{ens.specialite}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Rôle</mat-label>
                <mat-select [formControl]="roleControl">
                  <mat-option value="titulaire">Titulaire</mat-option>
                  <mat-option value="assistant">Assistant</mat-option>
                  <mat-option value="remplaçant">Remplaçant</mat-option>
                </mat-select>
              </mat-form-field>

              <button 
                mat-raised-button 
                color="primary" 
                [disabled]="!selectedEnseignant.value"
                (click)="confierEnseignant()"
                class="full-width">
                <mat-icon>person_add</mat-icon>
                Confier au cours
              </button>
            </mat-card-content>
          </mat-card>

          <!-- Liste des enseignants assignés -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>people</mat-icon>
                Enseignants assignés ({{enseignantsAssignes.length}})
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="enseignants-list" *ngIf="enseignantsAssignes.length > 0">
                <div *ngFor="let ens of enseignantsAssignes" class="enseignant-item">
                  <div class="enseignant-info">
                    <mat-icon>person</mat-icon>
                    <div>
                      <strong>{{ens.prenom}} {{ens.nom}}</strong>
                      <p>{{ens.specialite}}</p>
                      <mat-chip-set>
                        <mat-chip color="accent">{{ens.grade || 'Enseignant'}}</mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                  <button 
                    mat-icon-button 
                    color="warn" 
                    (click)="retirerEnseignant(ens.id)"
                    matTooltip="Retirer">
                    <mat-icon>remove_circle</mat-icon>
                  </button>
                </div>
              </div>

              <div class="empty-state" *ngIf="enseignantsAssignes.length === 0">
                <mat-icon>person_off</mat-icon>
                <p>Aucun enseignant assigné</p>
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

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .enseignants-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .enseignant-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .enseignant-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .enseignant-info mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .enseignant-info p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
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

    @media (max-width: 968px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})

export class AssignerEnseignantsComponent implements OnInit {
  private coursService = inject(CoursService);
  private enseignantService = inject(EnseignantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
   private cdRef = inject(ChangeDetectorRef);

  cours: Cours | null = null;
  enseignantsAssignes: Enseignant[] = [];
  enseignantsDisponibles: Enseignant[] = [];
  loading = true;

  selectedEnseignant = new FormControl<number | null>(null);
  roleControl = new FormControl<string>('titulaire');
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
      enseignantsAssignes: this.coursService.getEnseignants(this.coursId),
      tousEnseignants: this.enseignantService.getAll()
    }).subscribe({
      next: ({ cours, enseignantsAssignes, tousEnseignants }) => {
        this.cours = cours;
        
        // 🔥 S'assurer que ce sont des tableaux
        this.enseignantsAssignes = Array.isArray(enseignantsAssignes) ? enseignantsAssignes : [];
        const tousEnseignantsArray = Array.isArray(tousEnseignants) ? tousEnseignants : [];
        
        // Filtrer les enseignants disponibles
        const assigneIds = this.enseignantsAssignes.map(e => e.id);
        this.enseignantsDisponibles = tousEnseignantsArray.filter(e => 
          !assigneIds.includes(e.id)
        );
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement données:', error);
        this.enseignantsAssignes = [];
        this.enseignantsDisponibles = [];
        this.loading = false;
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
        this.cdRef.detectChanges();
      }
    });
  }

  confierEnseignant(): void {
    const enseignantId = this.selectedEnseignant.value;
    const role = this.roleControl.value as 'titulaire' | 'assistant' | 'remplaçant';

    if (!enseignantId) return;

    this.loading = true;

    this.coursService.confierEnseignantCours(this.coursId, enseignantId, { role }).subscribe({
      next: () => {
        this.snackBar.open('Enseignant assigné avec succès', 'Fermer', { duration: 3000 });
        this.selectedEnseignant.reset();
        this.loadData(); // ⬅️ Recharger toutes les données
      },
      error: (error) => {
        console.error('Erreur assignation:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors de l\'assignation', 'Fermer', { duration: 3000 });
      }
    });
  }

  retirerEnseignant(enseignantId: number): void {
    if (!confirm('Retirer cet enseignant du cours ?')) return;

    this.loading = true;

    this.coursService.retirerEnseignantCours(this.coursId, enseignantId).subscribe({
      next: () => {
        this.snackBar.open('Enseignant retiré', 'Fermer', { duration: 2000 });
        this.loadData(); // ⬅️ Recharger toutes les données
      },
      error: (error) => {
        console.error('Erreur retrait:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du retrait', 'Fermer', { duration: 3000 });
      }
    });
  }

  retour(): void {
    this.router.navigate(['/cours', this.coursId]);
  }
}