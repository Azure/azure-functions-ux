import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepCompleteComponent } from './step-complete.component';

describe('StepCompleteComponent', () => {
  let component: StepCompleteComponent;
  let fixture: ComponentFixture<StepCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
