import { TestBed } from '@angular/core/testing';

import { DetailsTalibes } from './details-talibes';

describe('DetailsTalibes', () => {
  let service: DetailsTalibes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailsTalibes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
