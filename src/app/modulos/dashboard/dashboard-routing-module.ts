import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { ValidarSesionActivaGuard } from '../../guardianes/validar-sesion-activa.guard';
import { ValidarAdminGuard } from '../../guardianes/validar-admin.guard';

const routes: Routes = [

    {
    path: '',
    component: DashboardLayoutComponent,
    canActivate:[ValidarSesionActivaGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./pages/usuarios/usuarios.module').then(m => m.UsuariosModule)
      },
      {
        path: 'proyectos',
        loadChildren: () =>
          import('./pages/proyectos/proyectos.module').then(m => m.ProyectosModule)
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('./pages/inventario/inventario.module').then(m => m.InventarioModule)
      },
      {
        path: 'mis-proyectos',
        loadChildren: () =>
          import('./pages/misproyectos/misproyectos-module').then(m => m.MisproyectosModule)
      },
      {
        path: 'estadisticas',
        canActivate: [ValidarAdminGuard],
        loadChildren: () =>
          import('./pages/estadisticas/estadisticas.module').then(m => m.EstadisticasModule)
      }
    ]
  }




];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
