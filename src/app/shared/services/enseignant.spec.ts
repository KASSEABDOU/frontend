import { TestBed } from '@angular/core/testing';

import { Enseignant } from './enseignant';

describe('Enseignant', () => {
  let service: Enseignant;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Enseignant);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
