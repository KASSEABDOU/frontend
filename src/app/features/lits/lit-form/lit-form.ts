import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { LitService } from '../../../shared/services/lit';
import { ChambreService } from '../../../shared/services/chambre';
import { BatimentService } from '../../../shared/services/batiment';
import { Chambre, Batiment } from '../../../core/models/user.model';

@Component({
  selector: 'app-lit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="form-container">
        <mat-card class="form-card">
          <mat-card-header>
            <div class="header-content">
              <div class="icon-wrapper">
                <mat-icon>{{isEditMode ? 'edit' : 'add_circle'}}</mat-icon>
              </div>
              <div>
                <mat-card-title>
                  {{isEditMode ? 'Modifier le lit' : 'Ajouter un nouveau lit'}}
                </mat-card-title>
                <mat-card-subtitle>
                  {{isEditMode ? 'Modifiez les informations du lit' : 'Créez un nouveau lit dans une chambre'}}
                </mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="litForm" (ngSubmit)="onSubmit()">
              <div class="form-section">
                <h3>
                  <mat-icon>info</mat-icon>
                  Informations du lit
                </h3>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Numéro du lit</mat-label>
                  <input matInput formControlName="numero" required 
                         placeholder="Ex: 001, A1, Lit-1...">
                  <mat-icon matPrefix>tag</mat-icon>
                  <mat-hint>Identifiant unique du lit dans la chambre</mat-hint>
                  <mat-error *ngIf="litForm.get('numero')?.hasError('required')">
                    Numéro requis
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-section">
                <h3>
                  <mat-icon>location_on</mat-icon>
                  Localisation
                </h3>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Bâtiment</mat-label>
                  <mat-select [(value)]="selectedBatiment" 
                              (selectionChange)="onBatimentChange($event.value)"
                              [disabled]="isEditMode">
                    <mat-option *ngFor="let batiment of batiments" [value]="batiment.id">
                      <mat-icon>apartment</mat-icon>
                      {{batiment.nom}}
                    </mat-option>
                  </mat-select>
                  <mat-icon matPrefix>apartment</mat-icon>
                  <mat-hint>Sélectionnez d'abord le bâtiment</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Chambre</mat-label>
                  <mat-select formControlName="chambre_id" required
                              [disabled]="!chambresFiltered.length || isEditMode">
                    <mat-option *ngFor="let chambre of chambresFiltered" [value]="chambre.id">
                      <mat-icon>meeting_room</mat-icon>
                      Chambre {{chambre.numero}} 
                      <span class="option-hint">({{chambre.nb_lits}} lits)</span>
                    </mat-option>
                  </mat-select>
                  <mat-icon matPrefix>meeting_room</mat-icon>
                  <mat-hint *ngIf="!chambresFiltered.length && selectedBatiment">
                    Aucune chambre dans ce bâtiment
                  </mat-hint>
                  <mat-hint *ngIf="!selectedBatiment">
                    Sélectionnez d'abord un bâtiment
                  </mat-hint>
                  <mat-error>Chambre requise</mat-error>
                </mat-form-field>

                <div class="info-box" *ngIf="selectedChambre">
                  <mat-icon>info_outline</mat-icon>
                  <div>
                    <strong>Information chambre</strong>
                    <p>
                      Chambre {{selectedChambre.numero}} - 
                      Capacité: {{selectedChambre.nb_lits}} lits
                    </p>
                  </div>
                </div>
              </div>

              <div class="preview-section" *ngIf="litForm.get('numero')?.value && selectedChambre">
                <h4>
                  <mat-icon>visibility</mat-icon>
                  Aperçu
                </h4>
                <div class="preview-card">
                  <mat-icon class="preview-icon">king_bed</mat-icon>
                  <div class="preview-content">
                    <h3>Lit {{litForm.get('numero')?.value}}</h3>
                    <p>
                      <mat-icon>meeting_room</mat-icon>
                      Chambre {{selectedChambre.numero}}
                    </p>
                    <p>
                      <mat-icon>apartment</mat-icon>
                      {{getBatimentName(selectedChambre.batiment_id)}}
                    </p>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancel()">
                  <mat-icon>close</mat-icon>
                  Annuler
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="litForm.invalid || isSubmitting">
                  <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
                  <mat-icon *ngIf="!isSubmitting">{{isEditMode ? 'save' : 'add'}}</mat-icon>
                  {{isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Enregistrer' : 'Créer le lit')}}
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
      max-width: 700px;
      margin: 20px auto;
      padding: 20px;
    }

    .form-card {
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
    }

    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-wrapper mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: white;
    }

    mat-card-title {
      font-size: 24px !important;
      margin-bottom: 5px !important;
    }

    .form-section {
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .form-section h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 20px 0;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }

    .form-section h3 mat-icon {
      color: #667eea;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .option-hint {
      color: #999;
      font-size: 12px;
      margin-left: 5px;
    }

    .info-box {
      display: flex;
      gap: 15px;
      padding: 15px;
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      border-radius: 4px;
      margin-top: 15px;
    }

    .info-box mat-icon {
      color: #2196f3;
    }

    .info-box strong {
      display: block;
      margin-bottom: 5px;
      color: #1976d2;
    }

    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #555;
    }

    .preview-section {
      margin: 30px 0;
      padding: 20px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      border-radius: 12px;
    }

    .preview-section h4 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 20px 0;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }

    .preview-section h4 mat-icon {
      color: #667eea;
    }

    .preview-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    }

    .preview-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
    }

    .preview-content h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 20px;
    }

    .preview-content p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }

    .preview-content p mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .preview-card {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class LitFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private litService = inject(LitService);
  private chambreService = inject(ChambreService);
  private batimentService = inject(BatimentService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  litForm: FormGroup;
  batiments: Batiment[] = [];
  chambres: Chambre[] = [];
  chambresFiltered: Chambre[] = [];
  
  selectedBatiment: number | null = null;
  selectedChambre: Chambre | null = null;
  isEditMode = false;
  isSubmitting = false;
  litId?: number;

  constructor() {
    this.litForm = this.fb.group({
      numero: ['', Validators.required],
      chambre_id: ['', Validators.required]
    });

    // Écouter les changements de chambre
    this.litForm.get('chambre_id')?.valueChanges.subscribe(chambreId => {
      this.selectedChambre = this.chambres.find(c => c.id === chambreId) || null;
    });
  }

  ngOnInit(): void {
    this.loadData();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.litId = +params['id'];
        this.loadLit(this.litId);
      }
      
      // Pré-remplir la chambre si on vient de la page chambres
      if (params['chambreId']) {
        const chambreId = +params['chambreId'];
        this.litForm.patchValue({ chambre_id: chambreId });
        
        // Charger le bâtiment correspondant
        this.chambreService.getById(chambreId).subscribe({
          next: (chambre) => {
            this.selectedBatiment = chambre.batiment_id;
            this.filterChambres(chambre.batiment_id);
          }
        });
      }
    });
  }

  loadData(): void {
    this.batimentService.getAll().subscribe({
      next: (data) => this.batiments = data
    });

    this.chambreService.getAll().subscribe({
      next: (data) => this.chambres = data
    });
  }

  loadLit(id: number): void {
    this.litService.getById(id).subscribe({
      next: (lit) => {
        this.litForm.patchValue(lit);
        
        // Charger le bâtiment de la chambre
        const chambre = this.chambres.find(c => c.id === lit.chambre_id);
        if (chambre) {
          this.selectedBatiment = chambre.batiment_id;
          this.filterChambres(chambre.batiment_id);
        }
      },
      error: () => {
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
        this.router.navigate(['/lits']);
      }
    });
  }

  onBatimentChange(batimentId: number): void {
    this.filterChambres(batimentId);
    this.litForm.patchValue({ chambre_id: '' });
    this.selectedChambre = null;
  }

  filterChambres(batimentId: number): void {
    this.batimentService.getChambres(batimentId).subscribe({
      next: (chambres) => {
        this.chambresFiltered = chambres;
      },
      error: () => {
        this.chambresFiltered = [];
      }
    });
  }

  getBatimentName(batimentId: number): string {
    return this.batiments.find(b => b.id === batimentId)?.nom || 'Bâtiment inconnu';
  }

  onSubmit(): void {
    if (this.litForm.valid) {
      this.isSubmitting = true;
      const formData = this.litForm.value;

      const request = this.isEditMode && this.litId
        ? this.litService.update(this.litId, formData)
        : this.litService.create(formData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode ? 'Lit modifié avec succès !' : 'Lit créé avec succès !',
            'Fermer',
            { duration: 3000 }
          );
          this.router.navigate(['/lits']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(
            'Erreur: ' + (error.message || 'Une erreur est survenue'),
            'Fermer',
            { duration: 5000 }
          );
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/lits']);
  }
}