import { Component, OnInit, inject,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { TalibeService } from '../../../shared/services/talibe';
import { DaaraService } from '../../../shared/services/daara';
import { ChambreService } from '../../../shared/services/chambre';
import { CoursService } from '../../../shared/services/cours';
import { Daara, Chambre, Cours } from '../../../core/models/user.model';
import { PhotoUploadComponent } from '../../uploade/uploade';

@Component({
  selector: 'app-talibe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    MatStepperModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    LayoutComponent,
    PhotoUploadComponent
  ],
  template: `
    <app-layout>
      <div class="form-container">
        <mat-card class="form-card">
          <mat-card-header>
            <div class="header-content">
              <div class="header-avatar">
                <img [src]="photoUrl || 'assets/default-avatar.png'" 
                    [alt]="getAltText()" 
                    class="header-avatar-img"
                    *ngIf="photoUrl">
                <div class="avatar-placeholder" *ngIf="!photoUrl">
                  <mat-icon>person</mat-icon>
                </div>
              </div>
              <div>
                <mat-card-title>
                  {{isEditMode ? 'Modifier le talibé' : 'Nouveau talibé'}}
                </mat-card-title>
                <mat-card-subtitle>
                  {{isEditMode ? 'Mettez à jour les informations' : 'Inscription d\\'un nouveau talibé'}}
                </mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <mat-stepper [linear]="true" #stepper>
              <!-- Étape 1: Photo et Identité -->
              <mat-step [stepControl]="identiteForm">
                <form [formGroup]="identiteForm">
                  <ng-template matStepLabel>Photo & Identité</ng-template>
                  
                  <div class="step-content">
                    <!-- Section Photo -->
                    <div class="photo-section">
                      <h3>
                        <mat-icon>photo_camera</mat-icon>
                        Photo de profil
                      </h3>
                      <div class="photo-instruction">
                        <p>Ajoutez une photo claire du talibé pour faciliter son identification</p>
                      </div>
                      <app-photo-upload
                        [currentPhotoUrl]="photoUrl"
                        [type]="'talibe'"
                        [altText]="getAltText()"
                        (photoChanged)="onPhotoChanged($event)"
                        (photoRemoved)="onPhotoRemoved()">
                      </app-photo-upload>
                    </div>

                    <mat-divider></mat-divider>

                    <!-- Section Informations d'identité -->
                    <div class="identity-section">
                      <h3>
                        <mat-icon>badge</mat-icon>
                        Informations d'identité
                      </h3>

                      <div class="form-row">
                        <mat-form-field appearance="outline" class="form-field">
                          <mat-label>Matricule</mat-label>
                          <input matInput formControlName="matricule" required 
                                 placeholder="Ex: TAL2024001" readonly>
                          <mat-icon matPrefix>fingerprint</mat-icon>
                          <mat-hint>Identifiant unique du talibé</mat-hint>
                          <mat-error>Matricule requis</mat-error>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="form-field">
                          <mat-label>Email</mat-label>
                          <input matInput type="email" formControlName="email" required>
                          <mat-icon matPrefix>email</mat-icon>
                          <mat-error *ngIf="identiteForm.get('email')?.hasError('required')">
                            Email requis
                          </mat-error>
                          <mat-error *ngIf="identiteForm.get('email')?.hasError('email')">
                            Email invalide
                          </mat-error>
                        </mat-form-field>
                      </div>

                      <div class="form-row">
                        <mat-form-field appearance="outline" class="form-field">
                          <mat-label>Nom</mat-label>
                          <input matInput formControlName="nom" required>
                          <mat-icon matPrefix>person</mat-icon>
                          <mat-error>Nom requis</mat-error>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="form-field">
                          <mat-label>Prénom</mat-label>
                          <input matInput formControlName="prenom" required>
                          <mat-icon matPrefix>person_outline</mat-icon>
                          <mat-error>Prénom requis</mat-error>
                        </mat-form-field>
                      </div>

                      <!-- 🔥 NOUVEAU : Sexe et Nationalité -->
                      <div class="form-row">
                        <mat-form-field appearance="outline" class="form-field">
                          <mat-label>Sexe</mat-label>
                          <mat-select formControlName="sexe" required>
                            <mat-option value="M">Masculin</mat-option>
                            <mat-option value="F">Féminin</mat-option>
                          </mat-select>
                          <mat-icon matPrefix>wc</mat-icon>
                          <mat-error>Sexe requis</mat-error>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="form-field">
                          <mat-label>Nationalité</mat-label>
                          <input matInput formControlName="nationalite" required 
                                placeholder="Ex: Sénégalaise">
                          <mat-icon matPrefix>flag</mat-icon>
                          <mat-error>Nationalité requise</mat-error>
                        </mat-form-field>
                      </div>

                      <div class="form-row">
                        <mat-form-field appearance="outline" class="form-field">
                          <mat-label>Date de naissance</mat-label>
                          <input matInput [matDatepicker]="picker" formControlName="date_naissance" required>
                          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                          <mat-datepicker #picker></mat-datepicker>
                          <mat-icon matPrefix>cake</mat-icon>
                          <mat-error>Date requise</mat-error>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="form-field">
                          <mat-label>Lieu de naissance</mat-label>
                          <input matInput formControlName="lieu_naissance" placeholder="Ex: Dakar">
                          <mat-icon matPrefix>location_city</mat-icon>
                        </mat-form-field>
                      </div>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Adresse</mat-label>
                        <textarea matInput formControlName="adresse" rows="2" 
                                  placeholder="Adresse complète"></textarea>
                        <mat-icon matPrefix>home</mat-icon>
                      </mat-form-field>

                      <div class="checkbox-section">
                        <mat-checkbox formControlName="extrait_naissance">
                          <strong>Extrait de naissance disponible</strong>
                        </mat-checkbox>
                      </div>
                    </div>

                    <div class="step-actions">
                      <button mat-button routerLink="/talibes">
                        <mat-icon>close</mat-icon>
                        Annuler
                      </button>
                      <button mat-raised-button color="primary" matStepperNext
                              [disabled]="identiteForm.invalid">
                        Suivant
                        <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                </form>
              </mat-step>

              <!-- Étape 2: Parents -->
              <mat-step [stepControl]="parentsForm">
                <form [formGroup]="parentsForm">
                  <ng-template matStepLabel>Parents</ng-template>
                  
                  <div class="step-content">
                    <h3>
                      <mat-icon>family_restroom</mat-icon>
                      Informations parentales
                    </h3>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nom complet du père</mat-label>
                      <input matInput formControlName="pere" placeholder="Ex: Abdoulaye Diop">
                      <mat-icon matPrefix>person</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nom complet de la mère</mat-label>
                      <input matInput formControlName="mere" placeholder="Ex: Fatou Sall">
                      <mat-icon matPrefix>person</mat-icon>
                    </mat-form-field>

                    <div class="info-box">
                      <mat-icon>info_outline</mat-icon>
                      <p>Les informations parentales sont importantes pour le contact d'urgence</p>
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

              <!-- Étape 3: Scolarité -->
              <mat-step [stepControl]="scolariteForm">
                <form [formGroup]="scolariteForm">
                  <ng-template matStepLabel>Scolarité</ng-template>
                  
                  <div class="step-content">
                    <h3>
                      <mat-icon>school</mat-icon>
                      Informations académiques
                    </h3>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Niveau</mat-label>
                        <mat-select formControlName="niveau">
                          <mat-option value="Débutant">Débutant</mat-option>
                          <mat-option value="Intermédiaire">Intermédiaire</mat-option>
                          <mat-option value="Avancé">Avancé</mat-option>
                          <mat-option value="Expert">Expert</mat-option>
                        </mat-select>
                        <mat-icon matPrefix>school</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="form-field">
                        <mat-label>Daara</mat-label>
                        <mat-select formControlName="daara_id" (selectionChange)="onDaaraChange($event.value)">
                          <mat-option *ngFor="let daara of daaras" [value]="daara.id">
                            {{daara.nom}}
                          </mat-option>
                        </mat-select>
                        <mat-icon matPrefix>business</mat-icon>
                      </mat-form-field>
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

              <!-- Étape 4: Sécurité (si création) -->
              <mat-step *ngIf="!isEditMode" [stepControl]="securityForm">
                <form [formGroup]="securityForm">
                  <ng-template matStepLabel>Sécurité</ng-template>
                  
                  <div class="step-content">
                    <h3>
                      <mat-icon>security</mat-icon>
                      Mot de passe
                    </h3>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Mot de passe</mat-label>
                      <input matInput [type]="hidePassword ? 'password' : 'text'" 
                             formControlName="password" required>
                      <mat-icon matPrefix>lock</mat-icon>
                      <button mat-icon-button matSuffix type="button" 
                              (click)="hidePassword = !hidePassword">
                        <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                      </button>
                      <mat-hint>Minimum 6 caractères</mat-hint>
                      <mat-error>Mot de passe requis (min. 6 caractères)</mat-error>
                    </mat-form-field>

                    <div class="info-box security">
                      <mat-icon>info</mat-icon>
                      <div>
                        <strong>Information importante</strong>
                        <p>Ce mot de passe permettra au talibé de se connecter à son espace personnel.</p>
                      </div>
                    </div>

                    <div class="step-actions">
                      <button mat-button matStepperPrevious>
                        <mat-icon>arrow_back</mat-icon>
                        Précédent
                      </button>
                      <button mat-raised-button color="primary" matStepperNext
                              [disabled]="securityForm.invalid">
                        Suivant
                        <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                </form>
              </mat-step>

              <!-- Étape finale: Confirmation -->
              <mat-step>
                <ng-template matStepLabel>Confirmation</ng-template>
                
                <div class="step-content">
                  <h3>
                    <mat-icon>check_circle</mat-icon>
                    Vérification des informations
                  </h3>

                  <div class="summary-card">
                    <!-- Ajouter la photo dans le résumé -->
                    <div class="summary-photo" *ngIf="photoUrl">
                      <img [src]="photoUrl" [alt]="getAltText()">
                      <p>Photo ajoutée</p>
                    </div>

                    <div class="summary-section">
                      <h4>
                        <mat-icon>badge</mat-icon>
                        Identité
                      </h4>
                      <div class="summary-grid">
                        <div class="summary-item">
                          <span class="label">Matricule:</span>
                          <span class="value">{{identiteForm.get('matricule')?.value}}</span>
                        </div>
                        <div class="summary-item">
                          <span class="label">Nom complet:</span>
                          <span class="value">{{identiteForm.get('nom')?.value}} {{identiteForm.get('prenom')?.value}}</span>
                        </div>
                        <div class="summary-item">
                          <span class="label">Email:</span>
                          <span class="value">{{identiteForm.get('email')?.value}}</span>
                        </div>
                        <div class="summary-item">
                          <span class="label">Naissance:</span>
                          <span class="value">
                            {{formatDateForDisplay(identiteForm.get('date_naissance')?.value)}}
                            à {{identiteForm.get('lieu_naissance')?.value || 'Non spécifié'}}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="summary-section" *ngIf="parentsForm.get('pere')?.value || parentsForm.get('mere')?.value">
                      <h4>
                        <mat-icon>family_restroom</mat-icon>
                        Parents
                      </h4>
                      <div class="summary-grid">
                        <div class="summary-item" *ngIf="parentsForm.get('pere')?.value">
                          <span class="label">Père:</span>
                          <span class="value">{{parentsForm.get('pere')?.value}}</span>
                        </div>
                        <div class="summary-item" *ngIf="parentsForm.get('mere')?.value">
                          <span class="label">Mère:</span>
                          <span class="value">{{parentsForm.get('mere')?.value}}</span>
                        </div>
                      </div>
                    </div>

                    <div class="summary-section">
                      <h4>
                        <mat-icon>school</mat-icon>
                        Scolarité
                      </h4>
                      <div class="summary-grid">
                        <div class="summary-item" *ngIf="scolariteForm.get('niveau')?.value">
                          <span class="label">Niveau:</span>
                          <span class="value">{{scolariteForm.get('niveau')?.value}}</span>
                        </div>
                        <div class="summary-item" *ngIf="scolariteForm.get('daara_id')?.value">
                          <span class="label">Daara:</span>
                          <span class="value">{{getDaaraName(scolariteForm.get('daara_id')?.value)}}</span>
                        </div>
                        <div class="summary-item" *ngIf="selectedCours.length > 0">
                          <span class="label">Cours:</span>
                          <span class="value">{{selectedCours.length}} cours sélectionné(s)</span>
                        </div>
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
                      <mat-icon *ngIf="!isSubmitting">{{isEditMode ? 'save' : 'person_add'}}</mat-icon>
                      {{isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Enregistrer' : 'Créer le talibé')}}
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

    .header-photo {
      transform: scale(0.8);
    }

    .header-photo ::ng-deep .photo-preview {
      width: 80px;
      height: 80px;
    }

    .step-content {
      padding: 30px 20px;
    }

    .photo-section {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .photo-instruction {
      margin-bottom: 20px;
    }

    .photo-instruction p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .identity-section {
      margin-top: 30px;
    }

    .summary-photo {
      text-align: center;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .summary-photo img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #667eea;
    }

    .summary-photo p {
      margin: 8px 0 0 0;
      color: #666;
      font-size: 12px;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
    }

    .form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .checkbox-section {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .info-box {
      display: flex;
      gap: 15px;
      padding: 15px;
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      border-radius: 4px;
      margin: 20px 0;
    }

    .info-box mat-icon {
      color: #2196f3;
    }
    .header-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #e0e0e0;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .header-avatar.has-photo {
      border-color: #667eea;
    }

    .header-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .header-avatar mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #999;
    }

    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #555;
    }

    .info-box.security {
      background: #fff3e0;
      border-left-color: #ff9800;
    }

    .info-box.security mat-icon {
      color: #ff9800;
    }

    .cours-section {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
    }

    .section-label mat-icon {
      color: #667eea;
    }

    mat-chip-set {
      margin-bottom: 15px;
    }

    mat-chip {
      margin: 4px;
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

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: white;
      border-radius: 6px;
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
      .form-row {
        flex-direction: column;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-photo {
        align-self: center;
      }
    }
  `]
})
export class TalibeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private talibeService = inject(TalibeService);
  private daaraService = inject(DaaraService);
  private chambreService = inject(ChambreService);
  private coursService = inject(CoursService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private cdRef = inject( ChangeDetectorRef )

  identiteForm: FormGroup;
  parentsForm: FormGroup;
  scolariteForm: FormGroup;
  securityForm: FormGroup;

  daaras: Daara[] = [];
  chambres: Chambre[] = [];
  chambresFiltered: Chambre[] = [];
  allCours: Cours[] = [];
  selectedCours: Cours[] = [];
  
  isEditMode = false;
  isSubmitting = false;
  talibeId?: number;
  hidePassword = true;

  // Propriété pour la photo
  photoUrl: string | null = null;

  constructor() {
    this.identiteForm = this.fb.group({
      matricule: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      date_naissance: ['', Validators.required],
      lieu_naissance: [''],
      sexe:[''],
      adresse: [''],
      nationalite:[''],
      extrait_naissance: [false]
    });

    this.parentsForm = this.fb.group({
      pere: [''],
      mere: ['']
    });

    this.scolariteForm = this.fb.group({
      niveau: [''],
      daara_id: [''],
      chambre_id: ['']
    });

    this.securityForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  generateUniqueMatricule(): string {
    const timestamp = Date.now().toString().slice(-8); // Plus d'unicité
    return `TAL${timestamp}`;
  }


  ngOnInit(): void {
    const uniqueMatricule = this.generateUniqueMatricule();
    this.identiteForm.patchValue({ matricule: uniqueMatricule });
    console.log('🆕 Matricule généré:', uniqueMatricule);
    this.loadData();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.talibeId = +params['id'];
        this.loadTalibe(this.talibeId);
        this.cdRef.detectChanges(); 
      }
    });
  }

  loadData(): void {
    this.daaraService.getAll().subscribe({
      next: (data) => {
        this.daaras = data,
        this.cdRef.detectChanges(); 
      }
    });

    this.chambreService.getAll().subscribe({
      next: (data) => {
        this.chambres = data,
        this.cdRef.detectChanges(); 
      }
    });

    this.coursService.getAll().subscribe({
      next: (data) =>{
         this.allCours = data,
         this.cdRef.detectChanges(); 
       }
    });
  }

  loadTalibe(id: number): void {
    this.talibeService.getById(id).subscribe({
      next: (talibe) => {
        this.identiteForm.patchValue(talibe);
        this.parentsForm.patchValue(talibe);
        this.scolariteForm.patchValue(talibe);
        
        // Charger la photo existante
        if (talibe.photo_url) {
          this.photoUrl = talibe.photo_url;
        }
        
        if (talibe.cours) {
          this.selectedCours = talibe.cours;
        }
        
        if (talibe.daara_id) {
          this.filterChambres(talibe.daara_id);
        }
      }
    });
  }

  // Méthodes pour gérer les événements de photo
  onPhotoChanged(photoUrl: string): void {
    this.photoUrl = photoUrl;
  }

  onPhotoRemoved(): void {
    this.photoUrl = null;
  }

  getAltText(): string {
    const nom = this.identiteForm.get('nom')?.value || '';
    const prenom = this.identiteForm.get('prenom')?.value || '';
    return `${prenom} ${nom}`.trim() || 'Photo du talibé';
  }

  onDaaraChange(daaraId: number): void {
    this.filterChambres(daaraId);
    this.scolariteForm.patchValue({ chambre_id: '' });
  }

  filterChambres(daaraId: number): void {
    this.chambresFiltered = this.chambres;
  }

  get availableCours(): Cours[] {
    return this.allCours.filter(
      cours => !this.selectedCours.find(sc => sc.id === cours.id)
    );
  }

  addCours(cours: Cours): void {
    if (cours && !this.selectedCours.find(c => c.id === cours.id)) {
      this.selectedCours.push(cours);
    }
  }

  removeCours(cours: Cours): void {
    this.selectedCours = this.selectedCours.filter(c => c.id !== cours.id);
  }

  getDaaraName(daaraId: number): string {
    return this.daaras.find(d => d.id === daaraId)?.nom || '';
  }

  isFormValid(): boolean {
    const baseValid = this.identiteForm.valid &&
                      this.parentsForm.valid &&
                      this.scolariteForm.valid;
    
    if (!this.isEditMode) {
      return baseValid && this.securityForm.valid;
    }
    return baseValid;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;
    const photoFileName = this.photoUrl ? this.extractFileName(this.photoUrl) : null;
    const uniqueMatricule = this.generateUniqueMatricule();
    this.identiteForm.patchValue({ matricule: uniqueMatricule });
    
    const formData = {
      ...this.identiteForm.value,
      ...this.parentsForm.value,
      ...this.scolariteForm.value,
      photo_profil: photoFileName,
      role: 'TALIBE',
      date_naissance: this.formatDateForBackend(this.identiteForm.value.date_naissance),
      // Inclure la photo dans les données
      //photo_url: this.photoUrl
    };

    if (!this.isEditMode) {
      Object.assign(formData, this.securityForm.value);
    }

    const request = this.isEditMode && this.talibeId
      ? this.talibeService.update(this.talibeId, formData)
      : this.talibeService.create(formData);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Talibé modifié !' : 'Talibé créé avec succès !',
          'Fermer',
          { duration: 3000 }
        );
        this.router.navigate(['/talibes']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open('Erreur: ' + error.message, 'Fermer', { duration: 5000 });
      }
    });
  }

  private extractFileName(url: string | null): string | null {
    if (!url) return null;
    
    // Si URL = "http://localhost:5000/api/uploads/1764314392_me.jpg"
    // Retourne "1764314392_me.jpg"
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  }

  formatDateForBackend(date: string | Date): string {
    if (!date) return '';
    
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    
    return `${year}-${month}-${day}`;
  }

  // Méthode pour formater la date pour l'affichage
  formatDateForDisplay(date: string | Date): string {
    if (!date) return 'Non spécifié';
    
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? 'Date invalide' : d.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  }
}