import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SeguridadService } from '../../../../servicios/seguridad';
import { ItemMenuModel } from '../../../../Modelos/item.menu.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  badgeType?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  navGroups: NavGroup[] = [];
  listaMenus: ItemMenuModel[] = [];

  nombreUsuario = '';
  PrimerasLetrasNombre = '';
  roleUsuario = '';
  roleIdUsuario: number | null = null;

  constructor(
    private router: Router,
    private servicioSeguridad: SeguridadService
  ) {}

  ngOnInit(): void {
    const usuarioActivo = this.servicioSeguridad.ObtenerDatosUsuarioIdentificadoSESION();
    this.listaMenus = this.servicioSeguridad.ObtenerItemMenuLateral();

    this.servicioSeguridad.ObtenerRolUsuario().subscribe({
      next: datos => {
        this.roleUsuario = datos.DATOS?.nombre_rol ?? '';
        this.roleIdUsuario = Number(datos.DATOS?.rol ?? null);
        this.reconstruirNavegacion();
      },
      error: error => {
        console.log(error);
        console.log('Error al obtener el rol del usuario');
        this.reconstruirNavegacion();
      }
    });

    console.log('Usuario activo en la sesión:', usuarioActivo);
    if (usuarioActivo && usuarioActivo.usuario) {
      this.nombreUsuario = usuarioActivo.usuario.nombre || '';
      this.PrimerasLetrasNombre = this.nombreUsuario.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    this.reconstruirNavegacion();
  }

  private reconstruirNavegacion(): void {
    const itemsGestion: NavItem[] = this.listaMenus.map(menu => ({
      label: menu.texto ?? '',
      icon: menu.icono ?? '',
      route: menu.ruta ?? ''
    }));

    if (this.roleIdUsuario === 2 && !itemsGestion.some(item => item.route === '/dashboard/misproyectos')) {
      itemsGestion.push({
        label: 'Mis proyectos',
        icon: 'folder',
        route: '/dashboard/misproyectos'
      });
    }

    this.navGroups = [
      {
        title: 'Principal',
        items: [
          { label: 'Dashboard', icon: 'home', route: '/dashboard/home' }
        ]
      },
      {
        title: 'Gestión',
        items: itemsGestion
      },
      {
        title: 'Análisis',
        items: [
          { label: 'Estadísticas', icon: 'bar-chart', route: '/dashboard/estadisticas' }
        ]
      }
    ];
  }

  cerrarSesion(): void {
    this.router.navigate(['/seguridad/cerrar-sesion']);
  }
}
