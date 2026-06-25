import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RutaNoEncontradaComponent } from './publico/errores/ruta-no-encontrada/ruta-no-encontrada.component';

const routes: Routes = [

  {
    path: 'seguridad',
    loadChildren: () => import('./modulos/seguridad/seguridad-module').then(m => m.SeguridadModule),
    


  },

  {
    path: 'dashboard',
    loadChildren: () => import('./modulos/dashboard/dashboard-module').then(m => m.DashboardModule),

  },

  {
    path:'',
    redirectTo:'/seguridad/login',
    pathMatch:'full'
  },

  // RUTA NO ENCONTRADA TIENE QUE SER EL ULTIMO
  {
    path:'**',
    component: RutaNoEncontradaComponent,

  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
