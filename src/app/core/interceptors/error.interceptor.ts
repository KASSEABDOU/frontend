// 8. src/app/core/interceptors/error.interceptor.ts
// ============================================
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }
      
      let errorMessage = 'Une erreur est survenue';
      
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        errorMessage = error.error?.message || `Code d'erreur: ${error.status}`;
      }
      
      console.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};