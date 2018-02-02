import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepSourceControlComponent } from './step-source-control.component';

describe('StepSourceControlComponent', () => {
  let component: StepSourceControlComponent;
  let fixture: ComponentFixture<StepSourceControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepSourceControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepSourceControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
