import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeguridadRoutingModule } from './seguridad-routing-module';
import { Login } from './login/login';

//imports para que mis formularios funcionen (formgroup, formbuilder, validators)
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CerrarSesion } from './cerrar-sesion/cerrar-sesion';

@NgModule({
  declarations: [Login, CerrarSesion],
  imports: [CommonModule, SeguridadRoutingModule, FormsModule, ReactiveFormsModule],
})
export class SeguridadModule {}
