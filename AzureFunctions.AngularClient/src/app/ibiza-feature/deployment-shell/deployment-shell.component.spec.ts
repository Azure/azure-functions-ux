import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentShellComponent } from './deployment-shell.component';

describe('DeploymentShellComponent', () => {
  let component: DeploymentShellComponent;
  let fixture: ComponentFixture<DeploymentShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeploymentShellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymentShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
