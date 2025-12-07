import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaarasList } from './daaras-list';

describe('DaarasList', () => {
  let component: DaarasList;
  let fixture: ComponentFixture<DaarasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaarasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaarasList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
