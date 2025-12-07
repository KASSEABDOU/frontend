// ============================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { DaaraService } from '../../../shared/services/daara';

@Component({
  selector: 'app-daara-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
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
              <mat-icon class="header-icon">{{isEditMode ? 'edit' : 'add_business'}}</mat-icon>
              <div>
                <mat-card-title>
                  {{isEditMode ? 'Modifier le daara' : 'Créer un nouveau daara'}}
                </mat-card-title>
                <mat-card-subtitle>
                  {{isEditMode ? 'Mettez à jour les informations du daara' : 'Remplissez les informations du daara'}}
                </mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <mat-stepper [linear]="true" #stepper>
              <!-- Étape 1: Informations générales -->
              <mat-step [stepControl]="informationsForm">
                <form [formGroup]="informationsForm">
                  <ng-template matStepLabel>Informations générales</ng-template>
                  
                  <div class="step-content">
                    <h3>
                      <mat-icon>info</mat-icon>
                      Informations de base
                    </h3>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nom du daara</mat-label>
                      <input matInput formControlName="nom" required 
                             placeholder="Ex: Daara Al-Iman">
                      <mat-icon matPrefix>business</mat-icon>
                      <mat-hint>Nom officiel du daara</mat-hint>
                      <mat-error *ngIf="informationsForm.get('nom')?.hasError('required')">
                        Le nom est requis
                      </mat-error>
                      <mat-error *ngIf="informationsForm.get('nom')?.hasError('minlength')">
                        Minimum 3 caractères
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Propriétaire</mat-label>
                      <input matInput formControlName="proprietaire" 
                             placeholder="Ex: Serigne Abdoulaye Diop">
                      <mat-icon matPrefix>person_outline</mat-icon>
                      <mat-hint>Nom du propriétaire ou responsable</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Lieu</mat-label>
                      <input matInput formControlName="lieu" 
                             placeholder="Ex: Touba, Quartier Darou Khoudoss">
                      <mat-icon matPrefix>location_on</mat-icon>
                      <mat-hint>Ville, quartier et détails de localisation</mat-hint>
                    </mat-form-field>

                    <div class="step-actions">
                      <button mat-button routerLink="/daaras">
                        <mat-icon>close</mat-icon>
                        Annuler
                      </button>
                      <button mat-raised-button color="primary" matStepperNext
                              [disabled]="informationsForm.invalid">
                        Suivant
                        <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                </form>
              </mat-step>

              <!-- Étape 2: Effectifs -->
              <mat-step [stepControl]="effectifsForm">
                <form [formGroup]="effectifsForm">
                  <ng-template matStepLabel>Effectifs</ng-template>
                  
                  <div class="step-content">
                    <h3>
                      <mat-icon>groups</mat-icon>
                      Nombre de personnes
                    </h3>

                    <div class="numbers-grid">
                      <mat-form-field appearance="outline" class="number-field talibes-field">
                        <mat-label>Nombre de talibés</mat-label>
                        <input matInput type="number" formControlName="nombre_talibes" 
                               min="0" placeholder="0">
                        <mat-icon matPrefix>school</mat-icon>
                        <mat-error *ngIf="effectifsForm.get('nombre_talibes')?.hasError('min')">
                          Le nombre doit être positif
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="number-field enseignants-field">
                        <mat-label>Nombre d'enseignants</mat-label>
                        <input matInput type="number" formControlName="nombre_enseignants" 
                               min="0" placeholder="0">
                        <mat-icon matPrefix>person</mat-icon>
                        <mat-error *ngIf="effectifsForm.get('nombre_enseignants')?.hasError('min')">
                          Le nombre doit être positif
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="ratio-info" *ngIf="getRatioTalibesEnseignants() > 0">
                      <mat-icon>calculate</mat-icon>
                      <div>
                        <strong>Ratio Talibés/Enseignant:</strong>
                        <span [class.ratio-warning]="getRatioTalibesEnseignants() > 15">
                          {{getRatioTalibesEnseignants()}} : 1
                        </span>
                        <p class="ratio-hint" *ngIf="getRatioTalibesEnseignants() > 15">
                          ⚠️ Le ratio est élevé. Il est recommandé d'avoir moins de 15 talibés par enseignant.
                        </p>
                      </div>
                    </div>

                    <div class="step-actions">
                      <button mat-button matStepperPrevious>
                        <mat-icon>arrow_back</mat-icon>
                        Précédent
                      </button>
                      <button mat-raised-button color="primary" matStepperNext
                              [disabled]="effectifsForm.invalid">
                        Suivant
                        <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                </form>
              </mat-step>

              <!-- Étape 3: Infrastructure -->
              <mat-step [stepControl]="infrastructureForm">
                <form [formGroup]="infrastructureForm">
                  <ng-template matStepLabel>Infrastructure</ng-template>
                  
                  <div class="step-content">
                    <h3>
                      <mat-icon>apartment</mat-icon>
                      Bâtiments et installations
                    </h3>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nombre de bâtiments</mat-label>
                      <input matInput type="number" formControlName="nombre_batiments" 
                             min="0" placeholder="0">
                      <mat-icon matPrefix>apartment</mat-icon>
                      <mat-hint>Nombre total de bâtiments dans le daara</mat-hint>
                      <mat-error *ngIf="infrastructureForm.get('nombre_batiments')?.hasError('min')">
                        Le nombre doit être positif
                      </mat-error>
                    </mat-form-field>

                    <div class="info-box">
                      <mat-icon>info_outline</mat-icon>
                      <div>
                        <strong>Information:</strong>
                        <p>Vous pourrez ajouter les détails des bâtiments (chambres, lits) après la création du daara dans la section "Bâtiments".</p>
                      </div>
                    </div>

                    <div class="step-actions">
                      <button mat-button matStepperPrevious>
                        <mat-icon>arrow_back</mat-icon>
                        Précédent
                      </button>
                      <button mat-raised-button color="primary" matStepperNext
                              [disabled]="infrastructureForm.invalid">
                        Suivant
                        <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                </form>
              </mat-step>

              <!-- Étape 4: Confirmation -->
              <mat-step>
                <ng-template matStepLabel>Confirmation</ng-template>
                
                <div class="step-content">
                  <h3>
                    <mat-icon>check_circle</mat-icon>
                    Vérifiez les informations
                  </h3>

                  <div class="summary-card">
                    <div class="summary-section">
                      <h4>
                        <mat-icon>info</mat-icon>
                        Informations générales
                      </h4>
                      <div class="summary-item">
                        <span class="label">Nom:</span>
                        <span class="value">{{informationsForm.get('nom')?.value}}</span>
                      </div>
                      <div class="summary-item" *ngIf="informationsForm.get('proprietaire')?.value">
                        <span class="label">Propriétaire:</span>
                        <span class="value">{{informationsForm.get('proprietaire')?.value}}</span>
                      </div>
                      <div class="summary-item" *ngIf="informationsForm.get('lieu')?.value">
                        <span class="label">Lieu:</span>
                        <span class="value">{{informationsForm.get('lieu')?.value}}</span>
                      </div>
                    </div>

                    <div class="summary-section">
                      <h4>
                        <mat-icon>groups</mat-icon>
                        Effectifs
                      </h4>
                      <div class="summary-item">
                        <span class="label">Talibés:</span>
                        <span class="value">{{effectifsForm.get('nombre_talibes')?.value}}</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Enseignants:</span>
                        <span class="value">{{effectifsForm.get('nombre_enseignants')?.value}}</span>
                      </div>
                    </div>

                    <div class="summary-section">
                      <h4>
                        <mat-icon>apartment</mat-icon>
                        Infrastructure
                      </h4>
                      <div class="summary-item">
                        <span class="label">Bâtiments:</span>
                        <span class="value">{{infrastructureForm.get('nombre_batiments')?.value}}</span>
                      </div>
                    </div>
                  </div>

                  <div class="step-actions final-actions">
                    <button mat-button matStepperPrevious [disabled]="isSubmitting">
                      <mat-icon>arrow_back</mat-icon>
                      Précédent
                    </button>
                    <button mat-raised-button color="primary" (click)="onSubmit()"
                            [disabled]="isSubmitting || !isFormValid()">
                      <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
                      <mat-icon *ngIf="!isSubmitting">{{isEditMode ? 'save' : 'add'}}</mat-icon>
                      {{isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Enregistrer' : 'Créer le daara')}}
                    </button>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </mat-card-content>
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
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

    .header-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
    }

    mat-card-title {
      font-size: 24px !important;
      margin-bottom: 5px !important;
    }

    mat-card-subtitle {
      font-size: 14px !important;
    }

    .step-content {
      padding: 30px 20px;
    }

    .step-content h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 25px 0;
      color: #333;
      font-size: 18px;
    }

    .step-content h3 mat-icon {
      color: #667eea;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .numbers-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .number-field input {
      font-size: 18px;
      font-weight: 600;
    }

    .talibes-field {
      --mdc-outlined-text-field-focus-outline-color: #f093fb;
    }

    .enseignants-field {
      --mdc-outlined-text-field-focus-outline-color: #4facfe;
    }

    .ratio-info {
      display: flex;
      gap: 15px;
      padding: 15px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .ratio-info mat-icon {
      color: #667eea;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .ratio-info strong {
      display: block;
      margin-bottom: 5px;
      color: #333;
    }

    .ratio-info span {
      font-size: 20px;
      font-weight: 700;
      color: #4facfe;
    }

    .ratio-info span.ratio-warning {
      color: #f5576c;
    }

    .ratio-hint {
      margin: 10px 0 0 0;
      font-size: 13px;
      color: #f5576c;
    }

    .info-box {
      display: flex;
      gap: 15px;
      padding: 15px;
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      border-radius: 4px;
      margin-bottom: 20px;
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

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .final-actions {
      justify-content: space-between;
    }

    .summary-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .summary-section {
      margin-bottom: 25px;
    }

    .summary-section:last-child {
      margin-bottom: 0;
    }

    .summary-section h4 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 15px 0;
      color: #667eea;
      font-size: 16px;
      font-weight: 600;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item .label {
      color: #666;
      font-weight: 500;
    }

    .summary-item .value {
      color: #333;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .numbers-grid {
        grid-template-columns: 1fr;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class DaaraFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private daaraService = inject(DaaraService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  informationsForm: FormGroup;
  effectifsForm: FormGroup;
  infrastructureForm: FormGroup;
  
  isEditMode = false;
  isSubmitting = false;
  daaraId?: number;

  constructor() {
    this.informationsForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      proprietaire: [''],
      lieu: ['']
    });

    this.effectifsForm = this.fb.group({
      nombre_talibes: [0, [Validators.min(0)]],
      nombre_enseignants: [0, [Validators.min(0)]]
    });

    this.infrastructureForm = this.fb.group({
      nombre_batiments: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.daaraId = +params['id'];
        this.loadDaara(this.daaraId);
      }
    });
  }

  loadDaara(id: number): void {
    this.daaraService.getById(id).subscribe({
      next: (daara) => {
        this.informationsForm.patchValue({
          nom: daara.nom,
          proprietaire: daara.proprietaire,
          lieu: daara.lieu
        });
        this.effectifsForm.patchValue({
          nombre_talibes: daara.nombre_talibes,
          nombre_enseignants: daara.nombre_enseignants
        });
        this.infrastructureForm.patchValue({
          nombre_batiments: daara.nombre_batiments
        });
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.router.navigate(['/daaras']);
      }
    });
  }

  getRatioTalibesEnseignants(): number {
    const talibes = this.effectifsForm.get('nombre_talibes')?.value || 0;
    const enseignants = this.effectifsForm.get('nombre_enseignants')?.value || 0;
    if (enseignants === 0) return 0;
    return Math.round(talibes / enseignants);
  }

  isFormValid(): boolean {
    return this.informationsForm.valid && 
           this.effectifsForm.valid && 
           this.infrastructureForm.valid;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;
    
    const formData = {
      ...this.informationsForm.value,
      ...this.effectifsForm.value,
      ...this.infrastructureForm.value
    };

    const request = this.isEditMode && this.daaraId
      ? this.daaraService.update(this.daaraId, formData)
      : this.daaraService.create(formData);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Daara modifié avec succès !' : 'Daara créé avec succès !',
          'Fermer',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.router.navigate(['/daaras']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open(
          'Erreur: ' + (error.message || 'Une erreur est survenue'),
          'Fermer',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }
}