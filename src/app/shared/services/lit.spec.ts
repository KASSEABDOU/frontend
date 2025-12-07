import { TestBed } from '@angular/core/testing';

import { Lit } from './lit';

describe('Lit', () => {
  let service: Lit;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lit);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
