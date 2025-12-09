export interface User {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'ENSEIGNANT' | 'TALIBE';
  adresse?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  age?: number;
  date_entree?: string;
  nombre_annees?: number;
  daara_id?: number;
  photo_url?: string;  // Nouveau
  photo_profil?: string;
  sexe?: string;
  nationalite?:string;
}

export interface Talibe extends User {
  pere?: string;
  mere?: string;
  niveau?: string;
  extrait_naissance?: boolean;
  chambre_id?: number;
  cours?: Cours[];
}

export interface Enseignant extends User {
  specialite?: string;
  telephone?: string;
  etat_civil?: string;
  grade?: string;
  cours?: Cours[];
  date_recrutement?:string;
  diplome?:string;
  diplome_origine?:string;
  statut?:string;
  biographie?:string;
  nb_annees?:string;

}

export interface Daara {
  id: number;
  nom: string;
  proprietaire?: string;
  nombre_talibes: number;
  nombre_enseignants: number;
  lieu?: string;
  nombre_batiments: number;
}


export interface Batiment {
  id: number;
  nom: string;
  nombre_chambres: number;
  daara_id: number;
}

export interface Chambre {
  id: number;
  numero: string;
  nb_lits: number;
  batiment_id: number;
}

export interface Lit {
  id: number;
  numero: string;
  chambre_id: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Cours {
  id: number;
  
  // Étape 1: Informations de base
  code: string;
  libelle: string;
  description?: string;
  
  // Étape 2: Configuration
  categorie: CoursCategorie;
  niveau: CoursNiveau;
  duree: number; // heures/semaine
  capacite_max: number;
  prerequis?: string;
  is_active: boolean;
  is_certificat: boolean;
  is_online: boolean;
  
  // Étape 3: Objectifs et contenu
  objectifs?: string;
  programme?: string;
  supports?: string;
  talibes?: Talibe[];
  nombre_talibes?:number;
  nombre_enseignants?:number;
  
}

// Enums pour les sélections
export enum CoursCategorie {
  CORAN = 'Coran',
  HADITH = 'Hadith',
  FIQH = 'Fiqh',
  TAFSIR = 'Tafsir',
  LANGUE_ARABE = 'Langue Arabe',
  SCIENCES_ISLAMIQUES = 'Sciences Islamiques',
  AUTRE = 'Autre'
}

export enum CoursNiveau {
  DEBUTANT = 'Débutant',
  INTERMEDIAIRE = 'Intermédiaire',
  AVANCE = 'Avancé',
  TOUS_NIVEAUX = 'Tous niveaux'
}

export enum CoursPrerequis {
  AUCUN = "",
  ALPHABETISATION_ARABE = 'Alphabétisation arabe',
  NIVEAU_PRECEDENT = 'Niveau précédent validé',
  AUTORISATION_ENSEIGNANT = 'Autorisation enseignant'
}