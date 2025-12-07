import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Uploade } from './uploade';

describe('Uploade', () => {
  let component: Uploade;
  let fixture: ComponentFixture<Uploade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Uploade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Uploade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
