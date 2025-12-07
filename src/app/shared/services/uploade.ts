import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  uploadPhoto(file: File, type: 'talibe' | 'enseignant'): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload/photo`, formData);
  }

  deletePhoto(filename: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/upload/photo/${filename}`);
  }

  // Convertir fichier en Base64 pour preview
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}