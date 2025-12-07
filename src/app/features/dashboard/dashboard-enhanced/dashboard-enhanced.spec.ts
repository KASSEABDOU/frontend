import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEnhanced } from './dashboard-enhanced';

describe('DashboardEnhanced', () => {
  let component: DashboardEnhanced;
  let fixture: ComponentFixture<DashboardEnhanced>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEnhanced]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEnhanced);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
