import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProyectosSupervisorListComponent } from './proyectos-list/proyectos-list.component';
import { ProyectoSupervisorDetallePageComponent } from './proyecto-detalle-page/proyecto-detalle-page.component';

const routes: Routes = [

    { path: '', component: ProyectosSupervisorListComponent },
    { path: 'detalle/:id', component: ProyectoSupervisorDetallePageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisproyectosRoutingModule {}
