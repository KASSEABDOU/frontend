import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalibeForm } from './talibe-form';

describe('TalibeForm', () => {
  let component: TalibeForm;
  let fixture: ComponentFixture<TalibeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalibeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TalibeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
