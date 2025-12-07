// 10. src/app/shared/services/talibe.service.ts
// ============================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Talibe, Cours } from '../../core/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class TalibeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;
  private talibesCache$?: Observable<Talibe[]>;
  private lastLoadTime = 0;
  private readonly CACHE_DURATION = 30000; // 30 secondes

  getAll(): Observable<Talibe[]> {
    const now = Date.now();
    
    // Recharger si le cache est expiré ou inexistant
    if (!this.talibesCache$ || (now - this.lastLoadTime) > this.CACHE_DURATION) {
      console.log('🔄 Chargement des talibés depuis le serveur...');
      this.talibesCache$ = this.http.get<Talibe[]>(`${this.apiUrl}/talibes`).pipe(
        tap(() => this.lastLoadTime = now),
        shareReplay(1)
      );
    } else {
      console.log('💾 Utilisation du cache des talibés');
    }
    
    return this.talibesCache$;
  }

  refreshTalibes(): void {
    console.log('🗑️ Invalidation du cache talibés');
    this.talibesCache$ = undefined;
    this.lastLoadTime = 0;
  }

  getById(id: number): Observable<Talibe> {
    return this.http.get<Talibe>(`${this.apiUrl}/talibes/${id}`);
  }

  getCoursTalibes(id: number): Observable<any[]> {
    return this.http.get<Cours[]>(`${this.apiUrl}/talibes/${id}/cours`);
  }

  create(talibe: Partial<Talibe>): Observable<Talibe> {
    return this.http.post<Talibe>(`${this.apiUrl}/talibes/create`, talibe);
  }

  update(id: number, talibe: Partial<Talibe>): Observable<Talibe> {
    return this.http.put<Talibe>(`${this.apiUrl}/talibes/${id}`, talibe);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/talibes/delete/${id}`);
  }

  assignCours(talibeId: number, coursId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${talibeId}/cours/${coursId}`, {});
  }

  removeCours(talibeId: number, coursId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${talibeId}/cours/${coursId}`);
  }

  getMesCours(talibeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talibes/${talibeId}/cours`);
  }

  getMesNotes(talibeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talibes/${talibeId}/notes`);
  }

  getProchainesEcheances(talibeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talibes/${talibeId}/echeances`);
  }
}