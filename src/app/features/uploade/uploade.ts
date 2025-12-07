import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UploadService } from '../../shared/services/uploade';
import { MatTooltipModule } from '@angular/material/tooltip'; // ← AJOUTER CET IMPORT

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="photo-upload-container">
      <div class="photo-preview" [class.has-photo]="currentPhotoUrl">
        <img [src]="currentPhotoUrl || defaultAvatar" [alt]="altText">
        
        <div class="photo-overlay" *ngIf="!uploading">
          <button mat-mini-fab color="primary" (click)="fileInput.click()"
                  [matTooltip]="currentPhotoUrl ? 'Changer la photo' : 'Ajouter une photo'">
            <mat-icon>{{currentPhotoUrl ? 'edit' : 'add_a_photo'}}</mat-icon>
          </button>
          
          <button mat-mini-fab color="warn" (click)="removePhoto()" 
                  *ngIf="currentPhotoUrl"
                  matTooltip="Supprimer la photo">
            <mat-icon>delete</mat-icon>
          </button>
        </div>

        <div class="uploading-overlay" *ngIf="uploading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Upload en cours...</p>
        </div>
      </div>

      <input #fileInput type="file" hidden 
             accept="image/jpeg,image/png,image/jpg"
             (change)="onFileSelected($event)">

      <div class="photo-info">
        <p class="help-text">
          <mat-icon>info</mat-icon>
          JPG, JPEG ou PNG • Max 5 MB
        </p>
      </div>
    </div>
  `,
  styles: [`
    .photo-upload-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .photo-preview {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid #e0e0e0;
      background: #f5f5f5;
      transition: all 0.3s ease;
    }

    .photo-preview.has-photo {
      border-color: #667eea;
    }

    .photo-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 15px;
      background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .photo-preview:hover .photo-overlay {
      opacity: 1;
    }

    .uploading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.9);
    }

    .uploading-overlay p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .photo-info {
      text-align: center;
    }

    .help-text {
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    .help-text mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #2196f3;
    }
  `]
})
export class PhotoUploadComponent {
  @Input() currentPhotoUrl: string | null = null;
  @Input() type: 'talibe' | 'enseignant' = 'talibe';
  @Input() altText = 'Photo';
  @Output() photoChanged = new EventEmitter<string>();
  @Output() photoRemoved = new EventEmitter<void>();

  private uploadService = inject(UploadService);
  private snackBar = inject(MatSnackBar);

  uploading = false;
  defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZTBlMGUwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPjxwYXRoIGQ9Ik0xMDAgNzBjMTYuNTY5IDAgMzAgMTMuNDMxIDMwIDMwczEzLjQzMSAzMCAzMCAzMGMwIDE2LjU2OS0xMy40MzEgMzAtMzAgMzBzLTMwLTEzLjQzMS0zMC0zMGMwLTE2LjU2OSAxMy40MzEtMzAgMzAtMzB6bTAgMTIwYy0zMy4xMzcgMC02MC0yNi44NjMtNjAtNjBzMjYuODYzLTYwIDYwLTYwIDYwIDI2Ljg2MyA2MCA2MC0yNi44NjMgNjAtNjAgNjB6IiBmaWxsPSIjYmRiZGJkIi8+PC9zdmc+';

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    console.log('📁 Fichier sélectionné:', file.name);

    if (!this.validateFile(file)) {
      return;
    }

    this.uploading = true;

    try {
      // Preview local immédiat (base64)
      console.log('🔄 Conversion en base64...');
      const base64 = await this.uploadService.fileToBase64(file);
      this.currentPhotoUrl = base64;
      console.log('✅ Preview base64 défini');

      // Upload vers le serveur
      console.log('🔼 Début upload serveur...');
      this.uploadService.uploadPhoto(file, this.type).subscribe({
        next: (response) => {
          console.log('=== 📤 RÉPONSE UPLOAD COMPLÈTE ===');
          console.log('Type réponse:', typeof response);
          console.log('Réponse brute:', response);
          console.log('URL:', response?.url);
          console.log('Filename:', response?.filename);
          console.log('========================');
          
          if (!response?.url) {
            console.error('❌ URL manquante dans la réponse');
            this.snackBar.open('Erreur: URL manquante', 'Fermer', { duration: 3000 });
            return;
          }

          // FORÇAGE : Utiliser l'URL complète
          const fullUrl = response.url;
          console.log('🖼️ Définition currentPhotoUrl:', fullUrl);
          this.currentPhotoUrl = fullUrl;
          
          // Vérification immédiate
          console.log('✅ currentPhotoUrl après définition:', this.currentPhotoUrl);
          console.log('✅ Début par http?:', this.currentPhotoUrl?.startsWith('http'));
          
          // Envoyer le filename seulement au formulaire
          this.photoChanged.emit(response.url);
          
          this.snackBar.open('Photo uploadée avec succès !', 'Fermer', { duration: 3000 });
          this.uploading = false;

          // Test immédiat de l'URL
          this.testImageUrl(fullUrl);
        },
        error: (error) => {
          console.error('❌ Erreur upload:', error);
          this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 3000 });
          this.currentPhotoUrl = null;
          this.uploading = false;
        }
      });
    } catch (error) {
      console.error('❌ Erreur conversion base64:', error);
      this.snackBar.open('Erreur lors de la lecture du fichier', 'Fermer', { duration: 3000 });
      this.uploading = false;
    }

    input.value = '';
  }

  // Méthode pour tester l'URL
  private testImageUrl(url: string): void {
    console.log('🧪 Test de l\'URL image...');
    const testImg = new Image();
    testImg.onload = () => console.log('✅ Test URL: Image charge correctement');
    testImg.onerror = () => console.error('❌ Test URL: Erreur de chargement');
    testImg.src = url;
  }

  // Gestion d'erreur améliorée
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error('=== 🚨 ERREUR CHARGEMENT IMAGE ===');
    console.error('URL utilisée:', img.src);
    console.error('currentPhotoUrl:', this.currentPhotoUrl);
    console.error('Les deux sont identiques?:', img.src === this.currentPhotoUrl);
    
    // Afficher toutes les propriétés de l'élément img
    console.error('Propriétés img:');
    console.error('  - src:', img.src);
    console.error('  - currentSrc:', img.currentSrc);
    console.error('  - complete:', img.complete);
    console.error('  - naturalWidth:', img.naturalWidth);
    console.error('============================');
  }

  validateFile(file: File): boolean {
    // Vérifier le type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Format non supporté. Utilisez JPG ou PNG', 'Fermer', { duration: 3000 });
      return false;
    }

    // Vérifier la taille (5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.snackBar.open('Fichier trop volumineux. Maximum 5 MB', 'Fermer', { duration: 3000 });
      return false;
    }

    return true;
  }

  removePhoto(): void {
    if (confirm('Supprimer cette photo ?')) {
      this.currentPhotoUrl = null;
      this.photoRemoved.emit();
      this.snackBar.open('Photo supprimée', 'Fermer', { duration: 2000 });
    }
  }
}