import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioActualizarUsuario } from './formulario-actualizar-usuario';

describe('FormularioActualizarUsuario', () => {
  let component: FormularioActualizarUsuario;
  let fixture: ComponentFixture<FormularioActualizarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormularioActualizarUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioActualizarUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
