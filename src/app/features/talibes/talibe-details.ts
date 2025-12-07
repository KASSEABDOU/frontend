

// ============================================
// 3. Mise à jour TalibeFormComponent avec upload photo
// ============================================
// Ajouter dans talibe-form.component.ts après l'étape Identité :

/*
// Dans les imports
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';

// Dans le component
photoUrl: string | null = null;

onPhotoChanged(url: string): void {
  this.photoUrl = url;
}

onPhotoRemoved(): void {
  this.photoUrl = null;
}

// Dans le template, ajouter après la section Identité:
<div class="photo-section">
  <app-photo-upload
    [currentPhotoUrl]="photoUrl"
    [type]="'talibe'"
    [altText]="identiteForm.get('prenom')?.value + ' ' + identiteForm.get('nom')?.value"
    (photoChanged)="onPhotoChanged($event)"
    (photoRemoved)="onPhotoRemoved()">
  </app-photo-upload>
</div>

// Dans onSubmit(), ajouter:
const formData = {
  ...this.identiteForm.value,
  ...this.parentsForm.value,
  ...this.scolariteForm.value,
  photo_url: this.photoUrl, // Ajouter ici
  role: 'Talibe',
  cours_ids: this.selectedCours.map(c => c.id)
};
*/

// ============================================
// 4. Page Détails Talibé - src/app/features/talibes/talibe-details/talibe-details.component.ts
// ============================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { TalibeService } from '../../shared/services/talibe';
import { DaaraService } from '../../shared/services/daara';
import { ChambreService } from '../../shared/services/chambre';
import { Talibe, Daara, Chambre, Cours } from '../../core/models/user.model';
import { MatTooltipModule } from '@angular/material/tooltip'; // ← AJOUTER CET IMPORT
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-talibe-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LayoutComponent,
    MatTooltipModule
  ],
  template: `
    <app-layout>
      <div class="details-container" *ngIf="!loading && talibe">
        <!-- En-tête avec photo -->
        <mat-card class="header-card">
          <div class="header-content">
            <div class="photo-section">
              <div class="photo-wrapper">
                <img [src]="talibe.photo_profil_url || defaultAvatar" 
                    [alt]="talibe.prenom + ' ' + talibe.nom"
                    (error)="handleImageError($event)">
              </div>
              <mat-chip-set>
                <mat-chip color="primary" highlighted>
                  <mat-icon>badge</mat-icon>
                  {{talibe.matricule}}
                </mat-chip>
                <!-- Ajouter un chip pour indiquer si une photo est disponible -->
                <mat-chip *ngIf="talibe.photo_profil_url" color="accent">
                  <mat-icon>photo_camera</mat-icon>
                  Photo disponible
                </mat-chip>
              </mat-chip-set>
            </div>

            <div class="info-section">
              <h1>{{talibe.prenom}} {{talibe.nom}}</h1>
              <p class="subtitle">
                <mat-icon>cake</mat-icon>
                {{calculateAge(talibe.date_naissance)}} ans • 
                Né le {{talibe.date_naissance | date:'dd/MM/yyyy'}}
                <span *ngIf="talibe.lieu_naissance"> à {{talibe.lieu_naissance}}</span>
              </p>
              <!-- 🔥 NOUVEAU : Sexe et Nationalité -->
              <div class="identity-badges">
                <mat-chip *ngIf="talibe.sexe" [color]="getSexeColor()" highlighted>
                  <mat-icon>{{ getSexeIcon() }}</mat-icon>
                  {{ getSexeLabel() }}
                </mat-chip>
                
                <mat-chip *ngIf="talibe.nationalite" color="primary">
                  <mat-icon>flag</mat-icon>
                  {{talibe.nationalite}}
                </mat-chip>
              </div>

              <div class="quick-stats">
                <div class="stat">
                  <mat-icon>school</mat-icon>
                  <span>{{talibe.niveau || 'Niveau non défini'}}</span>
                </div>
                <div class="stat">
                  <mat-icon>event</mat-icon>
                  <span> {{getYearsInDaara() }} </span>
                </div>
                <div class="stat" *ngIf="talibe.extrait_naissance">
                  <mat-icon>check_circle</mat-icon>
                  <span>Extrait de naissance disponible</span>
                </div>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="editTalibe()">
                  <mat-icon>edit</mat-icon>
                  Modifier
                </button>
                <button mat-raised-button color="accent" (click)="printProfile()">
                  <mat-icon>print</mat-icon>
                  Imprimer
                </button>
                <button mat-raised-button color="warn" (click)="deleteTalibe()">
                  <mat-icon>delete</mat-icon>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Onglets de contenu -->
        <mat-tab-group class="content-tabs">
          <!-- Onglet Informations -->
          <mat-tab label="Informations">
            <div class="tab-content">
              <div class="info-grid">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>person</mat-icon>
                      Informations personnelles
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Email:</span>
                      <span class="value">{{talibe.email}}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Adresse:</span>
                      <span class="value">{{talibe.adresse || 'Non renseignée'}}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Date d'entrée:</span>
                      <span class="value">{{talibe.date_entree | date:'dd/MM/yyyy'}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>family_restroom</mat-icon>
                      Parents
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Père:</span>
                      <span class="value">{{talibe.pere || 'Non renseigné'}}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Mère:</span>
                      <span class="value">{{talibe.mere || 'Non renseignée'}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>business</mat-icon>
                      Daara
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Nom:</span>
                      <span class="value">{{daara?.nom || 'Non assigné'}}</span>
                    </div>
                    <div class="info-item" *ngIf="daara">
                      <span class="label">Lieu:</span>
                      <span class="value">{{daara.lieu}}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>meeting_room</mat-icon>
                      Logement
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-item">
                      <span class="label">Chambre:</span>
                      <span class="value">
                        {{chambre ? 'Chambre ' + chambre.numero : 'Non assignée'}}
                      </span>
                    </div>
                    <div class="info-item" *ngIf="chambre">
                      <span class="label">Capacité:</span>
                      <span class="value">{{chambre.nb_lits}} lits</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Cours -->
          <mat-tab label="Cours">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>book</mat-icon>
                    Cours suivis ({{coursTalibe.length || 0}})
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="cours-grid" *ngIf="coursTalibe && coursTalibe.length > 0">
                    <mat-card *ngFor="let cours of coursTalibe" class="cours-card">
                      <mat-card-content>
                        <div class="cours-header">
                          <mat-icon>book</mat-icon>
                          <h3>{{cours.libelle}}</h3>
                        </div>
                        <p class="cours-code">Code: {{cours.code}}</p>
                      </mat-card-content>
                    </mat-card>
                  </div>
                  <div class="no-data" *ngIf="!coursTalibe || coursTalibe.length === 0">
                    <mat-icon>book_off</mat-icon>
                    <p>Aucun cours assigné</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Onglet Activités -->
          <mat-tab label="Activités">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>history</mat-icon>
                    Historique des activités
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="timeline">
                    <div class="timeline-item">
                      <mat-icon>check_circle</mat-icon>
                      <div>
                        <strong>Inscription au daara</strong>
                        <p>{{talibe.date_entree | date:'dd/MM/yyyy'}}</p>
                      </div>
                    </div>
                    <!-- Ajouter d'autres événements ici -->
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des détails...</p>
      </div>
    </app-layout>
  `,
  styles: [`
    .details-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      gap: 30px;
      padding: 20px;
    }

    .photo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .photo-wrapper {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      overflow: hidden;
      border: 5px solid #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .photo-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .info-section {
      flex: 1;
    }

    .info-section h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      color: #333;
    }

    .subtitle {
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 0 0 20px 0;
      color: #666;
      font-size: 16px;
    }

    .subtitle mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .identity-badges {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .identity-badges mat-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .quick-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 25px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      background: #f5f5f5;
      border-radius: 20px;
      color: #666;
    }

    .stat mat-icon {
      color: #667eea;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .content-tabs {
      margin-top: 30px;
    }

    .tab-content {
      padding: 30px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .info-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px !important;
    }

    .info-card mat-card-title mat-icon {
      color: #667eea;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item .label {
      color: #666;
      font-weight: 500;
    }

    .info-item .value {
      color: #333;
      font-weight: 600;
      text-align: right;
    }

    .cours-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }

    .cours-card {
      border-left: 4px solid #667eea;
    }

    .cours-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .cours-header mat-icon {
      color: #667eea;
    }

    .cours-header h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .cours-code {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .timeline-item mat-icon {
      color: #667eea;
    }

    .timeline-item strong {
      display: block;
      margin-bottom: 5px;
      color: #333;
    }

    .timeline-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 15px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TalibeDetailsComponent implements OnInit {
  private talibeService = inject(TalibeService);
  private daaraService = inject(DaaraService);
  private chambreService = inject(ChambreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  talibe: Talibe | null = null;
  daara: Daara | null = null;
  chambre: Chambre | null = null;
  loading = true;
  coursTalibe: Cours [] = [];
  defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZTBlMGUwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPjxwYXRoIGQ9Ik0xMDAgNzBjMTYuNTY5IDAgMzAgMTMuNDMxIDMwIDMwczEzLjQzMSAzMCAzMCAzMGMwIDE2LjU2OS0xMy40MzEgMzAtMzAgMzBzLTMwLTEzLjQz';
  ngOnInit(): void {
    this.loadTalibeDetails();
  }

  

  loadTalibeDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.snackBar.open('ID du talibé non trouvé', 'Fermer', { duration: 3000 });
      this.router.navigate(['/talibes']);
      return;
    }

    this.loading = true;

    // 🔥 Utiliser forkJoin pour charger en parallèle
    forkJoin({
      talibe: this.talibeService.getById(+id),
      cours: this.talibeService.getCoursTalibes(+id) // ou this.coursService.getCoursByTalibe(+id)
    }).subscribe({
      next: ({ talibe, cours }) => {
        console.log('Talibé chargé:', talibe);
        console.log('Cours du talibé:', cours);
        
        this.talibe = talibe;
        this.coursTalibe = Array.isArray(cours) ? cours : [];
        
        this.loadAdditionalData(talibe);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement:', error);
        this.snackBar.open('Erreur de chargement des données', 'Fermer', { duration: 3000 });
        this.router.navigate(['/talibes']);
        this.loading = false;
      }
    });
  }

  editTalibe(): void {
    if (this.talibe?.id) {
      this.router.navigate(['/talibes', this.talibe.id, 'edit']);
    } else {
      this.snackBar.open('Impossible de modifier ce talibé', 'Fermer', { duration: 3000 });
    }
  }
  

  private loadAdditionalData(talibe: Talibe): void {
    // Charger les données du daara
    if (talibe.daara_id) {
      this.daaraService.getById(talibe.daara_id).subscribe({
        next: (daara) => this.daara = daara,
        error: () => console.error('Erreur chargement daara')
      });
    }

    // Charger les données de la chambre
    if (talibe.chambre_id) {
        this.chambreService.getById(talibe.chambre_id).subscribe({
            next: (chambreData: any) => {
                this.chambre = {
                    id: chambreData.id,
                    batiment_id: chambreData.batiment_id,
                    numero: chambreData.numero,
                    nb_lits: chambreData.nb_lits
                    // Ajoutez d'autres propriétés si nécessaire
                };
                console.log('Chambre chargée:', this.chambre);
            },
            error: (error) => {
                console.error('Erreur chargement chambre:', error);
                this.chambre = null;
            }
        });
    }
  }

  calculateAge(dateNaissance: string | undefined): string {
    if (!dateNaissance) {
        return 'N/A';
    }
    
    try {
        const today = new Date();
        const birthDate = new Date(dateNaissance);
        
        if (isNaN(birthDate.getTime())) {
        return 'N/A';
        }
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        }
        
        return age.toString();
    } catch {
        return 'N/A';
    }
    }

    // 🔥 NOUVELLES MÉTHODES POUR LE SEXE
    getSexeLabel(): string {
      return this.talibe?.sexe === 'F' ? 'Féminin' : 'Masculin';
    }

    getSexeIcon(): string {
      return this.talibe?.sexe === 'F' ? 'female' : 'male';
    }

    getSexeColor(): string {
      return this.talibe?.sexe === 'F' ? 'accent' : 'primary';
    }

    getYearsInDaara(): string {
        if (!this.talibe?.date_entree) {
        return 'Nouveau';
        }
        
        const years = this.calculateYearsSince(this.talibe.date_entree);
        
        if (years === 0) {
        return 'Nouveau au daara';
        } else if (years === 1) {
        return '1 an au daara';
        } else {
        return `${years} ans au daara`;
        }
    }

    handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultAvatar;
  }

  // Méthode de calcul réutilisable
  private calculateYearsSince(dateString: string | Date | undefined | null): number {
    if (!dateString) {
      return 0;
    }

    try {
      const startDate = new Date(dateString);
      const today = new Date();
      
      if (isNaN(startDate.getTime())) {
        return 0;
      }
      
      let years = today.getFullYear() - startDate.getFullYear();
      const monthDiff = today.getMonth() - startDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < startDate.getDate())) {
        years--;
      }
      
      return Math.max(0, years);
    } catch (error) {
      console.error('Erreur calcul années:', error);
      return 0;
    }
  }

  printProfile(): void {
    window.print();
  }

  deleteTalibe(): void {
    if (!this.talibe) return;

    if (confirm(`Supprimer définitivement ${this.talibe.prenom} ${this.talibe.nom} ?`)) {
      this.talibeService.delete(this.talibe.id).subscribe({
        next: () => {
          this.snackBar.open('Talibé supprimé avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/talibes']);
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}