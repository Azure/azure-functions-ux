import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduGitMercurialDashboardComponent } from './kudu-git-mercurial-dashboard.component';

describe('KuduGitMercurialDashboardComponent', () => {
  let component: KuduGitMercurialDashboardComponent;
  let fixture: ComponentFixture<KuduGitMercurialDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduGitMercurialDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduGitMercurialDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
