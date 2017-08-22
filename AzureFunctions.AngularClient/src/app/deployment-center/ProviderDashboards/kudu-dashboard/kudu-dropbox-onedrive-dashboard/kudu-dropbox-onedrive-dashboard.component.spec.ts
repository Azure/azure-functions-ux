import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduDropboxOnedriveDashboardComponent } from './kudu-dropbox-onedrive-dashboard.component';

describe('KuduDropboxOnedriveDashboardComponent', () => {
  let component: KuduDropboxOnedriveDashboardComponent;
  let fixture: ComponentFixture<KuduDropboxOnedriveDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduDropboxOnedriveDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduDropboxOnedriveDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
