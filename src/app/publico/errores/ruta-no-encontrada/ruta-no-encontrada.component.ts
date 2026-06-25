import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ruta-no-encontrada',
  templateUrl: './ruta-no-encontrada.component.html',
  styleUrl: './ruta-no-encontrada.component.css'
})
export class RutaNoEncontradaComponent {

  constructor(
    private router: Router,
  ) { }

  //funcion para cerrar sesion despues de que pase 15 segundos
  ngOnInit() {
    setTimeout(() => {
      this.redirigirACerrarSesion();
    }, 15000);
  }


  //funcion para redirigir a cerrar sesion
  redirigirACerrarSesion() {
    this.router.navigate(['/seguridad/cerrar-sesion']);
  }

}
