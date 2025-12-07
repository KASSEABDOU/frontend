// src/app/core/services/password.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Changer le mot de passe
  changePassword(data: ChangePasswordRequest): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    // Validation côté client
    if (data.newPassword.length < 8) {
      return throwError(() => new Error('Le mot de passe doit contenir au moins 8 caractères'));
    }

    if (data.newPassword !== data.confirmPassword) {
      return throwError(() => new Error('Les mots de passe ne correspondent pas'));
    }

    return this.http.post(`${this.apiUrl}/change-password`, {
      userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    }).pipe(
      catchError(error => {
        console.error('Erreur changement mot de passe:', error);
        return throwError(() => new Error(
          error.error?.message || 'Échec du changement de mot de passe'
        ));
      })
    );
  }

  // Réinitialiser le mot de passe (pour admin)
  resetPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      userId,
      newPassword
    });
  }

  // Vérifier la force du mot de passe
  checkPasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Au moins 8 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Au moins une majuscule');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Au moins un chiffre');
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Au moins un caractère spécial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}