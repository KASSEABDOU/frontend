import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnseignantsList } from './enseignants-list';

describe('EnseignantsList', () => {
  let component: EnseignantsList;
  let fixture: ComponentFixture<EnseignantsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnseignantsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnseignantsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
