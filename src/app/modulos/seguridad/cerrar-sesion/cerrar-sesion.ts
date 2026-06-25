import { Component } from '@angular/core';
import { SeguridadService } from '../../../servicios/seguridad';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cerrar-sesion',
  standalone: false,
  templateUrl: './cerrar-sesion.html',
  styleUrl: './cerrar-sesion.css',
})
export class CerrarSesion {



  constructor(
    private servicioSeguridad: SeguridadService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.CerrarSesion();
  }
  async CerrarSesion() {
      await this.removerUsuarioActivo();
      this.delayNavigation(5000);
   }

   removerUsuarioActivo(): Promise<void> {
    return new Promise((resolve) => {
      this.servicioSeguridad.RemoverDatosUsuarioValidadoSesion();
      resolve();
    });
  }



  delayNavigation(ms: number): void {
    setTimeout(() => {
      window.location.href = '/seguridad/login';
    }, ms);
  }



}
