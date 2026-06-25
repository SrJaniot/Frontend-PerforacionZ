import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectosRoutingModule } from './proyectos-routing.module';
import { ProyectosListComponent } from './proyectos-list/proyectos-list.component';

@NgModule({
  declarations: [ProyectosListComponent],
  imports: [CommonModule, FormsModule, ProyectosRoutingModule]
})
export class ProyectosModule {}
