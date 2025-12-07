import { TestBed } from '@angular/core/testing';

import { Batiment } from './batiment';

describe('Batiment', () => {
  let service: Batiment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Batiment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
