// 12. src/app/shared/services/cours.service.ts
// ============================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cours, Enseignant, Talibe } from '../../core/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class CoursService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getAll(): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.apiUrl}/cours`);
  }

  getById(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.apiUrl}/cours/${id}`);
  }

  create(cours: Partial<Cours>): Observable<Cours> {
    return this.http.post<Cours>(`${this.apiUrl}/cours/create`, cours);
  }

  update(id: number, cours: Partial<Cours>): Observable<Cours> {
    return this.http.put<Cours>(`${this.apiUrl}/cours/${id}`, cours);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTalibes(id: number): Observable<Talibe[]> {
    return this.http.get<Talibe[]>(`${this.apiUrl}/cours/${id}/talibes`);
  }

  getEnseignants(id: number): Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(`${this.apiUrl}/cours/${id}/enseignants`);
  }

  // Vérifier si un talibé est inscrit
  isTalibeInscrit(coursId: number, talibeId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${coursId}/talibes/${talibeId}/check`);
  }

  // Vérifier si un enseignant est assigné
  isEnseignantAssigne(coursId: number, enseignantId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${coursId}/enseignants/${enseignantId}/check`);
  }

  inscrireTalibeCours(coursId: number, talibeId: number): Observable<any> {
    const payload = {
      talibe_id: talibeId,
      cours_id: coursId
    };

    return this.http.post(`${this.apiUrl}/inscriptions/inscrire`, payload);
  }

  // Inscription multiple
  inscrirePlusieursTalibes(coursId: number, talibeIds: number[]): Observable<any> {
    const payload = {
      talibe_ids: talibeIds,
      date_inscription: new Date().toISOString()
    };

    return this.http.post(`${this.apiUrl}/inscriptions`, payload);
  }

  // Désinscrire un talibé
  desinscrireTalibeCours(coursId: number, talibeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${coursId}/talibes/${talibeId}`);
  }

  // ============================================
  // FONCTION 2: confier_enseignant_cours
  // ============================================
  confierEnseignantCours(coursId: number, enseignantId: number, data?: {
    dateDebut?: string;
    dateFin?: string;
    role?: 'titulaire' | 'assistant' | 'remplaçant';
    charge_horaire?: number;
  }): Observable<any> {
    const payload = {
      enseignant_id: enseignantId,
      cours_id: coursId,
      date_debut: data?.dateDebut || new Date().toISOString(),
      date_fin: data?.dateFin || null,
      role: data?.role || 'titulaire',
      charge_horaire: data?.charge_horaire || null
    };

    return this.http.post(`${this.apiUrl}/cours/${coursId}/confier_enseignant`, payload);
  }

  // Assigner plusieurs enseignants
  confierPlusieursEnseignants(coursId: number, enseignantIds: number[]): Observable<any> {
    const payload = {
      enseignant_ids: enseignantIds,
      date_debut: new Date().toISOString(),
      role: 'titulaire'
    };

    return this.http.post(`${this.apiUrl}/${coursId}/enseignants/bulk`, payload);
  }

  // Retirer un enseignant
  retirerEnseignantCours(coursId: number, enseignantId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${coursId}/enseignants/${enseignantId}`);
  }
}