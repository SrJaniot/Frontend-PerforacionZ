import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { InventarioRoutingModule } from './inventario-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InventarioRoutingModule]
})
export class InventarioModule {}
