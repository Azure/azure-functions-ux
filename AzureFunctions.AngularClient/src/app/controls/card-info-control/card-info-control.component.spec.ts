import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardInfoControlComponent } from './card-info-control.component';

describe('CardInfoControlComponent', () => {
  let component: CardInfoControlComponent;
  let fixture: ComponentFixture<CardInfoControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardInfoControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardInfoControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
