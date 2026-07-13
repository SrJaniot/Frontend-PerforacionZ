import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MisProyectosListComponent } from './mis-proyectos-list/mis-proyectos-list.component';
import { MisProyectoDetallePageComponent } from './mis-proyecto-detalle-page/mis-proyecto-detalle-page.component';

const routes: Routes = [
  { path: '', component: MisProyectosListComponent },
  { path: 'detalle/:id', component: MisProyectoDetallePageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MisProyectosRoutingModule {}
