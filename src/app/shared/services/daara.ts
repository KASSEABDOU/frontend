
// 9. src/app/shared/services/daara.service.ts
// ============================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Daara,Talibe, Enseignant } from '../../core/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class DaaraService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getAll(): Observable<Daara[]> {
    return this.http.get<Daara[]>(`${this.apiUrl}/daaras`);
  }

  getById(id: number): Observable<Daara> {
    return this.http.get<Daara>(`${this.apiUrl}/daara/${id}`);
  }

  create(daara: Partial<Daara>): Observable<Daara> {
    return this.http.post<Daara>(`${this.apiUrl}/daaras/create`, daara);
  }

  update(id: number, daara: Partial<Daara>): Observable<Daara> {
    return this.http.put<Daara>(`${this.apiUrl}/${id}`, daara);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTalibes(id: number): Observable<Talibe[]> {
    return this.http.get<Talibe[]>(`${this.apiUrl}/daaras/${id}/talibes`);
  }

  getEnseignants(id: number): Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(`${this.apiUrl}/daaras/${id}/enseignants`);
  }
}