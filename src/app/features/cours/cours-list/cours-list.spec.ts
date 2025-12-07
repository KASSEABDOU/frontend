import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursList } from './cours-list';

describe('CoursList', () => {
  let component: CoursList;
  let fixture: ComponentFixture<CoursList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
