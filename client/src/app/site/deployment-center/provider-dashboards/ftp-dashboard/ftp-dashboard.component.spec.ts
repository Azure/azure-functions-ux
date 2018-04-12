import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtpDashboardComponent } from './ftp-dashboard.component';

describe('FtpDashboardComponent', () => {
  let component: FtpDashboardComponent;
  let fixture: ComponentFixture<FtpDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtpDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtpDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
