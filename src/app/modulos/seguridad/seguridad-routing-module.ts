import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { CerrarSesion } from './cerrar-sesion/cerrar-sesion';
import { ValidarSesionInactivaGuard } from '../../guardianes/validar-sesion-inactiva.guard';

const routes: Routes = [

  {
    path: 'login',
    component: Login,
    //canActivate: [ValidarSesionInactivaGuard]


  },
  {
    path: 'cerrar-sesion',
    component: CerrarSesion,
  },
  //ruta por defecto para redirigir a cerrar-sesion si no se encuentra la ruta
  {
    path: '**',
    redirectTo: 'cerrar-sesion'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeguridadRoutingModule {}
