import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LitsList } from './lits-list';

describe('LitsList', () => {
  let component: LitsList;
  let fixture: ComponentFixture<LitsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LitsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LitsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
