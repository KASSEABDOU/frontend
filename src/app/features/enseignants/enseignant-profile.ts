// ============================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators, 
  AbstractControl,
  ValidationErrors 
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { EnseignantService } from '../../shared/services/enseignant';
import { AuthService } from '../../core/services/auth';
import { PasswordService } from '../../shared/services/password';
import { Enseignant } from '../../core/models/user.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-enseignant-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
  <div class="profile-container">
    <!-- En-tête du profil -->
    <mat-card class="profile-header">
      <div class="header-content">
        <div class="avatar-section">
          <div class="avatar-large">
            @if (isLoadingProfile) {
              <mat-spinner diameter="60"></mat-spinner>
            } @else {
              <mat-icon>person</mat-icon>
            }
          </div>
          <button mat-raised-button color="primary" class="upload-btn" [disabled]="isLoadingProfile" (click)="uploadPhoto()">
            <mat-icon>camera_alt</mat-icon>
            Changer la photo
          </button>
        </div>

        <div class="info-section">
          @if (isLoadingProfile) {
            <div style="height: 150px; display: flex; align-items: center; justify-content: center;">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (enseignant) {
            <h1>{{enseignant.prenom}} {{enseignant.nom}}</h1>
            <p class="subtitle">{{enseignant.specialite}} • {{enseignant.grade}}</p>
            
            <mat-chip-set>
              <mat-chip color="primary">
                <mat-icon>badge</mat-icon>
                {{enseignant.matricule}}
              </mat-chip>
              <mat-chip color="accent">
                <mat-icon>work</mat-icon>
                {{getExperience()}} ans d'expérience
              </mat-chip>
              <mat-chip [color]="enseignant.statut === 'Actif' ? 'accent' : ''">
                <mat-icon>{{enseignant.statut === 'Actif' ? 'check_circle' : 'pause_circle'}}</mat-icon>
                {{enseignant.statut}}
              </mat-chip>
            </mat-chip-set>

            <div class="contact-info">
              @if (enseignant.email) {
                <div class="contact-item">
                  <mat-icon>email</mat-icon>
                  <span>{{enseignant.email}}</span>
                </div>
              }
              @if (enseignant.telephone) {
                <div class="contact-item">
                  <mat-icon>phone</mat-icon>
                  <span>{{enseignant.telephone}}</span>
                </div>
              }
              @if (enseignant.adresse) {
                <div class="contact-item">
                  <mat-icon>location_on</mat-icon>
                  <span>{{enseignant.adresse}}</span>
                </div>
              }
            </div>
          } @else {
            <div class="no-data">
              <mat-icon>error_outline</mat-icon>
              <p>Aucune donnée disponible</p>
            </div>
          }
        </div>
      </div>
    </mat-card>

    <!-- Onglets du profil -->
    @if (!isLoadingProfile) {
      <mat-tab-group class="profile-tabs">
        <!-- Informations personnelles -->
        <mat-tab label="Informations personnelles">
          <div class="tab-content">
            <form [formGroup]="personalForm" (ngSubmit)="savePersonalInfo()">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>person</mat-icon>
                    Informations de base
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Prénom</mat-label>
                      <input matInput formControlName="prenom" required>
                      <mat-icon matPrefix>person</mat-icon>
                      @if (personalForm.get('prenom')?.invalid && personalForm.get('prenom')?.touched) {
                        <mat-error>Prénom requis</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Nom</mat-label>
                      <input matInput formControlName="nom" required>
                      <mat-icon matPrefix>person</mat-icon>
                      @if (personalForm.get('nom')?.invalid && personalForm.get('nom')?.touched) {
                        <mat-error>Nom requis</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Date de naissance</mat-label>
                      <input matInput type="date" formControlName="date_naissance">
                      <mat-icon matPrefix>cake</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Lieu de naissance</mat-label>
                      <input matInput formControlName="lieu_naissance">
                      <mat-icon matPrefix>place</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Sexe</mat-label>
                      <mat-select formControlName="sexe">
                        <mat-option value="Masculin">Masculin</mat-option>
                        <mat-option value="Féminin">Féminin</mat-option>
                      </mat-select>
                      <mat-icon matPrefix>wc</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Nationalité</mat-label>
                      <input matInput formControlName="nationalite">
                      <mat-icon matPrefix>flag</mat-icon>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>contact_phone</mat-icon>
                    Coordonnées
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Téléphone</mat-label>
                      <input matInput formControlName="telephone" required>
                      <mat-icon matPrefix>phone</mat-icon>
                      @if (personalForm.get('telephone')?.invalid && personalForm.get('telephone')?.touched) {
                        <mat-error>Téléphone requis</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Email</mat-label>
                      <input matInput type="email" formControlName="email" required>
                      <mat-icon matPrefix>email</mat-icon>
                      @if (personalForm.get('email')?.invalid && personalForm.get('email')?.touched) {
                        <mat-error>Email invalide</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Adresse</mat-label>
                      <input matInput formControlName="adresse">
                      <mat-icon matPrefix>location_on</mat-icon>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="form-actions">
                <button mat-raised-button type="button" (click)="cancelEdit()" [disabled]="isSaving">
                  <mat-icon>close</mat-icon>
                  Annuler
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="!personalForm.valid || personalForm.pristine || isSaving">
                  @if (isSaving) {
                    <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                  } @else {
                    <mat-icon>save</mat-icon>
                  }
                  {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Informations académiques -->
        <mat-tab label="Informations académiques">
          <div class="tab-content">
            <form [formGroup]="academicForm" (ngSubmit)="saveAcademicInfo()">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>school</mat-icon>
                    Formation et diplômes
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Spécialité</mat-label>
                      <input matInput formControlName="specialite" required>
                      <mat-icon matPrefix>menu_book</mat-icon>
                      @if (academicForm.get('specialite')?.invalid && academicForm.get('specialite')?.touched) {
                        <mat-error>Spécialité requise</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Grade</mat-label>
                      <mat-select formControlName="grade">
                        <mat-option value="Enseignant">Enseignant</mat-option>
                        <mat-option value="Enseignant certifié">Enseignant certifié</mat-option>
                        <mat-option value="Professeur">Professeur</mat-option>
                        <mat-option value="Professeur principal">Professeur principal</mat-option>
                      </mat-select>
                      <mat-icon matPrefix>star</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Diplôme principal</mat-label>
                      <input matInput formControlName="diplome">
                      <mat-icon matPrefix>workspace_premium</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Établissement d'origine</mat-label>
                      <input matInput formControlName="diplome_origine">
                      <mat-icon matPrefix>business</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Année d'obtention</mat-label>
                      <input matInput type="number" formControlName="annee_diplome">
                      <mat-icon matPrefix>event</mat-icon>
                      @if (academicForm.get('annee_diplome')?.invalid && academicForm.get('annee_diplome')?.touched) {
                        <mat-error>Année invalide</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Diplômes et certifications supplémentaires</mat-label>
                    <textarea matInput rows="4" formControlName="diplomes_supplementaires"></textarea>
                    <mat-icon matPrefix>description</mat-icon>
                  </mat-form-field>
                </mat-card-content>
              </mat-card>

              <mat-card>
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>work</mat-icon>
                    Informations professionnelles
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Date de recrutement</mat-label>
                      <input matInput type="date" formControlName="date_recrutement">
                      <mat-icon matPrefix>event</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Statut</mat-label>
                      <mat-select formControlName="statut">
                        <mat-option value="Actif">Actif</mat-option>
                        <mat-option value="Congé">En congé</mat-option>
                        <mat-option value="Suspendu">Suspendu</mat-option>
                      </mat-select>
                      <mat-icon matPrefix>assignment_ind</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Biographie professionnelle</mat-label>
                      <textarea matInput rows="6" formControlName="biographie"></textarea>
                      <mat-icon matPrefix>description</mat-icon>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="form-actions">
                <button mat-raised-button type="button" (click)="cancelEdit()" [disabled]="isSaving">
                  <mat-icon>close</mat-icon>
                  Annuler
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="!academicForm.valid || academicForm.pristine || isSaving">
                  @if (isSaving) {
                    <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                  } @else {
                    <mat-icon>save</mat-icon>
                  }
                  {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Sécurité -->
        <mat-tab label="Sécurité">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>lock</mat-icon>
                  Changer le mot de passe
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="securityForm" (ngSubmit)="changePassword()">
                  <div class="form-grid-single">
                    <mat-form-field appearance="outline">
                      <mat-label>Mot de passe actuel</mat-label>
                      <input matInput type="password" formControlName="currentPassword" required>
                      <mat-icon matPrefix>lock</mat-icon>
                      @if (securityForm.get('currentPassword')?.invalid && securityForm.get('currentPassword')?.touched) {
                        <mat-error>Mot de passe actuel requis</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Nouveau mot de passe</mat-label>
                      <input matInput type="password" formControlName="newPassword" required>
                      <mat-icon matPrefix>lock_open</mat-icon>
                      @if (securityForm.get('newPassword')?.invalid && securityForm.get('newPassword')?.touched) {
                        <mat-error>Minimum 8 caractères requis</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Confirmer le nouveau mot de passe</mat-label>
                      <input matInput type="password" formControlName="confirmPassword" required>
                      <mat-icon matPrefix>lock_open</mat-icon>
                      @if (securityForm.get('confirmPassword')?.invalid && securityForm.get('confirmPassword')?.touched) {
                        <mat-error>Les mots de passe ne correspondent pas</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <div class="password-requirements">
                    <h4>Le mot de passe doit contenir :</h4>
                    <ul>
                      <li [class.valid]="passwordHasMinLength">Au moins 8 caractères</li>
                      <li [class.valid]="passwordHasUppercase">Une lettre majuscule</li>
                      <li [class.valid]="passwordHasLowercase">Une lettre minuscule</li>
                      <li [class.valid]="passwordHasNumber">Un chiffre</li>
                      <li [class.valid]="passwordHasSpecial">Un caractère spécial (@$!%*?&)</li>
                    </ul>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="!securityForm.valid || isChangingPassword">
                      @if (isChangingPassword) {
                        <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                      } @else {
                        <mat-icon>save</mat-icon>
                      }
                      {{ isChangingPassword ? 'Changement...' : 'Changer le mot de passe' }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>security</mat-icon>
                  Authentification à deux facteurs
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>Renforcez la sécurité de votre compte en activant l'authentification à deux facteurs.</p>
                <button mat-raised-button color="accent" (click)="enableTwoFactorAuth()">
                  <mat-icon>shield</mat-icon>
                  Activer la 2FA
                </button>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>devices</mat-icon>
                  Sessions actives
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="session-item">
                  <div class="session-info">
                    <mat-icon>computer</mat-icon>
                    <div>
                      <h4>Chrome - Windows 10</h4>
                      <p>Dernière connexion: Aujourd'hui, 14:30</p>
                      <p>Adresse IP: 192.168.1.100</p>
                    </div>
                  </div>
                  <mat-chip color="primary">Actuelle</mat-chip>
                </div>
                
                <mat-divider></mat-divider>
                
                <div class="session-item">
                  <div class="session-info">
                    <mat-icon>phone_iphone</mat-icon>
                    <div>
                      <h4>Safari - iOS 15</h4>
                      <p>Dernière connexion: Hier, 10:15</p>
                      <p>Adresse IP: 192.168.1.101</p>
                    </div>
                  </div>
                  <button mat-button color="warn" (click)="terminateSession()" [disabled]="isTerminatingSessions">
                    @if (isTerminatingSessions) {
                      <mat-spinner diameter="16" class="button-spinner"></mat-spinner>
                    } @else {
                      <mat-icon>logout</mat-icon>
                    }
                    {{ isTerminatingSessions ? 'Terminaison...' : 'Terminer' }}
                  </button>
                </div>
                
                <div class="session-actions">
                  <button mat-button color="warn" (click)="terminateAllSessions()" [disabled]="isTerminatingSessions">
                    <mat-icon>logout</mat-icon>
                    Terminer toutes les sessions
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Préférences -->
        <mat-tab label="Préférences">
          <div class="tab-content">
            <!-- Notifications -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>notifications</mat-icon>
                  Notifications
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="notificationsForm">
                  <div class="preferences-list">
                    <div class="preference-item">
                      <div>
                        <h4>Notifications par email</h4>
                        <p>Recevoir des notifications par email</p>
                      </div>
                      <mat-slide-toggle color="primary" formControlName="emailNotifications"></mat-slide-toggle>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="preference-item">
                      <div>
                        <h4>Nouveaux talibés</h4>
                        <p>Être notifié des nouveaux inscrits</p>
                      </div>
                      <mat-slide-toggle color="primary" formControlName="newStudentsNotifications"></mat-slide-toggle>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="preference-item">
                      <div>
                        <h4>Rappels de cours</h4>
                        <p>Recevoir des rappels avant les cours</p>
                      </div>
                      <mat-slide-toggle color="primary" formControlName="courseReminders"></mat-slide-toggle>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="preference-item">
                      <div>
                        <h4>Messages administratifs</h4>
                        <p>Notifications des messages de l'administration</p>
                      </div>
                      <mat-slide-toggle color="primary" formControlName="adminMessages"></mat-slide-toggle>
                    </div>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Apparence -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>palette</mat-icon>
                  Apparence
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="appearanceForm">
                  <div class="form-grid-single">
                    <mat-form-field appearance="outline">
                      <mat-label>Thème</mat-label>
                      <mat-select formControlName="theme">
                        <mat-option value="light">Clair</mat-option>
                        <mat-option value="dark">Sombre</mat-option>
                        <mat-option value="auto">Automatique</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Langue</mat-label>
                      <mat-select formControlName="language">
                        <mat-option value="fr">Français</mat-option>
                        <mat-option value="ar">Arabe</mat-option>
                        <mat-option value="wo">Wolof</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Densité d'affichage</mat-label>
                      <mat-select formControlName="density">
                        <mat-option value="comfortable">Confortable</mat-option>
                        <mat-option value="compact">Compact</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Paramètres de données -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>data_saver_off</mat-icon>
                  Paramètres de données
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="dataForm">
                  <div class="preferences-list">
                    <div class="preference-item">
                      <div>
                        <h4>Mode hors ligne</h4>
                        <p>Permettre l'accès sans connexion internet</p>
                      </div>
                      <mat-slide-toggle color="primary" formControlName="offlineMode"></mat-slide-toggle>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="preference-item">
                      <div>
                        <h4>Préchargement des données</h4>
                        <p>Télécharger les données à l'avance</p>
                      </div>
                      <mat-slide-toggle color="primary" formControlName="preloadData"></mat-slide-toggle>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="preference-item">
                      <div>
                        <h4>Limite de données</h4>
                        <p>Économiser l'utilisation des données mobiles</p>
                      </div>
                      <mat-slide-toggle color="primary" formControlName="dataSaver"></mat-slide-toggle>
                    </div>
                  </div>

                  <div class="data-actions">
                    <button mat-button color="warn" (click)="clearCache()" [disabled]="isClearingCache">
                      @if (isClearingCache) {
                        <mat-spinner diameter="16" class="button-spinner"></mat-spinner>
                      } @else {
                        <mat-icon>delete_sweep</mat-icon>
                      }
                      {{ isClearingCache ? 'Nettoyage...' : 'Vider le cache' }}
                    </button>
                    <button mat-button color="primary" (click)="exportData()" [disabled]="isExportingData">
                      @if (isExportingData) {
                        <mat-spinner diameter="16" class="button-spinner"></mat-spinner>
                      } @else {
                        <mat-icon>download</mat-icon>
                      }
                      {{ isExportingData ? 'Export...' : 'Exporter mes données' }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  </div>
</app-layout>
  `,
  styles: [`
    .profile-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* En-tête */
.profile-header {
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  gap: 40px;
  padding: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-large {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.avatar-large mat-icon {
  font-size: 80px;
  width: 80px;
  height: 80px;
}

.upload-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  backdrop-filter: blur(10px);
}

.info-section {
  flex: 1;
}

.info-section h1 {
  margin: 0 0 10px 0;
  font-size: 36px;
  font-weight: 600;
}

.subtitle {
  margin: 0 0 20px 0;
  font-size: 18px;
  opacity: 0.9;
}

.contact-info {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.contact-item mat-icon {
  font-size: 20px;
  width: 20px;
  height: 20px;
}

/* Onglets */
.profile-tabs {
  margin-top: 30px;
}

.tab-content {
  padding: 30px 0;
}

/* Cartes */
mat-card {
  margin-bottom: 20px;
}

mat-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px !important;
}

/* Formulaires */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.form-grid-single {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
  margin-top: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

mat-form-field {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

/* Mot de passe */
.password-requirements {
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.password-requirements h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  margin-bottom: 8px;
  font-size: 13px;
  color: #ff4444;
  display: flex;
  align-items: center;
}

.password-requirements li.valid {
  color: #00C851;
}

.password-requirements li::before {
  content: '✗';
  margin-right: 8px;
}

.password-requirements li.valid::before {
  content: '✓';
}

/* Préférences */
.preferences-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  transition: background-color 0.2s;
}

.preference-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.preference-item h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.preference-item p {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* Sessions */
.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.session-info mat-icon {
  font-size: 24px;
  width: 24px;
  height: 24px;
  color: #666;
}

.session-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.session-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.session-actions {
  margin-top: 20px;
  text-align: right;
}

/* Actions données */
.data-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* États et utilitaires */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.no-data mat-icon {
  font-size: 48px;
  height: 48px;
  width: 48px;
  margin-bottom: 16px;
}

.button-spinner {
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

mat-error {
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .session-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .session-info {
    width: 100%;
  }
  
  .session-actions {
    align-self: flex-end;
  }
  
  .data-actions {
    flex-direction: column;
    align-items: flex-end;
  }
  
  .header-content {
    padding: 20px;
    gap: 30px;
  }
  
  .avatar-large {
    width: 120px;
    height: 120px;
  }
  
  .avatar-large mat-icon {
    font-size: 60px;
    width: 60px;
    height: 60px;
  }
  
  .info-section h1 {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 16px;
  }
  
  .form-grid-single {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 10px;
  }
  
  .tab-content {
    padding: 15px 0;
  }
  
  .header-content {
    padding: 15px;
    gap: 20px;
  }
  
  .avatar-section {
    gap: 15px;
  }
  
  .avatar-large {
    width: 100px;
    height: 100px;
  }
  
  .avatar-large mat-icon {
    font-size: 50px;
    width: 50px;
    height: 50px;
  }
  
  .info-section h1 {
    font-size: 24px;
  }
  
  .contact-info {
    margin-top: 15px;
    gap: 8px;
  }
  
  .contact-item {
    font-size: 14px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-actions button {
    width: 100%;
  }
  
  .data-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .data-actions button {
    width: 100%;
  }
}
  `]
})
export class EnseignantProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private enseignantService = inject(EnseignantService);
  private authService = inject(AuthService);
  private passwordService = inject(PasswordService);
  private snackBar = inject(MatSnackBar);

  enseignant: Enseignant | null = null;
  currenteEnseignant: Enseignant | null = null;
  
  // Formulaires principaux
  personalForm!: FormGroup;
  academicForm!: FormGroup;
  securityForm!: FormGroup;
  
  // Formulaires de préférences
  notificationsForm!: FormGroup;
  appearanceForm!: FormGroup;
  dataForm!: FormGroup;
  
  // États de chargement
  isLoadingProfile = true;
  isSaving = false;
  isChangingPassword = false;
  isTerminatingSessions = false;
  isClearingCache = false;
  isExportingData = false;

  // Propriétés calculées pour les critères de mot de passe
  get passwordHasMinLength(): boolean {
    const password = this.securityForm.get('newPassword')?.value;
    return password && password.length >= 8;
  }

  get passwordHasUppercase(): boolean {
    const password = this.securityForm.get('newPassword')?.value;
    return password && /[A-Z]/.test(password);
  }

  get passwordHasLowercase(): boolean {
    const password = this.securityForm.get('newPassword')?.value;
    return password && /[a-z]/.test(password);
  }

  get passwordHasNumber(): boolean {
    const password = this.securityForm.get('newPassword')?.value;
    return password && /\d/.test(password);
  }

  get passwordHasSpecial(): boolean {
    const password = this.securityForm.get('newPassword')?.value;
    return password && /[@$!%*?&]/.test(password);
  }

  ngOnInit(): void {
    this.initForms();
    this.loadEnseignantData();
    
    // Écouter les changements du nouveau mot de passe pour valider les critères
    this.securityForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.updatePasswordRequirements(password);
    });

    // Sauvegarder automatiquement les préférences
    this.setupAutoSave();
  }

  initForms(): void {
    // Formulaires existants
    this.personalForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      date_naissance: [''],
      lieu_naissance: [''],
      sexe: [''],
      nationalite: [''],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9\+\s\-\(\)]{8,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      adresse: [''],
      ville: [''],
      code_postal: ['']
    });

    this.academicForm = this.fb.group({
      specialite: ['', Validators.required],
      grade: [''],
      diplome: [''],
      diplome_origine: [''],
      annee_diplome: ['', [Validators.min(1900), Validators.max(new Date().getFullYear())]],
      diplomes_supplementaires: [''],
      date_recrutement: [''],
      statut: [''],
      biographie: ['']
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Nouveaux formulaires
    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      newStudentsNotifications: [true],
      courseReminders: [true],
      adminMessages: [true]
    });

    this.appearanceForm = this.fb.group({
      theme: ['light'],
      language: ['fr'],
      density: ['comfortable']
    });

    this.dataForm = this.fb.group({
      offlineMode: [false],
      preloadData: [true],
      dataSaver: [false]
    });
  }

  setupAutoSave(): void {
    // Sauvegarder automatiquement les préférences quand elles changent
    this.notificationsForm.valueChanges.subscribe(() => {
      this.savePreferences();
    });

    this.appearanceForm.valueChanges.subscribe(() => {
      this.savePreferences();
    });

    this.dataForm.valueChanges.subscribe(() => {
      this.savePreferences();
    });
  }

  // Validateur personnalisé pour vérifier la correspondance des mots de passe
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    return newPassword && confirmPassword && newPassword !== confirmPassword 
      ? { mismatch: true } 
      : null;
  }

  updatePasswordRequirements(password: string): void {
    // Cette méthode met à jour les critères visuels
    // Les getters ci-dessus sont utilisés dans le template
  }

  loadEnseignantData(): void {
    this.isLoadingProfile = true;
    this.currenteEnseignant = this.authService.getCurrentUser();
    const userId = this.currenteEnseignant?.id;
    console.log("Donner enseignant",this.currenteEnseignant);
    
    if (!userId) {
      this.snackBar.open('Veuillez vous connecter', 'Fermer', { duration: 3000 });
      this.isLoadingProfile = false;
      return;
    }

    this.enseignantService.getById(Number(userId)).pipe(
      finalize(() => this.isLoadingProfile = false)
    ).subscribe({
      next: (data) => {
        this.enseignant = data;
        this.personalForm.patchValue(data);
        this.academicForm.patchValue(data);
        
        // Charger les préférences depuis le localStorage
        this.loadPreferences();
      },
      error: (error) => {
        console.error('Erreur chargement profil:', error);
        this.snackBar.open('Erreur lors du chargement du profil', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadPreferences(): void {
    // Charger les préférences depuis le localStorage
    const preferences = localStorage.getItem('enseignant_preferences');
    if (preferences) {
      try {
        const parsed = JSON.parse(preferences);
        this.notificationsForm.patchValue(parsed.notifications || {});
        this.appearanceForm.patchValue(parsed.appearance || {});
        this.dataForm.patchValue(parsed.data || {});
      } catch (error) {
        console.error('Erreur chargement préférences:', error);
      }
    }
  }

  savePreferences(): void {
    const preferences = {
      notifications: this.notificationsForm.value,
      appearance: this.appearanceForm.value,
      data: this.dataForm.value
    };
    
    localStorage.setItem('enseignant_preferences', JSON.stringify(preferences));
  }

  getExperience(): number {
    if (!this.enseignant?.date_recrutement) return 0;
    
    try {
      const dateRecrutement = new Date(this.enseignant.date_recrutement);
      const today = new Date();
      
      // Calcul précis en années
      const diffTime = Math.abs(today.getTime() - dateRecrutement.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      
      return Math.floor(diffYears);
    } catch {
      return 0;
    }
  }

  savePersonalInfo(): void {
    if (this.personalForm.valid && this.enseignant?.id) {
      this.isSaving = true;
      
      this.enseignantService.update(this.enseignant.id, this.personalForm.value)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: () => {
            this.snackBar.open('Informations enregistrées avec succès', 'Fermer', { duration: 3000 });
            this.loadEnseignantData();
          },
          error: (error) => {
            console.error('Erreur enregistrement:', error);
            this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
          }
        });
    }
  }

  saveAcademicInfo(): void {
    if (this.academicForm.valid && this.enseignant?.id) {
      this.isSaving = true;
      
      this.enseignantService.update(this.enseignant.id, this.academicForm.value)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: () => {
            this.snackBar.open('Informations académiques enregistrées', 'Fermer', { duration: 3000 });
            this.loadEnseignantData();
          },
          error: (error) => {
            console.error('Erreur enregistrement académique:', error);
            this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
          }
        });
    }
  }

  changePassword(): void {
    if (this.securityForm.valid) {
      this.isChangingPassword = true;
      
      const passwordData = {
        currentPassword: this.securityForm.get('currentPassword')?.value,
        newPassword: this.securityForm.get('newPassword')?.value,
        confirmPassword: this.securityForm.get('confirmPassword')?.value
      };

      this.passwordService.changePassword(passwordData)
        .pipe(finalize(() => this.isChangingPassword = false))
        .subscribe({
          next: () => {
            this.snackBar.open('Mot de passe changé avec succès', 'Fermer', { duration: 3000 });
            this.securityForm.reset();
          },
          error: (error) => {
            console.error('Erreur changement mot de passe:', error);
            let errorMessage = 'Erreur lors du changement de mot de passe';
            
            if (error.message?.includes('current password')) {
              errorMessage = 'Mot de passe actuel incorrect';
            } else if (error.message?.includes('same')) {
              errorMessage = 'Le nouveau mot de passe doit être différent de l\'ancien';
            }
            
            this.snackBar.open(errorMessage, 'Fermer', { duration: 3000 });
          }
        });
    }
  }

  cancelEdit(): void {
    // Réinitialiser les formulaires aux valeurs originales
    if (this.enseignant) {
      this.personalForm.patchValue(this.enseignant);
      this.academicForm.patchValue(this.enseignant);
      this.personalForm.markAsPristine();
      this.academicForm.markAsPristine();
    }
  }

  // Nouvelles méthodes pour le template
  terminateSession(): void {
    this.isTerminatingSessions = true;
    
    // Simuler une requête API pour terminer une session
    setTimeout(() => {
      this.isTerminatingSessions = false;
      this.snackBar.open('Session terminée avec succès', 'Fermer', { duration: 3000 });
    }, 1000);
  }

  terminateAllSessions(): void {
    this.isTerminatingSessions = true;
    
    // Simuler une requête API pour terminer toutes les sessions
    setTimeout(() => {
      this.isTerminatingSessions = false;
      this.snackBar.open('Toutes les sessions ont été terminées', 'Fermer', { duration: 3000 });
    }, 1500);
  }

  clearCache(): void {
    this.isClearingCache = true;
    
    // Simuler le nettoyage du cache
    setTimeout(() => {
      this.isClearingCache = false;
      
      // Nettoyer le localStorage des préférences
      localStorage.removeItem('enseignant_preferences');
      
      // Réinitialiser les formulaires de préférences
      this.notificationsForm.reset({
        emailNotifications: true,
        newStudentsNotifications: true,
        courseReminders: true,
        adminMessages: true
      });
      
      this.appearanceForm.reset({
        theme: 'light',
        language: 'fr',
        density: 'comfortable'
      });
      
      this.dataForm.reset({
        offlineMode: false,
        preloadData: true,
        dataSaver: false
      });
      
      this.snackBar.open('Cache nettoyé avec succès', 'Fermer', { duration: 3000 });
    }, 1000);
  }

  exportData(): void {
    this.isExportingData = true;
    
    // Simuler l'export de données
    setTimeout(() => {
      this.isExportingData = false;
      
      // Créer un objet avec les données à exporter
      const dataToExport = {
        enseignant: this.enseignant,
        preferences: {
          notifications: this.notificationsForm.value,
          appearance: this.appearanceForm.value,
          data: this.dataForm.value
        },
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      // Créer un blob avec les données
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = `enseignant-data-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Libérer l'URL
      window.URL.revokeObjectURL(url);
      
      this.snackBar.open('Données exportées avec succès', 'Fermer', { duration: 3000 });
    }, 2000);
  }

  // Méthode pour activer la 2FA (exemple)
  enableTwoFactorAuth(): void {
    // Cette méthode pourrait être appelée depuis le bouton "Activer la 2FA"
    this.snackBar.open('Fonctionnalité 2FA à implémenter', 'Fermer', { duration: 3000 });
  }

  // Méthode utilitaire pour l'upload de photo (exemple)
  uploadPhoto(): void {
    // Cette méthode pourrait être appelée depuis le bouton "Changer la photo"
    this.snackBar.open('Fonctionnalité d\'upload de photo à implémenter', 'Fermer', { duration: 3000 });
  }

  // Méthode utilitaire pour obtenir le statut des critères de mot de passe
  getPasswordCriteriaStatus(): {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  } {
    const password = this.securityForm.get('newPassword')?.value || '';
    
    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
  }
}