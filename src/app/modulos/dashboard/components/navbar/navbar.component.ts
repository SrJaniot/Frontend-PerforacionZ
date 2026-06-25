import { Component, Output, EventEmitter } from '@angular/core';
import { SeguridadService } from '../../../../servicios/seguridad';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: false
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  showNotifications = false;
  showProfile = false;
  nombreUsuario: string = '';
  correoUsuario: string = '';
  PrimerasLetrasNombre: string = '';
  roleUsuario: string = '';

  constructor(
    private servicioSeguridad: SeguridadService,
  ) {}

  ngOnInit() {
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
      this.correoUsuario = usuarioActivo.usuario.correo || '';
      //capturar las primeras letras del nombre del usuario activo
      this.PrimerasLetrasNombre = this.nombreUsuario.split(' ').map(n => n[0]).join('').toUpperCase();
    }



  }

  notifications = [
    { text: 'Nuevo usuario registrado', time: 'Hace 5 min', type: 'info' },
    { text: 'Proyecto "Alpha" actualizado', time: 'Hace 20 min', type: 'warning' },
    { text: 'Stock crítico en inventario', time: 'Hace 1 hr', type: 'danger' },
    { text: 'Reporte mensual generado', time: 'Hace 3 hrs', type: 'success' },
  ];




}
