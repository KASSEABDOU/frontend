import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatimentForm } from './batiment-form';

describe('BatimentForm', () => {
  let component: BatimentForm;
  let fixture: ComponentFixture<BatimentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatimentForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatimentForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
