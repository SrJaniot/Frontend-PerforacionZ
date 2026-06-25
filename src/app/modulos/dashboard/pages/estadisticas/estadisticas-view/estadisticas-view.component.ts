import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';

@Component({
  selector: 'app-estadisticas-view',
  templateUrl: './estadisticas-view.component.html',
  styleUrls: ['./estadisticas-view.component.scss'],
  standalone: false
})
export class EstadisticasViewComponent {
  Math = Math;
  selectedPeriod = 'mes';

  kpis = [
    { label: 'Ingresos Totales', value: '$284,450', change: '+18.2%', up: true },
    { label: 'Usuarios Nuevos', value: '342', change: '+24.5%', up: true },
    { label: 'Proyectos Cerrados', value: '14', change: '-3', up: false },
    { label: 'Satisfacción', value: '94.3%', change: '+1.2%', up: true },
  ];

  months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  revenueData = [42, 58, 45, 70, 65, 84, 72, 90, 68, 78, 84, 95];
  maxRevenue = 100;

  barHeight(val: number): number {
    return (val / this.maxRevenue) * 100;
  }

  donutSegments = [
    { label: 'Tecnología', value: 45, color: '#3b82f6' },
    { label: 'Consultoría', value: 28, color: '#06b6d4' },
    { label: 'Soporte', value: 18, color: '#8b5cf6' },
    { label: 'Otro', value: 9, color: '#6b7280' },
  ];

  topMetrics = [
    { name: 'Ventas Online', value: 68400, progress: 87, color: 'blue' },
    { name: 'Soporte Tickets', value: 1240, progress: 62, color: 'cyan' },
    { name: 'NPS Score', value: 72, progress: 72, color: 'emerald' },
    { name: 'Conversión', value: 3.8, progress: 38, color: 'amber' },
  ];
}
