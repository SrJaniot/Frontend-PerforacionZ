import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadisticasRoutingModule } from './estadisticas-routing.module';
import { EstadisticasViewComponent } from './estadisticas-view/estadisticas-view.component';

@NgModule({
  declarations: [EstadisticasViewComponent],
  imports: [CommonModule, FormsModule, EstadisticasRoutingModule]
})
export class EstadisticasModule {}
