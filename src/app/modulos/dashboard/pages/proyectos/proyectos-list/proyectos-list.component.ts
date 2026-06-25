import { Component } from '@angular/core';

@Component({
  selector: 'app-proyectos-list',
  templateUrl: './proyectos-list.component.html',
  styleUrls: ['./proyectos-list.component.scss'],
  standalone: false
})
export class ProyectosListComponent {
  view: 'cards' | 'list' = 'cards';
  showModal = false;

  projects = [
    {
      id: 1, name: 'ERP Cloud Migration', desc: 'Migración completa del ERP on-premise a infraestructura cloud AWS.',
      progress: 78, status: 'En curso', priority: 'Alta', team: ['CM', 'LT', 'AR'],
      deadline: '30/06/2025', budget: '$120,000', color: 'blue'
    },
    {
      id: 2, name: 'Portal de Clientes', desc: 'Desarrollo del portal web para clientes con autogestión de servicios.',
      progress: 92, status: 'Completando', priority: 'Alta', team: ['VG', 'JP'],
      deadline: '15/05/2025', budget: '$45,000', color: 'emerald'
    },
    {
      id: 3, name: 'App Mobile Nexus', desc: 'Aplicación móvil para iOS y Android de gestión interna.',
      progress: 45, status: 'En curso', priority: 'Media', team: ['JP', 'MC', 'VG'],
      deadline: '01/09/2025', budget: '$80,000', color: 'amber'
    },
    {
      id: 4, name: 'BI Dashboard', desc: 'Panel de inteligencia de negocios con analítica avanzada.',
      progress: 20, status: 'Iniciando', priority: 'Baja', team: ['AR', 'LT'],
      deadline: '15/10/2025', budget: '$30,000', color: 'cyan'
    },
    {
      id: 5, name: 'Seguridad IT Audit', desc: 'Auditoría completa de seguridad informática y SGSI.',
      progress: 60, status: 'En curso', priority: 'Alta', team: ['CM'],
      deadline: '20/05/2025', budget: '$15,000', color: 'red'
    },
    {
      id: 6, name: 'CRM Integración', desc: 'Integración CRM con plataformas de marketing digital.',
      progress: 100, status: 'Completado', priority: 'Baja', team: ['LT', 'AR'],
      deadline: '01/04/2025', budget: '$22,000', color: 'purple'
    }
  ];

  priorityClass(p: string) {
    if (p === 'Alta') return 'badge-danger';
    if (p === 'Media') return 'badge-warning';
    return 'badge-neutral';
  }

  statusClass(s: string) {
    if (s === 'Completado') return 'badge-success';
    if (s === 'Completando') return 'badge-info';
    if (s === 'En curso') return 'badge-warning';
    return 'badge-neutral';
  }
}
