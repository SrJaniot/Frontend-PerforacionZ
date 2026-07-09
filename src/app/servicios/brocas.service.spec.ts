import { TestBed } from '@angular/core/testing';

import { BrocasService } from './brocas.service';

describe('BrocasService', () => {
  let service: BrocasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrocasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
