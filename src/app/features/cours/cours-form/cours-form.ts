
// 2. src/app/features/cours/cours-form/cours-form.component.ts
// ============================================
import { Component, OnInit, inject, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { CoursService } from '../../../shared/services/cours';

@Component({
  selector: 'app-cours-form',
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
    MatStepperModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatDividerModule,
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
                <mat-icon>{{isEditMode ? 'edit_note' : 'library_add'}}</mat-icon>
              </div>
              <div>
                <mat-card-title>
                  {{isEditMode ? 'Modifier le cours' : 'Créer un nouveau cours'}}
                </mat-card-title>
                <mat-card-subtitle>
                  {{isEditMode ? 'Mettez à jour les informations du cours' : 'Ajoutez un cours au catalogue'}}
                </mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <mat-stepper [linear]="true" #stepper>
              <!-- Étape 1: Informations de base -->
              <mat-step [stepControl]="baseInfoForm">
                <form [formGroup]="baseInfoForm">
                  <ng-template matStepLabel>Informations de base</ng-template>
                  
                  <div class="step-content">
                    <h3>
                      <mat-icon>info</mat-icon>
                      Identité du cours
                    </h3>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Code du cours</mat-label>
                      <input matInput formControlName="code" required 
                             placeholder="Ex: COR101, HAD201, FIQ301"
                             (input)="generateSuggestion()">
                      <mat-icon matPrefix>tag</mat-icon>
                      <mat-hint>Format: 3 lettres + 3 chiffres (ex: COR101)</mat-hint>
                      <mat-error *ngIf="baseInfoForm.get('code')?.hasError('required')">
                        Code requis
                      </mat-error>
                      <mat-error *ngIf="baseInfoForm.get('code')?.hasError('pattern')">
                        Format invalide (ex: COR101)
                      </mat-error>
                    </mat-form-field>

                    <div class="suggestions" *ngIf="codeSuggestions.length > 0">
                      <span class="label">Suggestions:</span>
                      <mat-chip-set>
                        <mat-chip *ngFor="let suggestion of codeSuggestions" 
                                  (click)="applySuggestion(suggestion)">
                          {{suggestion}}
                        </mat-chip>
                      </mat-chip-set>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Libellé du cours</mat-label>
                      <input matInput formControlName="libelle" required 
                             placeholder="Ex: Mémorisation du Coran - Niveau 1">
                      <mat-icon matPrefix>book</mat-icon>
                      <mat-hint>Nom complet et descriptif du cours</mat-hint>
                      <mat-error>Libellé requis (min. 5 caractères)</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" rows="4"
                                placeholder="Décrivez les objectifs et le contenu du cours..."></textarea>
                      <mat-icon matPrefix>description</mat-icon>
                      <mat-hint>{{baseInfoForm.get('description')?.value?.length || 0}}/500</mat-hint>
                    </mat-form-field>

                    <div class="step-actions">
                      <button mat-button routerLink="/cours">
                        <mat-icon>close</mat-icon>
                        Annuler
                      </button>
                      <button mat-raised-button color="primary" matStepperNext
                              [disabled]="baseInfoForm.invalid">
                        Suivant
                        <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                </form>
              </mat-step>

              <!-- Étape 2: Configuration -->
              <mat-step [stepControl]="configForm">
                <form [formGroup]="configForm">
                  <ng-template matStepLabel>Configuration</ng-template>
                  
                  <div class="step-content">
                    <h3>
                      <mat-icon>settings</mat-icon>
                      Paramètres du cours
                    </h3>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Catégorie</mat-label>
                      <mat-select formControlName="categorie">
                        <mat-option value="Coran">
                          <mat-icon>menu_book</mat-icon>
                          Coran
                        </mat-option>
                        <mat-option value="Hadith">
                          <mat-icon>history_edu</mat-icon>
                          Hadith
                        </mat-option>
                        <mat-option value="Fiqh">
                          <mat-icon>gavel</mat-icon>
                          Fiqh (Jurisprudence)
                        </mat-option>
                        <mat-option value="Tafsir">
                          <mat-icon>auto_stories</mat-icon>
                          Tafsir (Exégèse)
                        </mat-option>
                        <mat-option value="Langue Arabe">
                          <mat-icon>translate</mat-icon>
                          Langue Arabe
                        </mat-option>
                        <mat-option value="Sciences Islamiques">
                          <mat-icon>school</mat-icon>
                          Sciences Islamiques
                        </mat-option>
                        <mat-option value="Autre">
                          <mat-icon>more_horiz</mat-icon>
                          Autre
                        </mat-option>
                      </mat-select>
                      <mat-icon matPrefix>category</mat-icon>
                    </mat-form-field>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Niveau</mat-label>
                        <mat-select formControlName="niveau">
                          <mat-option value="Débutant">Débutant</mat-option>
                          <mat-option value="Intermédiaire">Intermédiaire</mat-option>
                          <mat-option value="Avancé">Avancé</mat-option>
                          <mat-option value="Tous niveaux">Tous niveaux</mat-option>
                        </mat-select>
                        <mat-icon matPrefix>bar_chart</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Durée (heures/semaine)</mat-label>
                        <input matInput type="number" formControlName="duree" min="1" max="40">
                        <mat-icon matPrefix>schedule</mat-icon>
                        <mat-hint>Heures par semaine</mat-hint>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Capacité max</mat-label>
                        <input matInput type="number" formControlName="capacite_max" min="1">
                        <mat-icon matPrefix>groups</mat-icon>
                        <mat-hint>Nombre max de talibés</mat-hint>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Prérequis</mat-label>
                        <mat-select formControlName="prerequis">
                          <mat-option [value]="null">Aucun</mat-option>
                          <mat-option value="Alphabétisation arabe">Alphabétisation arabe</mat-option>
                          <mat-option value="Niveau précédent validé">Niveau précédent validé</mat-option>
                          <mat-option value="Autorisation enseignant">Autorisation enseignant</mat-option>
                        </mat-select>
                        <mat-icon matPrefix>check_circle</mat-icon>
                      </mat-form-field>
                    </div>

                    <div class="toggles-section">
                      <mat-slide-toggle formControlName="is_active" color="primary">
                        <strong>Cours actif</strong>
                        <p>Les talibés peuvent s'inscrire à ce cours</p>
                      </mat-slide-toggle>

                      <mat-slide-toggle formControlName="is_certificat" color="accent">
                        <strong>Délivre un certificat</strong>
                        <p>Un certificat sera délivré en fin de cours</p>
                      </mat-slide-toggle>

                      <mat-slide-toggle formControlName="is_online" color="warn">
                        <strong>Cours en ligne</strong>
                        <p>Le cours peut être suivi à distance</p>
                      </mat-slide-toggle>
                    </div>

                    <div class="step-actions">
                      <button mat-button matStepperPrevious>
                        <mat-icon>arrow_back</mat-icon>
                        Précédent
                      </button>
                      <button mat-raised-button color="primary" matStepperNext>
                        Suivant
                        <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                </form>
              </mat-step>

              <!-- Étape 3: Objectifs et contenu -->
              <mat-step [stepControl]="contentForm">
                <form [formGroup]="contentForm">
                  <ng-template matStepLabel>Contenu</ng-template>
                  
                  <div class="step-content">
                    <h3>
                      <mat-icon>list_alt</mat-icon>
                      Objectifs et programme
                    </h3>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Objectifs pédagogiques</mat-label>
                      <textarea matInput formControlName="objectifs" rows="4"
                                placeholder="Ex: Mémoriser les 5 premières sourates, Maîtriser la récitation avec tajwid..."></textarea>
                      <mat-icon matPrefix>track_changes</mat-icon>
                      <mat-hint>Listez les objectifs principaux du cours</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Programme détaillé</mat-label>
                      <textarea matInput formControlName="programme" rows="6"
                                placeholder="Semaine 1: Introduction...&#10;Semaine 2: ..."></textarea>
                      <mat-icon matPrefix>event_note</mat-icon>
                      <mat-hint>Plan de cours semaine par semaine</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Supports de cours</mat-label>
                      <input matInput formControlName="supports" 
                             placeholder="Ex: Livre, Audio, Vidéos, Fichiers PDF...">
                      <mat-icon matPrefix>folder</mat-icon>
                    </mat-form-field>

                    <div class="step-actions">
                      <button mat-button matStepperPrevious>
                        <mat-icon>arrow_back</mat-icon>
                        Précédent
                      </button>
                      <button mat-raised-button color="primary" matStepperNext>
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
                    Récapitulatif
                  </h3>

                  <div class="summary-card">
                    <div class="summary-header">
                      <div class="cours-preview-icon">
                        <mat-icon>{{getPreviewIcon()}}</mat-icon>
                      </div>
                      <div>
                        <h2>{{baseInfoForm.get('libelle')?.value}}</h2>
                        <mat-chip-set>
                          <mat-chip color="primary" highlighted>
                            {{baseInfoForm.get('code')?.value}}
                          </mat-chip>
                          <mat-chip [color]="getNiveauColor()">
                            {{configForm.get('niveau')?.value}}
                          </mat-chip>
                        </mat-chip-set>
                      </div>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="summary-section">
                      <h4>
                        <mat-icon>settings</mat-icon>
                        Configuration
                      </h4>
                      <div class="summary-grid">
                        <div class="summary-item">
                          <span class="label">Catégorie:</span>
                          <span class="value">{{configForm.get('categorie')?.value || 'Non définie'}}</span>
                        </div>
                        <div class="summary-item">
                          <span class="label">Durée:</span>
                          <span class="value">{{configForm.get('duree')?.value || 0}} h/semaine</span>
                        </div>
                        <div class="summary-item">
                          <span class="label">Capacité:</span>
                          <span class="value">{{configForm.get('capacite_max')?.value || '∞'}} talibés max</span>
                        </div>
                        <div class="summary-item">
                          <span class="label">Prérequis:</span>
                          <span class="value">{{configForm.get('prerequis')?.value || 'Aucun'}}</span>
                        </div>
                      </div>

                      <div class="status-chips">
                        <mat-chip-set>
                          <mat-chip *ngIf="configForm.get('is_active')?.value" color="primary">
                            <mat-icon>check_circle</mat-icon>
                            Actif
                          </mat-chip>
                          <mat-chip *ngIf="configForm.get('is_certificat')?.value" color="accent">
                            <mat-icon>workspace_premium</mat-icon>
                            Certificat
                          </mat-chip>
                          <mat-chip *ngIf="configForm.get('is_online')?.value" color="warn">
                            <mat-icon>wifi</mat-icon>
                            En ligne
                          </mat-chip>
                        </mat-chip-set>
                      </div>
                    </div>

                    <div class="summary-section" *ngIf="baseInfoForm.get('description')?.value">
                      <h4>
                        <mat-icon>description</mat-icon>
                        Description
                      </h4>
                      <p class="description-text">{{baseInfoForm.get('description')?.value}}</p>
                    </div>

                    <div class="summary-section" *ngIf="contentForm.get('objectifs')?.value">
                      <h4>
                        <mat-icon>track_changes</mat-icon>
                        Objectifs
                      </h4>
                      <p class="content-text">{{contentForm.get('objectifs')?.value}}</p>
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
                      <mat-icon *ngIf="!isSubmitting">{{isEditMode ? 'save' : 'add_circle'}}</mat-icon>
                      {{isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Enregistrer' : 'Créer le cours')}}
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
      max-width: 900px;
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

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
    }

    .form-field {
      flex: 1;
    }

    .suggestions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .suggestions .label {
      font-weight: 600;
      color: #666;
      font-size: 13px;
    }

    .suggestions mat-chip {
      cursor: pointer;
    }

    .toggles-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .toggles-section mat-slide-toggle {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .toggles-section mat-slide-toggle strong {
      font-size: 15px;
      color: #333;
      margin-bottom: 4px;
    }

    .toggles-section mat-slide-toggle p {
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .summary-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 30px;
    }

    .summary-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .cours-preview-icon {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cours-preview-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: white;
    }

    .summary-header h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
      color: #333;
    }

    .summary-section {
      margin: 25px 0;
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

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: white;
      border-radius: 8px;
    }

    .summary-item .label {
      color: #666;
      font-weight: 500;
    }

    .summary-item .value {
      color: #333;
      font-weight: 600;
    }

    .status-chips {
      margin-top: 15px;
    }

    .description-text,
    .content-text {
      margin: 0;
      padding: 15px;
      background: white;
      border-radius: 8px;
      color: #555;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CoursFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private coursService = inject(CoursService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private cdRef = inject(ChangeDetectorRef);

  baseInfoForm: FormGroup;
  configForm: FormGroup;
  contentForm: FormGroup;
  
  isEditMode = false;
  isSubmitting = false;
  coursId?: number;
  codeSuggestions: string[] = [];

  constructor() {
    this.baseInfoForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}\d{3}$/)]],
      libelle: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.maxLength(500)]]
    });

    this.configForm = this.fb.group({
      categorie: [''],
      niveau: ['Tous niveaux'],
      duree: [2, [Validators.min(1)]],
      capacite_max: [20, [Validators.min(1)]],
      prerequis: [null],
      is_active: [true],
      is_certificat: [false],
      is_online: [false]
    });

    this.contentForm = this.fb.group({
      objectifs: [''],
      programme: [''],
      supports: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.coursId = +params['id'];
        this.loadCours(this.coursId);
      }
    });
  }

  loadCours(id: number): void {
    this.coursService.getById(id).subscribe({
      next: (cours) => {
        this.baseInfoForm.patchValue(cours);
        this.configForm.patchValue(cours);
        this.contentForm.patchValue(cours);
      },
      error: () => {
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
        this.router.navigate(['/cours']);
      }
    });
  }

  generateSuggestion(): void {
    const code = this.baseInfoForm.get('code')?.value?.toUpperCase() || '';
    
    if (code.length >= 3) {
      const prefix = code.substring(0, 3);
      this.codeSuggestions = [
        `${prefix}101`,
        `${prefix}201`,
        `${prefix}301`
      ];
    } else {
      this.codeSuggestions = [];
    }
    this.cdRef.detectChanges()
  }

  applySuggestion(suggestion: string): void {
    this.baseInfoForm.patchValue({ code: suggestion });
    this.codeSuggestions = [];
    this.cdRef.detectChanges()
  }

  getPreviewIcon(): string {
    const categorie = this.configForm.get('categorie')?.value;
    const iconMap: { [key: string]: string } = {
      'Coran': 'menu_book',
      'Hadith': 'history_edu',
      'Fiqh': 'gavel',
      'Tafsir': 'auto_stories',
      'Langue Arabe': 'translate',
      'Sciences Islamiques': 'school'
    };
    return iconMap[categorie] || 'book';
  }

  getNiveauColor(): string {
    const niveau = this.configForm.get('niveau')?.value;
    const colorMap: { [key: string]: string } = {
      'Débutant': 'primary',
      'Intermédiaire': 'accent',
      'Avancé': 'warn'
    };
    return colorMap[niveau] || '';
  }

  isFormValid(): boolean {
    return this.baseInfoForm.valid && 
           this.configForm.valid && 
           this.contentForm.valid;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;
    
    const formData = {
      ...this.baseInfoForm.value,
      ...this.configForm.value,
      ...this.contentForm.value
    };

    const request = this.isEditMode && this.coursId
      ? this.coursService.update(this.coursId, formData)
      : this.coursService.create(formData);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Cours modifié avec succès !' : 'Cours créé avec succès !',
          'Fermer',
          { duration: 3000 }
        );
        this.router.navigate(['/cours']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open('Erreur: ' + error.message, 'Fermer', { duration: 5000 });
      }
    });
  }
}