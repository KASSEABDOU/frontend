// 14. src/app/shared/services/chambre.service.ts
// ============================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Chambre,Talibe, Lit } from '../../core/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class ChambreService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getAll(): Observable<Chambre[]> {
    return this.http.get<Chambre[]>(`${this.apiUrl}/chambres`);
  }

  getById(id: number): Observable<Chambre> {
    return this.http.get<Chambre>(`${this.apiUrl}/chambres/${id}`);
  }

  create(chambre: Partial<Chambre>): Observable<Chambre> {
    return this.http.post<Chambre>(`${this.apiUrl}/chambres/create`, chambre);
  }

  update(id: number, chambre: Partial<Chambre>): Observable<Chambre> {
    return this.http.put<Chambre>(`${this.apiUrl}/${id}`, chambre);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getLits(id: number): Observable<Lit[]> {
    return this.http.get<Lit[]>(`${this.apiUrl}/chambres/${id}/lits`);
  }

  getTalibes(id: number): Observable<Talibe[]> {
    return this.http.get<Talibe[]>(`${this.apiUrl}/${id}/talibes`);
  }
}