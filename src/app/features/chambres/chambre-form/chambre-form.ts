// ============================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { ChambreService } from '../../../shared/services/chambre';
import { BatimentService } from '../../../shared/services/batiment';
import { Batiment } from '../../../core/models/user.model';

@Component({
  selector: 'app-chambre-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="form-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              {{isEditMode ? 'Modifier' : 'Nouvelle'}} Chambre
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="chambreForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Numéro de chambre</mat-label>
                <input matInput formControlName="numero" required placeholder="Ex: 101">
                <mat-error>Numéro requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bâtiment</mat-label>
                <mat-select formControlName="batiment_id" required>
                  <mat-option *ngFor="let batiment of batiments" [value]="batiment.id">
                    {{batiment.nom}}
                  </mat-option>
                </mat-select>
                <mat-error>Bâtiment requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre de lits</mat-label>
                <input matInput type="number" formControlName="nb_lits" min="1" required>
                <mat-error *ngIf="chambreForm.get('nb_lits')?.hasError('required')">
                  Nombre de lits requis
                </mat-error>
                <mat-error *ngIf="chambreForm.get('nb_lits')?.hasError('min')">
                  Au moins 1 lit requis
                </mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancel()">Annuler</button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="chambreForm.invalid || isSubmitting">
                  {{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [`
    .form-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class ChambreFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private chambreService = inject(ChambreService);
  private batimentService = inject(BatimentService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  chambreForm: FormGroup;
  batiments: Batiment[] = [];
  isEditMode = false;
  isSubmitting = false;
  chambreId?: number;

  constructor() {
    this.chambreForm = this.fb.group({
      numero: ['', Validators.required],
      batiment_id: ['', Validators.required],
      nb_lits: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadBatiments();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.chambreId = +params['id'];
        this.loadChambre(this.chambreId);
      }
      // Pré-remplir le bâtiment si on vient de la page bâtiments
      if (params['batimentId']) {
        this.chambreForm.patchValue({ batiment_id: +params['batimentId'] });
      }
    });
  }

  loadBatiments(): void {
    this.batimentService.getAll().subscribe({
      next: (data) => this.batiments = data,
      error: (error) => console.error('Erreur chargement bâtiments:', error)
    });
  }

  loadChambre(id: number): void {
    this.chambreService.getById(id).subscribe({
      next: (chambre) => {
        this.chambreForm.patchValue(chambre);
      },
      error: (error) => {
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.chambreForm.valid) {
      this.isSubmitting = true;
      const formData = this.chambreForm.value;

      const request = this.isEditMode && this.chambreId
        ? this.chambreService.update(this.chambreId, formData)
        : this.chambreService.create(formData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode ? 'Chambre modifiée' : 'Chambre créée',
            'Fermer',
            { duration: 3000 }
          );
          this.router.navigate(['/batiments']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open('Erreur: ' + error.message, 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/batiments']);
  }
}