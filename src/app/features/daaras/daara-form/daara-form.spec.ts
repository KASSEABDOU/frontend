import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaaraForm } from './daara-form';

describe('DaaraForm', () => {
  let component: DaaraForm;
  let fixture: ComponentFixture<DaaraForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaaraForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaaraForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
