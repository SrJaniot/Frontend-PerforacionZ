import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent {

  // variable que toma la fecha actual y la formatea en español
  currentDate: string = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  stats = [
    { label: 'Usuarios Activos', value: '1,248', change: '+12%', up: true, color: 'blue', icon: 'users' },
    { label: 'Proyectos', value: '38', change: '+3', up: true, color: 'emerald', icon: 'briefcase' },
    { label: 'Items Inventario', value: '5,714', change: '-2.4%', up: false, color: 'amber', icon: 'package' },
    { label: 'Ingresos del Mes', value: '$84,240', change: '+8.1%', up: true, color: 'cyan', icon: 'dollar' },
  ];

  recentActivity = [
    { user: 'Carlos Méndez', action: 'creó el proyecto', target: '"App Mobile v2"', time: 'Hace 10 min', avatar: 'CM' },
    { user: 'Laura Torres', action: 'agregó item al', target: 'Inventario #A-0421', time: 'Hace 32 min', avatar: 'LT' },
    { user: 'Sistema', action: 'generó el reporte', target: 'Mensual Abril 2025', time: 'Hace 1 hr', avatar: 'SY' },
    { user: 'Ana Restrepo', action: 'actualizó usuario', target: 'Juan Pablo R.', time: 'Hace 2 hrs', avatar: 'AR' },
  ];

  topProjects = [
    { name: 'ERP Cloud Migration', progress: 78, status: 'En curso', statusType: 'warning' },
    { name: 'Portal de Clientes', progress: 92, status: 'Completando', statusType: 'success' },
    { name: 'App Mobile Nexus', progress: 45, status: 'En curso', statusType: 'warning' },
    { name: 'BI Dashboard', progress: 20, status: 'Iniciando', statusType: 'info' },
  ];
}
