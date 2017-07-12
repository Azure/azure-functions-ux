import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PairListComponent } from './pair-list.component';

describe('PairListComponent', () => {
  let component: PairListComponent;
  let fixture: ComponentFixture<PairListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PairListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
