import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentSlotsShellComponent } from './deployment-slots-shell.component';

describe('DeploymentSlotsShellComponent', () => {
  let component: DeploymentSlotsShellComponent;
  let fixture: ComponentFixture<DeploymentSlotsShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeploymentSlotsShellComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymentSlotsShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
