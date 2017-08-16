import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentCenterOverviewComponent } from './deployment-center-overview.component';

describe('DeploymentCenterOverviewComponent', () => {
  let component: DeploymentCenterOverviewComponent;
  let fixture: ComponentFixture<DeploymentCenterOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeploymentCenterOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymentCenterOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
