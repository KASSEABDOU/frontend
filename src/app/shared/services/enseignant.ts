// 11. src/app/shared/services/enseignant.service.ts
// ============================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {  Enseignant, Cours, Talibe } from '../../core/models/user.model';



@Injectable({
  providedIn: 'root'
})
export class EnseignantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  private enseignantsCache$?: Observable<Enseignant[]>;
  private lastLoadTime = 0;
  private readonly CACHE_DURATION = 30000; // 30 secondes

  getAll(): Observable<Enseignant[]> {
    const now = Date.now();
    
    if (!this.enseignantsCache$ || (now - this.lastLoadTime) > this.CACHE_DURATION) {
      console.log('🔄 Chargement des enseignants depuis le serveur...');
      this.enseignantsCache$ = this.http.get<Enseignant[]>(`${this.apiUrl}/enseignants`).pipe(
        tap(() => this.lastLoadTime = now),
        shareReplay(1)
      );
    } else {
      console.log('💾 Utilisation du cache des enseignants');
    }
    
    return this.enseignantsCache$;
  }

  refreshEnseignants(): void {
    console.log('🗑️ Invalidation du cache enseignants');
    this.enseignantsCache$ = undefined;
    this.lastLoadTime = 0;
  }

  getById(id: number): Observable<Enseignant> {
    return this.http.get<Enseignant>(`${this.apiUrl}/enseignants/${id}`);
  }

  create(enseignant: Partial<Enseignant>): Observable<Enseignant> {
    return this.http.post<Enseignant>(`${this.apiUrl}/enseignants/create`, enseignant);
  }

  update(id: number, enseignant: Partial<Enseignant>): Observable<Enseignant> {
    return this.http.put<Enseignant>(`${this.apiUrl}/enseignants/${id}`, enseignant);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignCours(enseignantId: number, coursId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${enseignantId}/cours/${coursId}`, {});
  }

  removeCours(enseignantId: number, coursId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${enseignantId}/cours/${coursId}`);
  }

  getCours(enseignantId: number): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.apiUrl}/enseignants/${enseignantId}/cours`);
  }

  retirerCours(enseignantId: number, coursId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${enseignantId}/cours/${coursId}`);
  }

  getTalibes(enseignantId: number): Observable<Talibe[]> {
    return this.http.get<Talibe[]>(`${this.apiUrl}/enseignants/${enseignantId}/talibes`);
  }

  
  


}