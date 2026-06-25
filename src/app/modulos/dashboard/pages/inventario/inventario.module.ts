import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioRoutingModule } from './inventario-routing.module';
import { InventarioListComponent } from './inventario-list/inventario-list.component';

@NgModule({
  declarations: [InventarioListComponent],
  imports: [CommonModule, FormsModule, InventarioRoutingModule]
})
export class InventarioModule {}
