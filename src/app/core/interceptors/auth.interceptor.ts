import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { environment } from '../../../environments/environment';

// Utilisez une fonction, pas une classe
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🚨 INTERCEPTEUR FONCTION APPELE !!!');
  
  const authService = inject(AuthService);
  const token = authService.getToken();
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  if (token && isApiUrl) {
    console.log('✅ Ajout header Authorization');
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};