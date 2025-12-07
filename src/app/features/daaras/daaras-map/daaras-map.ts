
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutComponent } from '../../../shared/components/layout/layout';
import { DaaraService } from '../../../shared/services/daara';
import { Daara } from '../../../core/models/user.model';

@Component({
  selector: 'app-daaras-map',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="map-container-wrapper">
        <mat-card class="map-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>map</mat-icon>
              Carte des Daaras au Sénégal
            </mat-card-title>
            <div class="header-actions">
              <button mat-raised-button color="primary" (click)="refreshMap()">
                <mat-icon>refresh</mat-icon>
                Actualiser
              </button>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div *ngIf="loading" class="loading-overlay">
              <mat-spinner></mat-spinner>
            </div>
            <div id="map" class="map-element"></div>
            
            <div class="map-legend">
              <h4>Légende</h4>
              <div class="legend-item">
                <span class="marker-icon daara-marker"></span>
                <span>Daara</span>
              </div>
              <div class="legend-item">
                <span class="info-text">Nombre total de daaras: {{daaras.length}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [`
    .map-container-wrapper {
      padding: 20px;
      height: calc(100vh - 100px);
    }

    .map-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    mat-card-content {
      flex: 1;
      position: relative;
      padding: 0 !important;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .map-element {
      width: 100%;
      height: 100%;
      min-height: 500px;
    }

    .map-legend {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
    }

    .map-legend h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: bold;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 5px 0;
      font-size: 13px;
    }

    .marker-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    .daara-marker {
      background: #667eea;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .info-text {
      color: #666;
      font-weight: 500;
    }
  `]
})
export class DaarasMapComponent implements OnInit, AfterViewInit {
  private daaraService = inject(DaaraService);
  
  private map!: L.Map;
  daaras: Daara[] = [];
  loading = true;

  // Coordonnées du Sénégal (centre approximatif)
  private senegalCoords: L.LatLngExpression = [14.4974, -14.4524];

  // Coordonnées fictives pour les villes du Sénégal
  private cityCoordinates: { [key: string]: L.LatLngExpression } = {
    'Dakar': [14.6928, -17.4467],
    'Thiès': [14.7886, -16.9260],
    'Saint-Louis': [16.0179, -16.5119],
    'Kaolack': [14.1487, -16.0761],
    'Ziguinchor': [12.5833, -16.2667],
    'Touba': [14.8500, -15.8833],
    'Louga': [15.6167, -16.2167],
    'Tambacounda': [13.7667, -13.6667],
    'Mbour': [14.4167, -16.9667],
    'Diourbel': [14.6500, -16.2333]
  };

  ngOnInit(): void {
    this.loadDaaras();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    // Fix pour les icônes Leaflet
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map('map').setView(this.senegalCoords, 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);
  }

  loadDaaras(): void {
    this.daaraService.getAll().subscribe({
      next: (data) => {
        this.daaras = data;
        this.addMarkersToMap();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement daaras:', error);
        this.loading = false;
      }
    });
  }

  addMarkersToMap(): void {
    if (!this.map) return;

    this.daaras.forEach(daara => {
      // Utiliser les coordonnées de la ville ou coordonnées par défaut
      const coords = this.getCoordinatesForDaara(daara);
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background: #667eea;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${daara.nombre_talibes}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(this.map);

      const popupContent = `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 10px 0; color: #667eea;">${daara.nom}</h3>
          <p style="margin: 5px 0;"><strong>Lieu:</strong> ${daara.lieu || 'Non spécifié'}</p>
          <p style="margin: 5px 0;"><strong>Propriétaire:</strong> ${daara.proprietaire || 'Non spécifié'}</p>
          <p style="margin: 5px 0;"><strong>Talibés:</strong> ${daara.nombre_talibes}</p>
          <p style="margin: 5px 0;"><strong>Enseignants:</strong> ${daara.nombre_enseignants}</p>
          <p style="margin: 5px 0;"><strong>Bâtiments:</strong> ${daara.nombre_batiments}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }

  getCoordinatesForDaara(daara: Daara): L.LatLngExpression {
    if (daara.lieu) {
      for (const [city, coords] of Object.entries(this.cityCoordinates)) {
        if (daara.lieu.toLowerCase().includes(city.toLowerCase())) {
          
          // Utiliser coords déjà fourni dans la boucle
          const [latBase, lngBase] = coords as [number, number];

          // Ajouter un léger décalage aléatoire
          const lat = latBase + (Math.random() - 0.5) * 0.1;
          const lng = lngBase + (Math.random() - 0.5) * 0.1;

          return [lat, lng];
        }
      }
    }

    // Coordonnées par défaut (Dakar)
    return [
      14.6928 + (Math.random() - 0.5) * 0.5,
      -17.4467 + (Math.random() - 0.5) * 0.5
    ];
  }


  refreshMap(): void {
    this.loading = true;
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
    this.loadDaaras();
  }
}