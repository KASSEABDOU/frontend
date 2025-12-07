import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalibeList } from './talibe-list';

describe('TalibeList', () => {
  let component: TalibeList;
  let fixture: ComponentFixture<TalibeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalibeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TalibeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
