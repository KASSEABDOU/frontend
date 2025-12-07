// ============================================
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LayoutComponent } from '../../shared/components/layout/layout';
import { DaaraService } from '../../shared/services/daara';
import { TalibeService } from '../../shared/services/talibe';
import { EnseignantService } from '../../shared/services/enseignant';
import { CoursService } from '../../shared/services/cours';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  totalDaaras: number;
  totalTalibes: number;
  totalEnseignants: number;
  totalCours: number;
}

@Component({
  selector: 'app-dashboard-enhanced',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    BaseChartDirective,
    LayoutComponent
  ],
  template: `
    <app-layout>
      <div class="dashboard-container">
        <h1>Tableau de bord</h1>
        
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
        </div>

        <div *ngIf="!loading">
          <!-- Stats Cards -->
          <div class="stats-grid">
            <mat-card class="stat-card daara-card">
              <mat-card-content>
                <mat-icon>business</mat-icon>
                <h2>{{stats.totalDaaras}}</h2>
                <p>Daaras</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card talibe-card">
              <mat-card-content>
                <mat-icon>school</mat-icon>
                <h2>{{stats.totalTalibes}}</h2>
                <p>Talibés</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card enseignant-card">
              <mat-card-content>
                <mat-icon>person</mat-icon>
                <h2>{{stats.totalEnseignants}}</h2>
                <p>Enseignants</p>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card cours-card">
              <mat-card-content>
                <mat-icon>book</mat-icon>
                <h2>{{stats.totalCours}}</h2>
                <p>Cours</p>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Charts Section -->
          <mat-tab-group class="charts-section">
            <mat-tab label="Répartition">
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Répartition des effectifs</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-container">
                    <canvas baseChart
                      [data]="pieChartData"
                      [type]="pieChartType"
                      [options]="pieChartOptions">
                    </canvas>
                  </div>
                </mat-card-content>
              </mat-card>
            </mat-tab>

            <mat-tab label="Évolution">
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Évolution mensuelle</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-container">
                    <canvas baseChart
                      [data]="lineChartData"
                      [type]="lineChartType"
                      [options]="lineChartOptions">
                    </canvas>
                  </div>
                </mat-card-content>
              </mat-card>
            </mat-tab>

            <mat-tab label="Par Daara">
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Talibés par Daara</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-container">
                    <canvas baseChart
                      [data]="barChartData"
                      [type]="barChartType"
                      [options]="barChartOptions">
                    </canvas>
                  </div>
                </mat-card-content>
              </mat-card>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
    }

    .stat-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
    }

    .stat-card h2 {
      margin: 10px 0;
      font-size: 36px;
      font-weight: bold;
    }

    .stat-card p {
      margin: 0;
      font-size: 16px;
    }

    .daara-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .talibe-card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .enseignant-card {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .cours-card {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .charts-section {
      margin-top: 20px;
    }

    .chart-card {
      margin-top: 20px;
      min-height: 400px;
    }

    .chart-container {
      position: relative;
      height: 350px;
      padding: 20px;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .chart-container {
        height: 300px;
      }
    }
  `]
})
export class DashboardEnhancedComponent implements OnInit {
  private daaraService = inject(DaaraService);
  private talibeService = inject(TalibeService);
  private enseignantService = inject(EnseignantService);
  private coursService = inject(CoursService);

  stats: DashboardStats = {
    totalDaaras: 0,
    totalTalibes: 0,
    totalEnseignants: 0,
    totalCours: 0
  };
  loading = true;

  // Pie Chart
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: ['Talibés', 'Enseignants', 'Cours'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#f093fb', '#4facfe', '#43e97b']
    }]
  };
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // Line Chart
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Talibés',
        data: [45, 52, 58, 65, 72, 80],
        borderColor: '#f093fb',
        backgroundColor: 'rgba(240, 147, 251, 0.1)',
        tension: 0.4
      },
      {
        label: 'Enseignants',
        data: [8, 10, 11, 12, 14, 15],
        borderColor: '#4facfe',
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        tension: 0.4
      }
    ]
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // Bar Chart
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Nombre de talibés',
      data: [],
      backgroundColor: '#667eea'
    }]
  };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    forkJoin({
      daaras: this.daaraService.getAll(),
      talibes: this.talibeService.getAll(),
      enseignants: this.enseignantService.getAll(),
      cours: this.coursService.getAll()
    }).subscribe({
      next: (data) => {
        this.stats = {
          totalDaaras: data.daaras.length,
          totalTalibes: data.talibes.length,
          totalEnseignants: data.enseignants.length,
          totalCours: data.cours.length
        };

        // Update Pie Chart
        this.pieChartData.datasets[0].data = [
          this.stats.totalTalibes,
          this.stats.totalEnseignants,
          this.stats.totalCours
        ];

        // Update Bar Chart (Talibés par Daara)
        this.barChartData.labels = data.daaras.map(d => d.nom);
        this.barChartData.datasets[0].data = data.daaras.map(d => d.nombre_talibes);

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard:', error);
        this.loading = false;
      }
    });
  }
}