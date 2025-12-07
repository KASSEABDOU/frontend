// 2. src/app/features/auth/login/login.component.ts
// ============================================
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth';
import { User, LoginRequest, LoginResponse } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <h1>Gestion des Daaras</h1>
            <p>Connexion</p>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email requis
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Email invalide
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" required>
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" 
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Mot de passe requis
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    class="full-width" [disabled]="loginForm.invalid || isLoading">
              {{isLoading ? 'Connexion...' : 'Se connecter'}}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }

    mat-card-title h1 {
      margin: 0;
      color: #667eea;
      text-align: center;
    }

    mat-card-title p {
      margin: 5px 0 0 0;
      color: #666;
      text-align: center;
      font-size: 14px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    button[type="submit"] {
      margin-top: 10px;
      height: 48px;
      font-size: 16px;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  loginData :LoginRequest | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const loginData: LoginRequest = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };
      
      this.authService.login( loginData ).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Message de succès
          this.snackBar.open('✅ Connexion réussie !', 'Fermer', { 
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          
          // Redirection basée sur le rôle
          this.redirectBasedOnRole(response.user?.role);
        },
        error: (error) => {
          this.isLoading = false;
          
          // Message d'erreur adapté
          const errorMessage = this.getErrorMessage(error);
          this.snackBar.open(`❌ ${errorMessage}`, 'Fermer', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          
          // Réinitialiser le mot de passe en cas d'erreur
          this.loginForm.get('password')?.reset();
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  private redirectBasedOnRole(role: string): void {
    console.log("🔍 Rôle reçu pour redirection:", role);
    
    // Définir l'objet avec un index signature
    const routes: { [key: string]: string } = {
      'ADMIN': '/dashboard',
      'ENSEIGNANT': '/dashboard_enseignant',
      'TALIBE': '/dashboard_talibe'
    };
    
    const roleUpper = role?.toUpperCase() || '';
    console.log(roleUpper);
    const targetRoute = routes[roleUpper] || '/dashboard';
    
    console.log('🎯 Route cible:', targetRoute);
    
    this.router.navigate([targetRoute]);
  }

  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Email ou mot de passe incorrect';
    } else if (error.status === 0) {
      return 'Serveur inaccessible. Vérifiez votre connexion internet';
    } else if (error.status === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Une erreur est survenue lors de la connexion';
    }
  }
}