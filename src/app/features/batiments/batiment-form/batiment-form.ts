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
import { BatimentService } from '../../../shared/services/batiment';
import { DaaraService } from '../../../shared/services/daara';
import { Daara } from '../../../core/models/user.model';

@Component({
  selector: 'app-batiment-form',
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
              {{isEditMode ? 'Modifier' : 'Nouveau'}} Bâtiment
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="batimentForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom du bâtiment</mat-label>
                <input matInput formControlName="nom" required placeholder="Ex: Bâtiment A">
                <mat-error>Nom requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Daara</mat-label>
                <mat-select formControlName="daara_id" required>
                  <mat-option *ngFor="let daara of daaras" [value]="daara.id">
                    {{daara.nom}}
                  </mat-option>
                </mat-select>
                <mat-error>Daara requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre de chambres</mat-label>
                <input matInput type="number" formControlName="nombre_chambres" min="0" required>
                <mat-error *ngIf="batimentForm.get('nombre_chambres')?.hasError('required')">
                  Nombre de chambres requis
                </mat-error>
                <mat-error *ngIf="batimentForm.get('nombre_chambres')?.hasError('min')">
                  Le nombre doit être positif
                </mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancel()">Annuler</button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="batimentForm.invalid || isSubmitting">
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
export class BatimentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private batimentService = inject(BatimentService);
  private daaraService = inject(DaaraService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  batimentForm: FormGroup;
  daaras: Daara[] = [];
  isEditMode = false;
  isSubmitting = false;
  batimentId?: number;

  constructor() {
    this.batimentForm = this.fb.group({
      nom: ['', Validators.required],
      daara_id: ['', Validators.required],
      nombre_chambres: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadDaaras();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.batimentId = +params['id'];
        this.loadBatiment(this.batimentId);
      }
    });
  }

  loadDaaras(): void {
    this.daaraService.getAll().subscribe({
      next: (data) => this.daaras = data,
      error: (error) => console.error('Erreur chargement daaras:', error)
    });
  }

  loadBatiment(id: number): void {
    this.batimentService.getById(id).subscribe({
      next: (batiment) => {
        this.batimentForm.patchValue(batiment);
      },
      error: (error) => {
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.batimentForm.valid) {
      this.isSubmitting = true;
      const formData = this.batimentForm.value;

      const request = this.isEditMode && this.batimentId
        ? this.batimentService.update(this.batimentId, formData)
        : this.batimentService.create(formData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode ? 'Bâtiment modifié' : 'Bâtiment créé',
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