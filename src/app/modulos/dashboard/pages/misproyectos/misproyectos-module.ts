import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MisproyectosRoutingModule } from './misproyectos-routing-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProyectosSupervisorListComponent } from './proyectos-list/proyectos-list.component';
import { ProyectoSupervisorDetallePageComponent } from './proyecto-detalle-page/proyecto-detalle-page.component';

@NgModule({
  declarations: [ProyectosSupervisorListComponent, ProyectoSupervisorDetallePageComponent],
  imports: [CommonModule, MisproyectosRoutingModule, ReactiveFormsModule,FormsModule],
})
export class MisproyectosModule {}
