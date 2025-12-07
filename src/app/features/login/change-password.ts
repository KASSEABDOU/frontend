// src/app/features/profile/change-password/change-password.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PasswordService } from '../../shared/services/password';
import { AuthService } from '../../core/services/auth';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-change-password',
  imports: [
    CommonModule, // ← AJOUTER pour *ngIf, *ngFor
    ReactiveFormsModule, // ← AJOUTER pour formGroup, formControlName
  ],
  template: `
    <div class="change-password-container">
      <h2>Changer le mot de passe</h2>
      
      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="currentPassword">Mot de passe actuel</label>
          <input 
            type="password" 
            id="currentPassword"
            formControlName="currentPassword"
            placeholder="Entrez votre mot de passe actuel">
          <div *ngIf="passwordForm.get('currentPassword')?.invalid && 
                      passwordForm.get('currentPassword')?.touched"
               class="error">
            Mot de passe actuel requis
          </div>
        </div>

        <div class="form-group">
          <label for="newPassword">Nouveau mot de passe</label>
          <input 
            type="password" 
            id="newPassword"
            formControlName="newPassword"
            placeholder="Entrez le nouveau mot de passe">
          <div *ngIf="passwordForm.get('newPassword')?.invalid && 
                      passwordForm.get('newPassword')?.touched"
               class="error">
            {{ getPasswordErrors() }}
          </div>
          <div *ngIf="passwordStrength.errors.length > 0" class="error-list">
            <ul>
              <li *ngFor="let error of passwordStrength.errors">{{ error }}</li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input 
            type="password" 
            id="confirmPassword"
            formControlName="confirmPassword"
            placeholder="Confirmez le nouveau mot de passe">
          <div *ngIf="passwordForm.get('confirmPassword')?.invalid && 
                      passwordForm.get('confirmPassword')?.touched"
               class="error">
            Les mots de passe ne correspondent pas
          </div>
        </div>

        <button type="submit" [disabled]="passwordForm.invalid || isLoading">
          {{ isLoading ? 'Chargement...' : 'Changer le mot de passe' }}
        </button>

        <div *ngIf="successMessage" class="success">
          {{ successMessage }}
        </div>

        <div *ngIf="errorMessage" class="error">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .change-password-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    
    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .error {
      color: #d32f2f;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .error-list ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    
    .success {
      color: #2e7d32;
      margin-top: 1rem;
      padding: 0.5rem;
      background-color: #e8f5e9;
      border-radius: 4px;
    }
    
    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private passwordService = inject(PasswordService);
  private authService = inject(AuthService);

  passwordForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  passwordStrength = { isValid: true, errors: [] as string[] };

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator 
    });

    // Écouter les changements du nouveau mot de passe
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(value => {
      this.passwordStrength = this.passwordService.checkPasswordStrength(value);
    });
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  getPasswordErrors(): string {
    const control = this.passwordForm.get('newPassword');
    if (control?.hasError('required')) {
      return 'Nouveau mot de passe requis';
    }
    if (control?.hasError('minlength')) {
      return 'Minimum 8 caractères';
    }
    return '';
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = this.passwordForm.value;

    this.passwordService.changePassword(formValue).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Mot de passe changé avec succès!';
        this.passwordForm.reset();
        
        // Optionnel : Déconnecter l'utilisateur après changement de mot de passe
        // setTimeout(() => {
        //   this.authService.removeToken();
        // }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Erreur lors du changement de mot de passe';
      }
    });
  }
}