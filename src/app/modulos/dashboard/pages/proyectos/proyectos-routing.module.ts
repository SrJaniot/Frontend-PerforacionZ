import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProyectosListComponent } from './proyectos-list/proyectos-list.component';
import { ProyectoDetallePageComponent } from './proyecto-detalle-page/proyecto-detalle-page.component';

const routes: Routes = [
  { path: '', component: ProyectosListComponent },
  { path: 'detalle/:id', component: ProyectoDetallePageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProyectosRoutingModule {}
