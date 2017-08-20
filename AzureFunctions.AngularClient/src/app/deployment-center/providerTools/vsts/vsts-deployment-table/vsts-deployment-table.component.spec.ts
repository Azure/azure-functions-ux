import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VstsDeploymentTableComponent } from './vsts-deployment-table.component';

describe('VstsDeploymentTableComponent', () => {
  let component: VstsDeploymentTableComponent;
  let fixture: ComponentFixture<VstsDeploymentTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VstsDeploymentTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VstsDeploymentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
