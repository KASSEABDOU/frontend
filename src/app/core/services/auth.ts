import { Injectable, inject } from '@angular/core';
import { HttpClient,HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError , throwError, of} from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'currentUser';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

// Ajoutez cette propriété pour la clé du localStorage
 constructor(
) {
  this.initializeFromStorage();
}

private initializeFromStorage(): void {
  const token = this.getToken(); // CORRECTION: Récupérer le token avec getToken()
  const storedUser = localStorage.getItem(this.userKey);
  
  if (storedUser && token) {
    try {
      const user = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      this.authStatusSubject.next(true); // CORRECTION: Utiliser next() au lieu de réassigner
      console.log('✅ Utilisateur chargé depuis le localStorage');
    } catch (e) {
      console.error('❌ Erreur parsing stored user:', e);
      this.clearStorage();
    }
  } else if (token && !storedUser) {
    // Token présent mais pas d'utilisateur stocké
    console.log('⚠️ Token présent mais aucun utilisateur stocké');
    this.authStatusSubject.next(true);
  } else if (!token && storedUser) {
    // Utilisateur stocké mais pas de token (incohérence)
    console.log('⚠️ Utilisateur stocké mais pas de token');
    this.clearStorage();
  } else {
    // Ni token ni utilisateur
    console.log('ℹ️ Aucune donnée d\'authentification trouvée');
    this.authStatusSubject.next(false);
  }
  
  console.log('🔐 AuthService initialisé - Token présent:', !!this.getToken());
}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 Tentative de connexion...', credentials.email);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Réponse login reçue');
          
          // ✅ CORRECTION: Pas de problème de type ici
          localStorage.setItem(this.tokenKey, response.access_token);
          if (response.refresh_token) {
            localStorage.setItem(this.refreshTokenKey, response.refresh_token);
          }
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          
          console.log('💾 Token stocké:', !!response.access_token);
          console.log('👤 Utilisateur:', response.user.email);
        })
      );
  }


  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    // ✅ CORRECTION: Vérifier que refreshToken n'est pas null
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    return this.http.post(`${this.apiUrl}/refresh`, { refresh_token: refreshToken })
      .pipe(
        tap((response: any) => {
          if (response.access_token) {
            localStorage.setItem(this.tokenKey, response.access_token);
          }
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  // ✅ CORRECTION: Méthode debug avec gestion des null
  debugAuth(): void {
    console.group('🔐 DEBUG AUTH SERVICE');
    
    const token = this.getToken();
    console.log('🔐 Token présent:', !!token);
    console.log('🔐 Token clé utilisée:', this.tokenKey);
    
    // ✅ CORRECTION: Vérifier que token n'est pas null avant d'utiliser substring
    if (token) {
      console.log('🔐 Token valeur:', `${token.substring(0, 50)}...`);
    } else {
      console.log('🔐 Token valeur: NULL');
    }
    
    console.log('👤 Utilisateur:', this.getCurrentUser());
    console.log('✅ Authentifié:', this.isAuthenticated());
    
    // ✅ CORRECTION: Vérifier les clés avec gestion des null
    console.log('🗂️ Toutes les clés localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('token') || key.includes('user'))) {
        const value = localStorage.getItem(key);
        // ✅ CORRECTION: Vérifier que value n'est pas null avant substring
        if (value) {
          console.log(`   ${key}: ${value.substring(0, 50)}...`);
        } else {
          console.log(`   ${key}: NULL`);
        }
      }
    }
    console.groupEnd();
  }

  // auth.service.ts
logout(): Observable<any> {
  const token = this.getToken();
  
  // Si pas de token, nettoyer et terminer
  if (!token) {
    this.clearStorage();
    return new Observable(observer => {
      observer.next({ message: 'Déconnexion locale' });
      observer.complete();
    });
  }
  
  // Préparer les headers
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.post(`${this.apiUrl}/logout`, {}, { headers })
    .pipe(
      tap((response) => {
        console.log('✅ Réponse logout backend:', response);
        this.clearStorage();
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn('⚠️ Erreur lors de la déconnexion backend:', error.status);
        
        // Si 401 (token invalide/expiré), nettoyer quand même
        if (error.status === 401) {
          console.log('Token invalide/expiré, nettoyage côté frontend');
          this.clearStorage();
          return of({ 
            message: 'Déconnexion côté frontend (token invalide)',
            originalError: error.error 
          });
        }
        
        // Pour les autres erreurs, nettoyer aussi
        this.clearStorage();
        return throwError(() => error);
      })
    );
}

clearAuthData(): void {
  // Effacer localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  
  // Effacer sessionStorage
  sessionStorage.clear();
  
  // Effacer les cookies
  this.deleteCookie('access_token_cookie');
  this.deleteCookie('refresh_token_cookie');
  
  // Mettre à jour l'état
  this.currentUserSubject.next(null);
  
}

private deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

getCurrentUserId(): string | number | null {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return null;
  }

  try {
    // Méthode correcte pour décoder un JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Vérifier l'expiration du token
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.warn('Token JWT expiré');
      localStorage.removeItem('auth_token');
      return null;
    }
    
    return payload.userId || payload.id || payload.sub || null;
  } catch (error) {
    console.error('Erreur de décodage du token JWT:', error);
    localStorage.removeItem('auth_token'); // Token invalide, on le supprime
    return null;
  }
}

}