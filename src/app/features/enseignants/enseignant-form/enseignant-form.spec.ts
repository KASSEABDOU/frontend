import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnseignantForm } from './enseignant-form';

describe('EnseignantForm', () => {
  let component: EnseignantForm;
  let fixture: ComponentFixture<EnseignantForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnseignantForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnseignantForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
