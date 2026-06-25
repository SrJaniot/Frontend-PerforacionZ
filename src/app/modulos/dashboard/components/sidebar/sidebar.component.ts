import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  nombreUsuario: string = '';
  PrimerasLetrasNombre: string = '';
  roleUsuario: string = '';


  constructor(
    private router: Router,
    private servicioSeguridad: SeguridadService,


  ) { }

  ngOnInit() {
    //obtener datos del usuario activo en la sesion
    // aqui capturamos los datos del usuario activo en la sesion
    const usuarioActivo = this.servicioSeguridad.ObtenerDatosUsuarioIdentificadoSESION();
    this.servicioSeguridad.ObtenerRolUsuario().subscribe(
      (datos) => {
        console.log(datos);
        this.roleUsuario = datos.DATOS?.nombre_rol!;
      },
      (error) => {
        console.log(error);
        //this.toast.error({detail:"Error al obtener el rol del usuario",summary:"Error",duration:5000, position:'topCenter'});
        console.log('Error al obtener el rol del usuario');
      }
    );

    console.log('Usuario activo en la sesión:', usuarioActivo);
    //capturar nombre del usuario activo
    if (usuarioActivo && usuarioActivo.usuario) {
      this.nombreUsuario = usuarioActivo.usuario.nombre || '';
      //capturar las primeras letras del nombre del usuario activo
      this.PrimerasLetrasNombre = this.nombreUsuario.split(' ').map(n => n[0]).join('').toUpperCase();
    }







    // obtener los items del menu lateral -----------------------------------------
    this.listaMenus = this.servicioSeguridad.ObtenerItemMenuLateral();

    const itemsGestion: NavItem[] = this.listaMenus.map(menu => ({
      label: menu.texto!,
      icon: menu.icono!,
      route: menu.ruta!
    }));

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

    console.log(this.navGroups);
  }





  // metodo cerrar sesion
  cerrarSesion() {
    // Aquí puedes agregar la lógica para cerrar sesión, como limpiar tokens, redirigir al login, etc.
    this.router.navigate(['/seguridad/cerrar-sesion']);

  }
}
