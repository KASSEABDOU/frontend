// 13. src/app/shared/services/batiment.service.ts
// ============================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Batiment, Chambre } from '../../core/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class BatimentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getAll(): Observable<Batiment[]> {
    return this.http.get<Batiment[]>(`${this.apiUrl}/batiments`);
  }

  getById(id: number): Observable<Batiment> {
    return this.http.get<Batiment>(`${this.apiUrl}/${id}`);
  }

  create(batiment: Partial<Batiment>): Observable<Batiment> {
    return this.http.post<Batiment>(`${this.apiUrl}/batiments/create`, batiment);
  }

  update(id: number, batiment: Partial<Batiment>): Observable<Batiment> {
    return this.http.put<Batiment>(`${this.apiUrl}/${id}`, batiment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getChambres(id: number): Observable<Chambre[]> {
    return this.http.get<Chambre[]>(`${this.apiUrl}/chambres/batiment/${id}`);
  }
}