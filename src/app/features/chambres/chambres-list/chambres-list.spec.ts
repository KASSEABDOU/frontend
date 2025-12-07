import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChambresList } from './chambres-list';

describe('ChambresList', () => {
  let component: ChambresList;
  let fixture: ComponentFixture<ChambresList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChambresList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChambresList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
