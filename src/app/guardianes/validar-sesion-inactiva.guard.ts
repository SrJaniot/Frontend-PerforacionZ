import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SeguridadService } from '../servicios/seguridad';
import { NgToastService } from 'ng-angular-popup';


export const ValidarSesionInactivaGuard = () => {

  const servicioSeguridad = inject(SeguridadService);
  const router = inject(Router);
  const toast = inject(NgToastService);

  let existeSesion = servicioSeguridad.validacionDeSesion();
    if (existeSesion) {
      router.navigate(["/dashboard"]);
      toast.warning('ADVERTENCIA: Ya existe una sesión activa, no puede acceder a esta ruta','Advertencia', 5000,true,true,true);
      //toast.warning({ detail: "ADVERTENCIA", summary: "Navegación no permitida", duration: 5000, position: 'topCenter' });
      return false;
    }
    return true;
}
