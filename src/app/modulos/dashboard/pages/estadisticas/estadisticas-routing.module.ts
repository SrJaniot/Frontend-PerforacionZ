import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstadisticasViewComponent } from './estadisticas-view/estadisticas-view.component';

const routes: Routes = [
  { path: '', component: EstadisticasViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstadisticasRoutingModule {}
