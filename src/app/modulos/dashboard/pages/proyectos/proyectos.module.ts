import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ProyectosRoutingModule } from './proyectos-routing.module';
import { ProyectosListComponent } from './proyectos-list/proyectos-list.component';
import { FormularioActualizarProyectoComponent } from './formulario-actualizar-proyecto/formulario-actualizar-proyecto';
import { ProyectoDetalleComponent } from './proyecto-detalle/proyecto-detalle.component';
import { ProyectoDetallePageComponent } from './proyecto-detalle-page/proyecto-detalle-page.component';

@NgModule({
  declarations: [ProyectosListComponent, FormularioActualizarProyectoComponent, ProyectoDetalleComponent, ProyectoDetallePageComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProyectosRoutingModule]
})
export class ProyectosModule {}
