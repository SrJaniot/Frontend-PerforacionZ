import { TestBed } from '@angular/core/testing';

import { MisProyectosService } from './mis-proyectos-service';

describe('MisProyectosService', () => {
  let service: MisProyectosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MisProyectosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
