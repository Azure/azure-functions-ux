import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentDetailComponent } from './deployment-detail.component';

describe('DeploymentDetailComponent', () => {
  let component: DeploymentDetailComponent;
  let fixture: ComponentFixture<DeploymentDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeploymentDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
