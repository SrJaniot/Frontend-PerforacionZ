import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { UsuariosListComponent } from './usuarios-list/usuarios-list.component';
import { FormularioActualizarUsuario } from './formulario-actualizar-usuario/formulario-actualizar-usuario';

@NgModule({
  declarations: [UsuariosListComponent, FormularioActualizarUsuario],
  imports: [CommonModule, FormsModule, UsuariosRoutingModule, FormsModule, ReactiveFormsModule],
})
export class UsuariosModule {}
