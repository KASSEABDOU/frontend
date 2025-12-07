import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaarasMap } from './daaras-map';

describe('DaarasMap', () => {
  let component: DaarasMap;
  let fixture: ComponentFixture<DaarasMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaarasMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaarasMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
