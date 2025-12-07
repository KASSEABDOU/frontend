import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatimentsList } from './batiments-list';

describe('BatimentsList', () => {
  let component: BatimentsList;
  let fixture: ComponentFixture<BatimentsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatimentsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatimentsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
