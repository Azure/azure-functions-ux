import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebDeployDashboardComponent } from './web-deploy-dashboard.component';

describe('WebDeployDashboardComponent', () => {
  let component: WebDeployDashboardComponent;
  let fixture: ComponentFixture<WebDeployDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebDeployDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebDeployDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
