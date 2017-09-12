import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepDeploymentSlotComponent } from './step-deployment-slot.component';

describe('StepDeploymentSlotComponent', () => {
  let component: StepDeploymentSlotComponent;
  let fixture: ComponentFixture<StepDeploymentSlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepDeploymentSlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepDeploymentSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
