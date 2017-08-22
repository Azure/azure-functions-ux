import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduVsoDashboardComponent} from './kudu-vso-dashboard.component';

describe('KuduVsoDashboardComponent', () => {
  let component: KuduVsoDashboardComponent;
  let fixture: ComponentFixture<KuduVsoDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduVsoDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduVsoDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
