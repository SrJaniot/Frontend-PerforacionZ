import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MisProyectosRoutingModule } from './mis-proyectos-routing.module';
import { MisProyectosListComponent } from './mis-proyectos-list/mis-proyectos-list.component';
import { MisProyectoDetallePageComponent } from './mis-proyecto-detalle-page/mis-proyecto-detalle-page.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MisProyectosRoutingModule]
})
export class MisProyectosModule {}
