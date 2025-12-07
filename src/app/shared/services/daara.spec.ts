import { TestBed } from '@angular/core/testing';

import { Daara } from './daara';

describe('Daara', () => {
  let service: Daara;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Daara);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
