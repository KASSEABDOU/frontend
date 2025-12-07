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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { EnseignantService } from '../../../shared/services/enseignant';
import { DaaraService } from '../../../shared/services/daara';
import { Daara } from '../../../core/models/user.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-enseignant-form',
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
    MatSnackBarModule,
    LayoutComponent,
    MatIconModule
  ],
  template: `
    <app-layout>
      <div class="form-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              {{isEditMode ? 'Modifier' : 'Nouvel'}} Enseignant
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="enseignantForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Matricule</mat-label>
                  <input matInput formControlName="matricule" readonly required>
                  <mat-icon matPrefix>fingerprint</mat-icon>
                  <mat-hint>Identifiant unique de l'enseignant</mat-hint>
                  <mat-error>Matricule requis</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" required>
                  <mat-error *ngIf="enseignantForm.get('email')?.hasError('required')">
                    Email requis
                  </mat-error>
                  <mat-error *ngIf="enseignantForm.get('email')?.hasError('email')">
                    Email invalide
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Nom</mat-label>
                  <input matInput formControlName="nom" required>
                  <mat-error>Nom requis</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Prénom</mat-label>
                  <input matInput formControlName="prenom" required>
                  <mat-error>Prénom requis</mat-error>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Sexe</mat-label>
                  <mat-select formControlName="sexe" required>
                    <mat-option value="Masculin">Masculin</mat-option>
                    <mat-option value="Féminin">Féminin</mat-option>
                  </mat-select>
                  <mat-error>Sexe requis</mat-error>
                </mat-form-field>

                <!-- NOUVEAU: Champ diplôme -->
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Diplôme</mat-label>
                  <mat-select formControlName="diplome">
                    <mat-option value="">-- Sélectionner --</mat-option>
                    <mat-option value="Licence">Licence</mat-option>
                    <mat-option value="Master">Master</mat-option>
                    <mat-option value="Doctorat">Doctorat</mat-option>
                    <mat-option value="Certificat">Certificat</mat-option>
                    <mat-option value="IJAZA">IJAZA (Certificat coranique)</mat-option>
                    <mat-option value="Autre">Autre</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <!-- NOUVEAU: Champ origine du diplôme -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Origine du diplôme</mat-label>
                  <input matInput formControlName="diplome_origine" placeholder="Ex: Université Cheikh Anta Diop...">
                </mat-form-field>

                <!-- NOUVEAU: Champ statut -->
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Statut</mat-label>
                  <mat-select formControlName="statut">
                    <mat-option value="">-- Sélectionner --</mat-option>
                    <mat-option value="Permanent">Permanent</mat-option>
                    <mat-option value="Contractuel">Contractuel</mat-option>
                    <mat-option value="Vacataire">Vacataire</mat-option>
                    <mat-option value="Bénévole">Bénévole</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>


              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Spécialité</mat-label>
                  <mat-select formControlName="specialite">
                    <mat-option value="Coran">Coran</mat-option>
                    <mat-option value="Fiqh">Fiqh</mat-option>
                    <mat-option value="Hadith">Hadith</mat-option>
                    <mat-option value="Tafsir">Tafsir</mat-option>
                    <mat-option value="Langue Arabe">Langue Arabe</mat-option>
                    <mat-option value="Sciences Islamiques">Sciences Islamiques</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Grade</mat-label>
                  <mat-select formControlName="grade">
                    <mat-option value="Assistant">Assistant</mat-option>
                    <mat-option value="Enseignant">Enseignant</mat-option>
                    <mat-option value="Enseignant Principal">Enseignant Principal</mat-option>
                    <mat-option value="Cheikh">Cheikh</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Téléphone</mat-label>
                  <input matInput formControlName="telephone" placeholder="+221 77 123 45 67">
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>État civil</mat-label>
                  <mat-select formControlName="etat_civil">
                    <mat-option value="CELIBATAIRE">Célibataire</mat-option>
                    <mat-option value="MARIE">Marié(e)</mat-option>
                    <mat-option value="DIVORCE">Divorcé(e)</mat-option>
                    <mat-option value="VEUF">Veuf(ve)</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Date de naissance</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="date_naissance" required>
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-error>Date requise</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Lieu de naissance</mat-label>
                  <input matInput formControlName="lieu_naissance">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Daara</mat-label>
                  <mat-select formControlName="daara_id">
                    <mat-option *ngFor="let daara of daaras" [value]="daara.id">
                      {{daara.nom}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Adresse</mat-label>
                  <input matInput formControlName="adresse">
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Nationalite</mat-label>
                  <input matInput formControlName="nationalite">
                </mat-form-field>
              </div>

              <div class="form-row" *ngIf="!isEditMode">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Mot de passe</mat-label>
                  <input matInput type="password" formControlName="password" [required]="!isEditMode">
                  <mat-error>Mot de passe requis</mat-error>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancel()">Annuler</button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="enseignantForm.invalid || isSubmitting">
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
      max-width: 900px;
      margin: 20px auto;
      padding: 20px;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
    }

    .form-field {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class EnseignantFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private enseignantService = inject(EnseignantService);
  private daaraService = inject(DaaraService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  enseignantForm: FormGroup;
  daaras: Daara[] = [];
  isEditMode = false;
  isSubmitting = false;
  enseignantId?: number;
  sexeEns = ''

  constructor() {
    this.enseignantForm = this.fb.group({
      matricule: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      date_naissance: ['', Validators.required],
      lieu_naissance: [''],
      specialite: [''],
      grade: [''],
      telephone: [''],
      etat_civil: [''],
      adresse: [''],
      daara_id: [''],
      password: [''],
      sexe:[''],
      diplome:[''],
      diplome_origine:[''],
      statut:[''],
      natitonalite:['']
    });
  }

  generateUniqueMatricule(): string {
    const timestamp = Date.now().toString().slice(-8); // Plus d'unicité
    return `ENS${timestamp}`;
  }

  ngOnInit(): void {
    this.loadDaaras();
    const uniqueMatricule = this.generateUniqueMatricule();
    this.enseignantForm.patchValue({ matricule: uniqueMatricule });
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.enseignantId = +params['id'];
        this.loadEnseignant(this.enseignantId);
        this.enseignantForm.get('mot_de_passe')?.clearValidators();
        this.enseignantForm.get('mot_de_passe')?.updateValueAndValidity();
      } else {
        this.enseignantForm.get('mot_de_passe')?.setValidators([Validators.required]);
      }
    });
  }

  loadDaaras(): void {
    this.daaraService.getAll().subscribe({
      next: (data) => this.daaras = data,
      error: (error) => console.error('Erreur chargement daaras:', error)
    });
  }

  loadEnseignant(id: number): void {
    this.enseignantService.getById(id).subscribe({
      next: (enseignant) => {
        this.enseignantForm.patchValue(enseignant);
      },
      error: (error) => {
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.enseignantForm.valid) {
      this.isSubmitting = true;
    
      // Créer une copie profonde des données du formulaire
      const rawData = this.enseignantForm.value;
      const formData: any = {
        matricule: rawData.matricule,
        nom: rawData.nom,
        prenom: rawData.prenom,
        email: rawData.email,
        password: rawData.password,
        role: 'ENSEIGNANT',
        type: 'enseignant',
        etat_civil: rawData.etat_civil,
        sexe: rawData.sexe,
        nationalite: rawData.nationalite,
        diplome_origine: rawData.diplome_origine,
        diplome: rawData.diplome,
        statut: rawData.statut,
        adresse: rawData.adresse

      };

      // Ajouter les champs optionnels seulement s'ils existent
      if (rawData.date_naissance) {
        formData.date_naissance = this.formatDateStrictly(rawData.date_naissance);
      }
      if (rawData.date_entree) {
        formData.date_entree = this.formatDateStrictly(rawData.date_entree);
      }
      if (rawData.lieu_naissance) formData.lieu_naissance = rawData.lieu_naissance;
      if (rawData.specialite) formData.specialite = rawData.specialite;
      if (rawData.grade) formData.grade = rawData.grade;
      if (rawData.telephone) formData.telephone = rawData.telephone;

      console.log('📤 Données nettoyées envoyées:', formData);

      const request = this.isEditMode && this.enseignantId
        ? this.enseignantService.update(this.enseignantId, formData)
        : this.enseignantService.create(formData);

      request.subscribe({
        next: (response) => {
          console.log('✅ Succès:', response);
          this.snackBar.open(
            this.isEditMode ? 'Enseignant modifié avec succès' : 'Enseignant créé avec succès',
            'Fermer',
            { 
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.router.navigate(['/enseignants']);
        },
        error: (error) => {
          console.error('❌ Erreur détaillée:', {
            status: error.status,
            message: error.message,
            error: error.error
          });
          
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
    } else {
      this.markFormGroupTouched(this.enseignantForm);
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { 
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  // Méthode de formatage de date plus stricte
  private formatDateStrictly(date: any): string {
    if (!date) return '';

    try {
      // Si c'est déjà au format YYYY-MM-DD, le retourner tel quel
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }

      // Convertir en Date object
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        throw new Error('Date invalide');
      }

      // Formater strictement en YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('❌ Erreur formatage date stricte:', e, 'Date originale:', date);
      // En cas d'erreur, essayer de nettoyer la chaîne
      if (typeof date === 'string') {
        const cleanDate = date.split('T')[0].split(' ')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
          return cleanDate;
        }
      }
      return '';
    }
  }

  private handleError(error: any): void {
    let errorMessage = 'Erreur lors de l\'opération';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 400) {
      errorMessage = 'Données invalides envoyées au serveur';
    } else if (error.status === 500) {
      errorMessage = 'Erreur interne du serveur';
    }
    
    this.snackBar.open(errorMessage, 'Fermer', { 
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

    cancel(): void {
      this.router.navigate(['/enseignants']);
    }

  private markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    if (control instanceof FormGroup) {
      this.markFormGroupTouched(control);
    } else {
      control?.markAsTouched();
    }
  });
}
}