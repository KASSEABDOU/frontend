// 6. src/app/core/guards/role.guard.ts
// ============================================
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};