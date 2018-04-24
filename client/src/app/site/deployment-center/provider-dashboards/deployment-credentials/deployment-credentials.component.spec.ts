import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentCredentialsComponent } from './deployment-credentials.component';

describe('DeploymentCredentialsComponent', () => {
  let component: DeploymentCredentialsComponent;
  let fixture: ComponentFixture<DeploymentCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeploymentCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymentCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
