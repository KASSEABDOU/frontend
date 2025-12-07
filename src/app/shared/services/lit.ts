// 15. src/app/shared/services/lit.service.ts
// ============================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lit } from '../../core/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class LitService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getAll(): Observable<Lit[]> {
    return this.http.get<Lit[]>(`${this.apiUrl}/lits`);
  }

  getById(id: number): Observable<Lit> {
    return this.http.get<Lit>(`${this.apiUrl}/lits/${id}`);
  }

  create(lit: Partial<Lit>): Observable<Lit> {
    return this.http.post<Lit>(`${this.apiUrl}/lits/create`, lit);
  }

  update(id: number, lit: Partial<Lit>): Observable<Lit> {
    return this.http.put<Lit>(`${this.apiUrl}/lits/${id}`, lit);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/lits/${id}`);
  }
}