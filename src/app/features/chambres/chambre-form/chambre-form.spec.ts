import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChambreForm } from './chambre-form';

describe('ChambreForm', () => {
  let component: ChambreForm;
  let fixture: ComponentFixture<ChambreForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChambreForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChambreForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
