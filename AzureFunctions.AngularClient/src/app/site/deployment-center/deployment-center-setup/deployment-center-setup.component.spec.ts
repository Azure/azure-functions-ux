import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentCenterSetupComponent } from './deployment-center-setup.component';

describe('DeploymentCenterSetupComponent', () => {
  let component: DeploymentCenterSetupComponent;
  let fixture: ComponentFixture<DeploymentCenterSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeploymentCenterSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymentCenterSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
