import { TestBed } from '@angular/core/testing';

import { Talibe } from './talibe';

describe('Talibe', () => {
  let service: Talibe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Talibe);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
