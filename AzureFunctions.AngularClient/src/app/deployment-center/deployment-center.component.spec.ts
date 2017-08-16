import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentCenterComponent } from './deployment-center.component';

describe('DeploymentCenterComponent', () => {
  let component: DeploymentCenterComponent;
  let fixture: ComponentFixture<DeploymentCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeploymentCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymentCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
