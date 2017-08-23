import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduDashboardComponent } from './kudu-dashboard.component';

describe('KuduGitMercurialDashboardComponent', () => {
  let component: KuduDashboardComponent;
  let fixture: ComponentFixture<KuduDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
